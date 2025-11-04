from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class QueryCreate(BaseModel):
    dataset_id: UUID
    nl_question: str = Field(..., min_length=1, max_length=500)


class QueryResponse(BaseModel):
    id: UUID
    dataset_id: UUID
    user_id: UUID
    nl_question: str
    generated_sql: str
    row_count: Optional[int]
    execution_time_ms: Optional[float]
    error: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class QueryResultResponse(BaseModel):
    query_id: UUID
    sql: str
    columns: List[str]
    rows: List[Dict[str, Any]]
    row_count: int
    execution_time_ms: float
    chart_suggestion: Optional[Dict[str, Any]] = None
    insight: Optional[str] = None


class QueryHistoryResponse(BaseModel):
    queries: List[QueryResponse]
    total: int
    page: int
    page_size: int