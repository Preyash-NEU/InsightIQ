from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.models.user import User
from app.models.dataset import Dataset
from app.schemas.dataset import DatasetCreate, DatasetResponse, DatasetListResponse, DatasetPreview
from app.core.security import get_current_user
from app.utils.csv_parser import CSVParser
from app.services.data_ingestion import DataIngestionService

router = APIRouter()


@router.post("", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
async def upload_dataset(
    file: UploadFile = File(...),
    name: str = Form(...),
    description: str = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    df, file_metadata = await CSVParser.parse_upload(file)
    columns_metadata = CSVParser.get_column_metadata(df)
    table_name = DataIngestionService.generate_table_name()
    
    dataset = Dataset(
        owner_id=current_user.id,
        name=name,
        description=description,
        table_name=table_name,
        row_count=len(df),
        columns=columns_metadata,
        original_filename=file_metadata["original_filename"],
        file_size_bytes=file_metadata["file_size_bytes"]
    )
    
    db.add(dataset)
    db.flush()
    
    await DataIngestionService.ingest_dataframe(df, dataset, db)
    
    db.commit()
    db.refresh(dataset)
    
    return dataset


@router.get("", response_model=List[DatasetListResponse])
async def list_datasets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    datasets = db.query(Dataset).filter(
        Dataset.owner_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    response = []
    for ds in datasets:
        response.append({
            "id": ds.id,
            "name": ds.name,
            "description": ds.description,
            "row_count": ds.row_count,
            "column_count": len(ds.columns),
            "created_at": ds.created_at
        })
    
    return response


@router.get("/{dataset_id}", response_model=DatasetResponse)
async def get_dataset(
    dataset_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.owner_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    return dataset


@router.get("/{dataset_id}/preview", response_model=DatasetPreview)
async def preview_dataset(
    dataset_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50
):
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.owner_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    preview = await DataIngestionService.get_preview(dataset.table_name, db, limit)
    return preview


@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dataset(
    dataset_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.owner_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    await DataIngestionService.delete_table(dataset.table_name, db)
    
    db.delete(dataset)
    db.commit()
    
    return None