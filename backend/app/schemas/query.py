from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class QueryBase(BaseModel):
    query_text: str = Field(..., min_length=1)
    data_source_id: Optional[UUID] = None

class QueryCreate(QueryBase):
    pass

class QueryExecute(BaseModel):
    data_source_id: UUID
    query_text: str = Field(..., min_length=1)

class Query(QueryBase):
    id: UUID
    user_id: UUID
    query_type: Optional[str] = None
    result_data: Optional[Dict[str, Any]] = None
    execution_time_ms: Optional[int] = None
    is_saved: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class QueryWithResults(Query):
    visualizations: Optional[list] = None