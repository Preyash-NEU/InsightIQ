from app.utils.validators import DataValidator
import logging
logger = logging.getLogger(__name__)
from app.utils.file_parsers import FileParser
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile
from typing import List, Optional
import pandas as pd
import os
from datetime import datetime
from uuid import UUID
import json

from app.models.data_source import DataSource
from app.models.user import User
from app.schemas.data_source import DataSourceCreate, DataSourceUpdate
from app.config import settings

class DataSourceService:
    """Service for handling data source operations."""
    
    @staticmethod
    async def upload_file(
        db: Session,
        user: User,
        file: UploadFile,
        name: Optional[str] = None,
        sheet_name: Optional[str] = None
    ) -> DataSource:
        """
        Upload and process a data file (CSV, Excel, JSON, Parquet, etc.).
        
        Args:
            db: Database session
            user: Current user
            file: Uploaded file
            name: Optional custom name for the data source
            sheet_name: Optional Excel sheet name
            
        Returns:
            Created DataSource object
        """
        # Get file type
        file_type = FileParser.get_file_type(file.filename)
        
        if file_type not in FileParser.SUPPORTED_FORMATS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type. Supported: {', '.join(FileParser.SUPPORTED_FORMATS.keys())}"
            )
        
        # Read file content
        try:
            contents = await file.read()
            
            # Check file size
            file_size = len(contents)
            max_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024
            if file_size > max_size:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB"
                )
            
            # Parse file with appropriate parser
            df = FileParser.parse_file(file.filename, contents, sheet_name=sheet_name)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error processing file {file.filename}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error processing file: {str(e)}"
            )
        
        # Validate structure
        is_valid, issues = DataValidator.validate_csv_structure(df)
        if not is_valid:
            logger.warning(f"File validation issues for {file.filename}: {issues}")
        
        # Extract metadata with enhanced type detection
        row_count = len(df)
        columns_info = DataValidator.infer_column_types(df)
        quality_report = DataValidator.get_data_quality_report(df)
        
        logger.info(f"Data quality report for {file.filename}: {quality_report}")
        
        # Create storage directory
        upload_dir = os.path.join(settings.UPLOAD_DIR, str(user.id))
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(upload_dir, safe_filename)
        
        # Save file to disk
        with open(file_path, 'wb') as f:
            f.write(contents)
        
        # Determine data source type from file extension
        type_mapping = {
            '.csv': 'csv',
            '.xlsx': 'excel',
            '.xls': 'excel',
            '.json': 'json',
            '.parquet': 'parquet',
            '.txt': 'tsv',
            '.tsv': 'tsv'
        }
        source_type = type_mapping.get(file_type, 'file')
        
        # Create database record
        data_source_name = name or file.filename.rsplit('.', 1)[0]
        
        new_data_source = DataSource(
            user_id=user.id,
            name=data_source_name,
            type=source_type,
            status="connected",
            file_path=file_path,
            row_count=row_count,
            file_size=file_size,
            columns_info=columns_info,
            connection_info=quality_report
        )
        
        db.add(new_data_source)
        db.commit()
        db.refresh(new_data_source)
        
        logger.info(f"Successfully uploaded {source_type} file: {data_source_name}")
        
        return new_data_source
    
    @staticmethod
    def get_data_sources(
        db: Session,
        user: User,
        skip: int = 0,
        limit: int = 100
    ) -> List[DataSource]:
        """Get all data sources for a user."""
        return db.query(DataSource)\
            .filter(DataSource.user_id == user.id)\
            .offset(skip)\
            .limit(limit)\
            .all()
    
    @staticmethod
    def get_data_source(
        db: Session,
        user: User,
        data_source_id: UUID
    ) -> DataSource:
        """Get a single data source by ID."""
        data_source = db.query(DataSource)\
            .filter(
                DataSource.id == data_source_id,
                DataSource.user_id == user.id
            )\
            .first()
        
        if not data_source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Data source not found"
            )
        
        return data_source
    
    @staticmethod
    def delete_data_source(
        db: Session,
        user: User,
        data_source_id: UUID
    ) -> dict:
        """Delete a data source."""
        data_source = DataSourceService.get_data_source(db, user, data_source_id)
        
        # Delete file from disk if it exists
        if data_source.file_path and os.path.exists(data_source.file_path):
            try:
                os.remove(data_source.file_path)
            except Exception as e:
                print(f"Warning: Could not delete file {data_source.file_path}: {e}")
        
        # Delete from database
        db.delete(data_source)
        db.commit()
        
        return {"message": "Data source deleted successfully"}
    
    @staticmethod
    def get_preview(
        db: Session,
        user: User,
        data_source_id: UUID,
        limit: int = 100
    ) -> dict:
        """Get preview of data source (first N rows) - supports all file types."""
        data_source = DataSourceService.get_data_source(db, user, data_source_id)
        
        if not data_source.file_path or not os.path.exists(data_source.file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Data file not found"
            )
        
        try:
            # Read file based on type
            with open(data_source.file_path, 'rb') as f:
                content = f.read()
            
            # Get original filename from path
            filename = os.path.basename(data_source.file_path)
            
            # Parse with FileParser
            df = FileParser.parse_file(filename, content)
            
            # Limit rows
            df = df.head(limit)
            
            # IMPORTANT: Replace NaN with None for JSON serialization
            df = df.replace({pd.NA: None, pd.NaT: None})
            df = df.where(pd.notnull(df), None)
            
            # Convert to dictionary format
            preview_data = {
                "columns": df.columns.tolist(),
                "rows": df.to_dict(orient='records'),
                "total_rows": data_source.row_count,
                "preview_rows": len(df),
                "file_type": data_source.type
            }
            
            return preview_data
            
        except Exception as e:
            logger.error(f"Error previewing data: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error reading data file: {str(e)}"
            )
    
    @staticmethod
    def update_data_source(
        db: Session,
        user: User,
        data_source_id: UUID,
        update_data: DataSourceUpdate
    ) -> DataSource:
        """Update data source metadata."""
        data_source = DataSourceService.get_data_source(db, user, data_source_id)
        
        # Update fields
        if update_data.name is not None:
            data_source.name = update_data.name
        
        if update_data.status is not None:
            data_source.status = update_data.status
        
        db.commit()
        db.refresh(data_source)
        
        return data_source
    
    @staticmethod
    async def get_excel_sheets(file: UploadFile) -> dict:
        """
        Get list of sheets from an Excel file.
        
        Args:
            file: Excel file
            
        Returns:
            Dictionary with sheet names
        """
        file_type = FileParser.get_file_type(file.filename)
        
        if file_type not in ['.xlsx', '.xls']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an Excel file (.xlsx or .xls)"
            )
        
        try:
            contents = await file.read()
            sheets = FileParser.get_excel_sheets(contents)
            return {
                "filename": file.filename,
                "sheets": sheets,
                "sheet_count": len(sheets)
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to read Excel file: {str(e)}"
            )