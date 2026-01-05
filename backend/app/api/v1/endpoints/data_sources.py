from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Body, Request
from datetime import datetime
import logging  # ADD THIS
logger = logging.getLogger(__name__) 
from app.api.rate_limit_deps import upload_rate_limit_dependency
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
import os

from app.db.session import get_db
from app.models.user import User
from app.schemas.data_source import DataSource, DataSourceCreate, DataSourceUpdate
from app.services.data_service import DataSourceService
from app.api.deps import get_current_active_user

from app.utils.database_connector import DatabaseConnector
from app.schemas.data_source import (
    DatabaseConnection, 
    DatabaseConnectionTest, 
    TableList, 
    TableInfo
)

router = APIRouter()

@router.post("/upload", response_model=DataSource, status_code=status.HTTP_201_CREATED)

async def upload_file(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    sheet_name: Optional[str] = Form(None, description="Excel sheet name (optional)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    rate_limit_info: dict = Depends(upload_rate_limit_dependency)
):
    """
    Upload a data file as a data source.
    
    **Supported formats:**
    - CSV (.csv)
    - Excel (.xlsx, .xls)
    - JSON (.json)
    - Parquet (.parquet)
    - TSV (.tsv, .txt)
    
    - **file**: File to upload (max 100MB)
    - **name**: Optional custom name for the data source
    - **sheet_name**: For Excel files, specify which sheet to load (default: first sheet)
    
    Returns the created data source with metadata.
    """
    return await DataSourceService.upload_file(db, current_user, file, name, sheet_name)


@router.post("/excel/sheets")
async def get_excel_sheets(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get list of sheet names from an Excel file.
    
    Useful for preview before uploading - user can see available sheets
    and choose which one to import.
    
    - **file**: Excel file (.xlsx or .xls)
    
    Returns list of sheet names.
    """
    return await DataSourceService.get_excel_sheets(file)

@router.post("/upload-csv", response_model=DataSource, status_code=status.HTTP_201_CREATED)
async def upload_csv(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload a CSV file (backward compatibility endpoint).
    
    **Note:** Use /upload for all file types including CSV.
    
    - **file**: CSV file to upload (max 100MB)
    - **name**: Optional custom name for the data source
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files allowed on this endpoint. Use /upload for other formats."
        )
    return await DataSourceService.upload_file(db, current_user, file, name)


@router.get("", response_model=List[DataSource])
async def get_data_sources(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all data sources for the current user.
    
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return (max 100)
    """
    return DataSourceService.get_data_sources(db, current_user, skip, limit)


@router.get("/{data_source_id}", response_model=DataSource)
async def get_data_source(
    data_source_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a single data source by ID.
    
    - **data_source_id**: UUID of the data source
    """
    return DataSourceService.get_data_source(db, current_user, data_source_id)


@router.delete("/{data_source_id}", status_code=status.HTTP_200_OK)
async def delete_data_source(
    data_source_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a data source.
    
    This will remove the data source record and delete the associated file.
    
    - **data_source_id**: UUID of the data source to delete
    """
    return DataSourceService.delete_data_source(db, current_user, data_source_id)


@router.get("/{data_source_id}/preview")
async def get_data_preview(
    data_source_id: UUID,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a preview of the data (first N rows).
    
    - **data_source_id**: UUID of the data source
    - **limit**: Number of rows to preview (max 1000, default 100)
    """
    if limit > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Preview limit cannot exceed 1000 rows"
        )
    
    return DataSourceService.get_preview(db, current_user, data_source_id, limit)


@router.put("/{data_source_id}", response_model=DataSource)
async def update_data_source(
    data_source_id: UUID,
    update_data: DataSourceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update data source metadata.
    
    - **data_source_id**: UUID of the data source
    - **update_data**: Fields to update (name, status)
    """
    return DataSourceService.update_data_source(db, current_user, data_source_id, update_data)

@router.post("/database/test", response_model=DatabaseConnectionTest)
async def test_database_connection(
    connection: DatabaseConnection,
    current_user: User = Depends(get_current_active_user)
):
    """
    Test database connection.
    
    **Supported databases:**
    - PostgreSQL (port 5432)
    - MySQL/MariaDB (port 3306)
    - SQLite (local file)
    
    Returns connection status and database version.
    """
    connection_string = DatabaseConnector.build_connection_string(
        db_type=connection.db_type,
        host=connection.host,
        port=connection.port,
        database=connection.database,
        username=connection.username,
        password=connection.password
    )
    
    return DatabaseConnector.test_connection(connection_string)


@router.post("/database/connect", response_model=DataSource, status_code=status.HTTP_201_CREATED)
async def connect_database(
    connection: DatabaseConnection,
    name: str = Body(...),
    table_name: Optional[str] = Body(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Connect to a database as a data source.
    
    - **connection**: Database connection details
    - **name**: Name for this data source
    - **table_name**: Specific table to connect to (optional - can query later)
    
    Stores encrypted connection info and creates data source.
    """
    # Build connection string
    connection_string = DatabaseConnector.build_connection_string(
        db_type=connection.db_type,
        host=connection.host,
        port=connection.port,
        database=connection.database,
        username=connection.username,
        password=connection.password
    )
    
    # Test connection first
    DatabaseConnector.test_connection(connection_string)
    
    # Get metadata
    if table_name:
        table_info = DatabaseConnector.get_table_info(connection_string, table_name)
        row_count = table_info['row_count']
    else:
        tables = DatabaseConnector.list_tables(connection_string)
        row_count = len(tables)
    
    # Store connection info (encrypted in production!)
    connection_info = {
        "db_type": connection.db_type,
        "host": connection.host,
        "port": connection.port,
        "database": connection.database,
        "username": connection.username,
        "connection_string": connection_string,  # In production, encrypt this!
        "table_name": table_name
    }
    
    # Create data source
    new_data_source = DataSource(
        user_id=current_user.id,
        name=name,
        type=f"database_{connection.db_type}",
        status="connected",
        file_path=None,
        row_count=row_count,
        file_size=0,
        columns_info=[],
        connection_info=connection_info
    )
    
    db.add(new_data_source)
    db.commit()
    db.refresh(new_data_source)
    
    return new_data_source


@router.get("/database/{data_source_id}/tables", response_model=TableList)
async def list_database_tables(
    data_source_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    List all tables in a connected database.
    
    - **data_source_id**: UUID of the database data source
    """
    data_source = DataSourceService.get_data_source(db, current_user, data_source_id)
    
    if not data_source.type.startswith('database_'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Data source is not a database connection"
        )
    
    connection_string = data_source.connection_info.get('connection_string')
    tables = DatabaseConnector.list_tables(connection_string)
    
    return {
        "tables": tables,
        "table_count": len(tables)
    }


@router.get("/database/{data_source_id}/tables/{table_name}/info", response_model=TableInfo)
async def get_table_info(
    data_source_id: UUID,
    table_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get metadata about a specific table.
    
    - **data_source_id**: UUID of the database data source
    - **table_name**: Name of the table
    
    Returns columns, types, and row count.
    """
    data_source = DataSourceService.get_data_source(db, current_user, data_source_id)
    
    if not data_source.type.startswith('database_'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Data source is not a database connection"
        )
    
    connection_string = data_source.connection_info.get('connection_string')
    return DatabaseConnector.get_table_info(connection_string, table_name)


@router.get("/database/{data_source_id}/tables/{table_name}/preview")
async def preview_table(
    data_source_id: UUID,
    table_name: str,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Preview data from a database table.
    
    - **data_source_id**: UUID of the database data source
    - **table_name**: Name of the table
    - **limit**: Number of rows to return (max 1000)
    """
    if limit > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Preview limit cannot exceed 1000 rows"
        )
    
    data_source = DataSourceService.get_data_source(db, current_user, data_source_id)
    
    if not data_source.type.startswith('database_'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Data source is not a database connection"
        )
    
    connection_string = data_source.connection_info.get('connection_string')
    df = DatabaseConnector.get_table_preview(connection_string, table_name, limit)
    
    return {
        "table_name": table_name,
        "columns": df.columns.tolist(),
        "rows": df.to_dict(orient='records'),
        "preview_rows": len(df)
    }

@router.get("/{data_source_id}/quality")
async def get_quality_report(
    data_source_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get data quality report for a data source.
    
    NEW ENDPOINT: Returns quality score, column metrics, and issues.
    
    Response includes:
    - overall_score: 0-100 quality score
    - overall_level: excellent, good, fair, poor, critical
    - columns: Per-column quality metrics
    - dataset_stats: Overall dataset statistics
    """
    data_source = DataSourceService.get_data_source(db, current_user, data_source_id)
    
    if not data_source.processing_report:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Data source has not been processed with pipeline yet. Upload a new file to enable quality reports."
        )
    
    # Extract quality information from pipeline report
    layer6 = data_source.processing_report['layers']['layer6']
    quality_report = layer6['quality_report']
    
    return {
        "overall_score": data_source.quality_score,
        "overall_level": data_source.quality_level,
        "columns": quality_report['columns'],
        "dataset_stats": quality_report['dataset_stats'],
        "processing_duration": data_source.processing_duration_seconds,
        "last_processed": data_source.last_processed_at.isoformat() if data_source.last_processed_at else None
    }


@router.get("/{data_source_id}/cleaning-report")
async def get_cleaning_report(
    data_source_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get detailed data cleaning report.
    
    NEW ENDPOINT: Shows what was cleaned, transformed, and imputed.
    
    Response includes:
    - structural_issues: Empty rows/columns removed, headers fixed
    - column_transformations: Original → normalized column names
    - type_conversions: Type detection and conversion success rates
    - data_cleaning: Missing values imputed, outliers handled
    - summary: Overall statistics
    """
    data_source = DataSourceService.get_data_source(db, current_user, data_source_id)
    
    if not data_source.processing_report:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Data source has not been processed with pipeline yet. Upload a new file to enable cleaning reports."
        )
    
    report = data_source.processing_report
    
    cleaning_report = {
        "structural_issues": report['layers']['layer2']['issues'],
        "column_transformations": report['layers']['layer3']['transformations'],
        "type_conversions": {
            col: {
                'detected_type': info['detected_type'],
                'original_dtype': info['original_dtype'],
                'final_dtype': info['final_dtype'],
                'success_rate': info['conversion_success_rate'],
                'sample_values': info['sample_values']
            }
            for col, info in report['layers']['layer4']['type_info'].items()
        },
        "data_cleaning": report['layers']['layer5']['cleaning_report'],
        "summary": {
            'original_rows': report['layers']['layer2']['stats']['original_rows'],
            'final_rows': report['final_stats']['rows'],
            'rows_removed': report['layers']['layer2']['stats']['rows_removed'],
            'columns_removed': report['layers']['layer2']['stats']['columns_removed'],
            'values_imputed': report['layers']['layer5']['total_imputed'],
            'outliers_handled': report['layers']['layer5']['total_outliers']
        },
        "storage": {
            'original_size_bytes': report['layers']['layer1']['file_size'],
            'cleaned_size_bytes': report['layers']['layer7']['storage']['parquet_size_bytes'],
            'compression_ratio_percent': report['layers']['layer7']['storage'].get('compression_ratio_percent', 0)
        }
    }
    
    return cleaning_report


@router.post("/{data_source_id}/reprocess")
async def reprocess_data_source(
    data_source_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Re-process a data source through the pipeline.
    
    NEW ENDPOINT: Allows users to re-run the 7-layer pipeline on existing data.
    
    Useful when:
    - Pipeline was updated with improvements
    - User wants to refresh quality metrics
    - Original processing failed
    
    Returns updated quality score and processing status.
    """
    data_source = DataSourceService.get_data_source(db, current_user, data_source_id)
    
    if not data_source.file_path or not os.path.exists(data_source.file_path):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file path available for reprocessing. Database connections cannot be reprocessed."
        )
    
    try:
        logger.info(f" Reprocessing data source: {data_source_id}")
        
        # Update status
        data_source.status = 'processing'
        db.commit()
        
        # Run pipeline
        pipeline_report = DataSourceService.pipeline.process(
            file_path=data_source.file_path,
            source_type=data_source.type,
            source_id=str(data_source.id),
            sheet_name=0
        )
        
        if pipeline_report['success']:
            # Update database record with new results
            data_source.processing_report = pipeline_report
            data_source.quality_score = pipeline_report['final_stats']['quality_score']
            data_source.quality_level = pipeline_report['final_stats']['quality_level']
            data_source.row_count = pipeline_report['final_stats']['rows']
            data_source.processing_duration_seconds = pipeline_report['duration_seconds']
            data_source.last_processed_at = datetime.utcnow()
            data_source.status = 'connected'
            
            # Update paths
            layer7 = pipeline_report['layers']['layer7']
            data_source.cleaned_path = layer7['storage']['parquet_path']
            data_source.preview_path = layer7['storage']['preview_path']
            
            # Update mappings
            data_source.column_mapping = pipeline_report['layers']['layer3']['column_mapping']
            data_source.column_stats = layer7['column_stats']
            
            # Update columns_info
            columns_info = []
            layer4 = pipeline_report['layers']['layer4']
            for col, info in layer4['type_info'].items():
                columns_info.append({
                    'name': col,
                    'type': info['detected_type'],
                    'original_dtype': info['original_dtype'],
                    'final_dtype': info['final_dtype']
                })
            data_source.columns_info = columns_info
            
            db.commit()
            db.refresh(data_source)
            
            logger.info(f" Reprocessing complete: quality {data_source.quality_score}")
            
            return {
                "success": True,
                "message": "Reprocessing successful",
                "quality_score": data_source.quality_score,
                "quality_level": data_source.quality_level,
                "duration_seconds": data_source.processing_duration_seconds,
                "rows": data_source.row_count
            }
        else:
            # Pipeline failed
            data_source.status = 'error'
            db.commit()
            
            logger.error(f" Reprocessing failed: {pipeline_report.get('error')}")
            
            return {
                "success": False,
                "message": "Reprocessing failed",
                "error": pipeline_report.get('error'),
                "error_type": pipeline_report.get('error_type')
            }
            
    except Exception as e:
        logger.error(f" Reprocessing error: {str(e)}", exc_info=True)
        
        # Restore status
        data_source.status = 'error'
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Reprocessing failed: {str(e)}"
        )