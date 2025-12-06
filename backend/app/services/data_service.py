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
    async def upload_csv(
        db: Session,
        user: User,
        file: UploadFile,
        name: Optional[str] = None
    ) -> DataSource:
        """
        Upload and process a CSV file.
        
        Args:
            db: Database session
            user: Current user
            file: Uploaded CSV file
            name: Optional custom name for the data source
            
        Returns:
            Created DataSource object
        """
        # Validate file type
        if not file.filename.endswith('.csv'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only CSV files are allowed"
            )
        
        # Read file content
        try:
            contents = await file.read()
            
            # Check file size (max 100MB)
            file_size = len(contents)
            max_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024  # Convert to bytes
            if file_size > max_size:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB"
                )
            
            # Parse CSV with pandas
            df = pd.read_csv(pd.io.common.BytesIO(contents))
            
        except pd.errors.EmptyDataError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CSV file is empty"
            )
        except pd.errors.ParserError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid CSV format"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error reading CSV file: {str(e)}"
            )
        
        # Extract metadata
        row_count = len(df)
        columns_info = []
        
        for col in df.columns:
            dtype = str(df[col].dtype)
            columns_info.append({
                "name": col,
                "type": dtype,
                "null_count": int(df[col].isnull().sum()),
                "unique_count": int(df[col].nunique())
            })
        
        # Create storage directory if it doesn't exist
        upload_dir = os.path.join(settings.UPLOAD_DIR, str(user.id))
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(upload_dir, safe_filename)
        
        # Save file to disk
        with open(file_path, 'wb') as f:
            f.write(contents)
        
        # Create database record
        data_source_name = name or file.filename.replace('.csv', '')
        
        new_data_source = DataSource(
            user_id=user.id,
            name=data_source_name,
            type="csv",
            status="connected",
            file_path=file_path,
            row_count=row_count,
            file_size=file_size,
            columns_info=columns_info
        )
        
        db.add(new_data_source)
        db.commit()
        db.refresh(new_data_source)
        
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
        """Get preview of data source (first N rows)."""
        data_source = DataSourceService.get_data_source(db, user, data_source_id)
        
        if data_source.type != "csv":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Preview only available for CSV files currently"
            )
        
        if not data_source.file_path or not os.path.exists(data_source.file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Data file not found"
            )
        
        try:
            # Read CSV file
            df = pd.read_csv(data_source.file_path, nrows=limit)
            
            # Convert to dictionary format
            preview_data = {
                "columns": df.columns.tolist(),
                "rows": df.to_dict(orient='records'),
                "total_rows": data_source.row_count,
                "preview_rows": len(df)
            }
            
            return preview_data
            
        except Exception as e:
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