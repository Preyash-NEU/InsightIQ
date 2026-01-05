from app.services.data_pipeline import DataPipeline

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
    
    pipeline = DataPipeline(settings.STORAGE_PATH)
    
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
        
        MODIFIED: Now processes through pipeline for enhanced quality
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
            
            # Parse file with appropriate parser (KEEP: for initial validation)
            df = FileParser.parse_file(file.filename, contents, sheet_name=sheet_name)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error processing file {file.filename}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error processing file: {str(e)}"
            )
        
        # Validate structure (KEEP: for backward compatibility)
        is_valid, issues = DataValidator.validate_csv_structure(df)
        if not is_valid:
            logger.warning(f"File validation issues for {file.filename}: {issues}")
        
        # Extract basic metadata (KEEP: for fallback if pipeline fails)
        row_count = len(df)
        columns_info_basic = DataValidator.infer_column_types(df)
        quality_report_basic = DataValidator.get_data_quality_report(df)
        
        logger.info(f"Basic quality report for {file.filename}: {quality_report_basic}")
        
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
        
        pipeline_report = None
        quality_score = None
        quality_level = None
        cleaned_path = None
        preview_path = None
        column_mapping = None
        column_stats = None
        processing_duration = None
        
        if settings.USE_PIPELINE_BY_DEFAULT:
            try:
                logger.info(f"🚀 Running pipeline for {file.filename}")
                
                # Generate unique source ID
                import uuid
                source_id = str(uuid.uuid4())
                
                # Run full pipeline
                pipeline_report = DataSourceService.pipeline.process(
                    file_path=file_path,
                    source_type=source_type,
                    source_id=source_id,
                    sheet_name=0
                )
                
                if pipeline_report['success']:
                    # Use enhanced metadata from pipeline
                    row_count = pipeline_report['final_stats']['rows']
                    quality_score = pipeline_report['final_stats']['quality_score']
                    quality_level = pipeline_report['final_stats']['quality_level']
                    processing_duration = pipeline_report['duration_seconds']
                    
                    # Extract paths
                    layer7 = pipeline_report['layers']['layer7']
                    cleaned_path = layer7['storage']['parquet_path']
                    preview_path = layer7['storage']['preview_path']
                    
                    # Extract column mapping
                    layer3 = pipeline_report['layers']['layer3']
                    column_mapping = layer3['column_mapping']
                    
                    # Extract column stats
                    column_stats = layer7['column_stats']
                    
                    # Extract enhanced columns_info
                    columns_info = []
                    layer4 = pipeline_report['layers']['layer4']
                    for col, info in layer4['type_info'].items():
                        columns_info.append({
                            'name': col,
                            'type': info['detected_type'],
                            'original_dtype': info['original_dtype'],
                            'final_dtype': info['final_dtype']
                        })
                    
                    logger.info(f"✅ Pipeline complete: quality {quality_score}, duration {processing_duration}s")
                    
                else:
                    # Pipeline failed, use basic metadata
                    logger.warning(f"⚠️ Pipeline failed: {pipeline_report.get('error')}")
                    columns_info = columns_info_basic
                    pipeline_report = None
                    
            except Exception as e:
                logger.error(f"❌ Pipeline error: {str(e)}", exc_info=True)
                # Fallback to basic metadata
                columns_info = columns_info_basic
                pipeline_report = None
        else:
            # Pipeline disabled, use basic metadata
            logger.info("Pipeline disabled, using basic metadata")
            columns_info = columns_info_basic
        
        # Create database record (MODIFIED: added new fields)
        data_source_name = name or file.filename.rsplit('.', 1)[0]
        
        new_data_source = DataSource(
            id=source_id if pipeline_report else uuid.uuid4(),  # NEW: Use pipeline source_id if available
            user_id=user.id,
            name=data_source_name,
            type=source_type,
            status="connected",
            file_path=file_path,
            row_count=row_count,
            file_size=file_size,
            columns_info=columns_info,
            connection_info=quality_report_basic,  # Keep for backward compatibility
            # NEW: Pipeline fields
            processing_report=pipeline_report,
            quality_score=quality_score,
            quality_level=quality_level,
            column_mapping=column_mapping,
            column_stats=column_stats,
            cleaned_path=cleaned_path,
            preview_path=preview_path,
            processing_duration_seconds=processing_duration,
            last_processed_at=datetime.utcnow() if pipeline_report else None
        )
        
        db.add(new_data_source)
        db.commit()
        db.refresh(new_data_source)
        
        logger.info(f"✅ Successfully uploaded {source_type} file: {data_source_name}")
        
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
        
        if data_source.cleaned_path and os.path.exists(data_source.cleaned_path):
            try:
                os.remove(data_source.cleaned_path)
                logger.info(f"Deleted cleaned file: {data_source.cleaned_path}")
            except Exception as e:
                logger.warning(f"Could not delete cleaned file: {e}")
        
        if data_source.preview_path and os.path.exists(data_source.preview_path):
            try:
                os.remove(data_source.preview_path)
                logger.info(f"Deleted preview file: {data_source.preview_path}")
            except Exception as e:
                logger.warning(f"Could not delete preview file: {e}")
        
        # Delete original file if it exists
        if data_source.file_path and os.path.exists(data_source.file_path):
            try:
                os.remove(data_source.file_path)
                logger.info(f"Deleted original file: {data_source.file_path}")
            except Exception as e:
                logger.warning(f"Could not delete file {data_source.file_path}: {e}")
        
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
        """
        Get preview of data source (first N rows).
        
        MODIFIED: Now uses cached preview if available (10x faster!)
        """
        data_source = DataSourceService.get_data_source(db, user, data_source_id)
        
        if data_source.preview_path and os.path.exists(data_source.preview_path):
            logger.info(f"📦 Using cached preview for {data_source_id}")
            try:
                df = pd.read_parquet(data_source.preview_path)
                df = df.head(limit)
                
                # IMPORTANT: Replace NaN with None for JSON
                df = df.replace({pd.NA: None, pd.NaT: None})
                df = df.where(pd.notnull(df), None)
                
                return {
                    "columns": df.columns.tolist(),
                    "rows": df.to_dict(orient='records'),
                    "total_rows": data_source.row_count,
                    "preview_rows": len(df),
                    "file_type": data_source.type,
                    "from_cache": True,  # NEW: Indicates cached preview
                    "quality_score": data_source.quality_score  # NEW: Include quality
                }
            except Exception as e:
                logger.warning(f" Failed to load cached preview, falling back: {e}")
        
        # FALLBACK: Load from original file (SLOWER - backward compatibility)
        logger.info(f" Loading preview from original file for {data_source_id}")
        
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
                "file_type": data_source.type,
                "from_cache": False  # NEW: Indicates loaded from original
            }
            
            return preview_data
            
        except Exception as e:
            logger.error(f"Error previewing data: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error reading data file: {str(e)}"
            )
    
    # NEW METHOD: Get data for AI queries (uses cleaned Parquet)
    @staticmethod
    def get_data_for_query(
        db: Session,
        user: User,
        data_source_id: UUID
    ) -> pd.DataFrame:
        """
        Get data for querying (uses cleaned Parquet if available).
        
        NEW METHOD: AI queries should call this instead of loading original file.
        This gives them:
        - Cleaned data (missing values handled)
        - Normalized column names (no special characters)
        - Proper types (dates, currency, booleans)
        - Fast loading (Parquet vs CSV)
        """
        data_source = DataSourceService.get_data_source(db, user, data_source_id)
        
        # Try to use cleaned Parquet first (FAST - 10x faster than CSV)
        if data_source.cleaned_path and os.path.exists(data_source.cleaned_path):
            logger.info(f" Loading cleaned data from Parquet: {data_source_id}")
            try:
                df = pd.read_parquet(data_source.cleaned_path)
                logger.info(f" Loaded {len(df)} rows, {len(df.columns)} columns from Parquet")
                return df
            except Exception as e:
                logger.warning(f" Failed to load Parquet, falling back to original: {e}")
        
        # Fallback: Load original file (SLOWER - backward compatibility)
        logger.info(f" Loading original file for {data_source_id}")
        
        if not data_source.file_path or not os.path.exists(data_source.file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Data file not found"
            )
        
        try:
            with open(data_source.file_path, 'rb') as f:
                content = f.read()
            
            filename = os.path.basename(data_source.file_path)
            df = FileParser.parse_file(filename, content)
            
            logger.info(f" Loaded {len(df)} rows from original file")
            return df
            
        except Exception as e:
            logger.error(f" Error loading data: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error loading data: {str(e)}"
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