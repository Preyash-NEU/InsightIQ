from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID

class DataSourceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    type: str = Field(..., pattern="^(csv|excel|json|parquet|tsv|google_sheets|api|database|database_postgresql|database_mysql|database_sqlite)$")

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

class DatabaseConnection(BaseModel):
    """Schema for database connection."""
    db_type: str = Field(..., description="Database type: postgresql, mysql, sqlite")
    host: str = Field(..., description="Database host")
    port: int = Field(..., description="Database port")
    database: str = Field(..., description="Database name")
    username: str = Field(..., description="Database username")
    password: str = Field(..., description="Database password")
    
    @validator('db_type')
    def validate_db_type(cls, v):
        allowed = ['postgresql', 'mysql', 'sqlite']
        if v not in allowed:
            raise ValueError(f"db_type must be one of: {', '.join(allowed)}")
        return v

class DatabaseConnectionTest(BaseModel):
    """Response for connection test."""
    status: str
    message: str
    version: Optional[str] = None

class TableList(BaseModel):
    """List of database tables."""
    tables: List[str]
    table_count: int

class TableInfo(BaseModel):
    """Table metadata."""
    table_name: str
    columns: List[dict]
    row_count: int