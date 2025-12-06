from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.db.session import get_db
from app.models.user import User
from app.schemas.data_source import DataSource, DataSourceCreate, DataSourceUpdate
from app.services.data_service import DataSourceService
from app.api.deps import get_current_active_user

router = APIRouter()


@router.post("/upload-csv", response_model=DataSource, status_code=status.HTTP_201_CREATED)
async def upload_csv(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload a CSV file as a data source.
    
    - **file**: CSV file to upload (max 100MB)
    - **name**: Optional custom name for the data source
    
    Returns the created data source with metadata.
    """
    return await DataSourceService.upload_csv(db, current_user, file, name)


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