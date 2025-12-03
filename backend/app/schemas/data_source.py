from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID

class DataSourceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    type: str = Field(..., pattern="^(csv|google_sheets|api|database)$")

class DataSourceCreate(DataSourceBase):
    connection_info: Optional[Dict[str, Any]] = None

class DataSourceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    status: Optional[str] = Field(None, pattern="^(connected|syncing|error|disconnected)$")

class ColumnInfo(BaseModel):
    name: str
    type: str
    nullable: bool = True

class DataSource(DataSourceBase):
    id: UUID
    user_id: UUID
    status: str
    file_path: Optional[str] = None
    row_count: Optional[int] = None
    file_size: Optional[int] = None
    columns_info: Optional[List[ColumnInfo]] = None
    created_at: datetime
    updated_at: datetime
    last_synced_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class DataSourcePublic(BaseModel):
    id: UUID
    name: str
    type: str
    status: str
    row_count: Optional[int] = None
    file_size: Optional[int] = None
    created_at: datetime
    last_synced_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True