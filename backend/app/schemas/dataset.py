from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class ColumnInfo(BaseModel):
    name: str
    dtype: str
    null_count: int = 0
    unique_count: Optional[int] = None
    min_value: Optional[Any] = None
    max_value: Optional[Any] = None
    sample_values: Optional[List[Any]] = None


class DatasetCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None


class DatasetUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None


class DatasetResponse(BaseModel):
    id: UUID
    owner_id: UUID
    name: str
    description: Optional[str]
    table_name: str
    row_count: int
    columns: List[Dict[str, Any]]
    original_filename: Optional[str]
    file_size_bytes: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DatasetListResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    row_count: int
    column_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class DatasetPreview(BaseModel):
    columns: List[str]
    rows: List[Dict[str, Any]]
    total_rows: int
    showing_rows: int