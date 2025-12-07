from fastapi import APIRouter, Depends, HTTPException, status, Query as QueryParam
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.db.session import get_db
from app.models.user import User
from app.schemas.query import Query, QueryCreate, QueryExecute
from app.services.query_service import QueryService
from app.api.deps import get_current_active_user

router = APIRouter()


@router.post("/natural-language", response_model=Query, status_code=status.HTTP_201_CREATED)
async def natural_language_query(
    query_data: QueryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Ask a question in natural language about your data.
    
    The AI will interpret your question and generate pandas code to answer it.
    
    Example queries:
    - "What was the total revenue last quarter?"
    - "Show me the top 10 products by sales"
    - "What is the average order value?"
    - "Which region had the highest growth?"
    
    - **data_source_id**: UUID of the data source to query
    - **query_text**: Your question in plain English
    """
    return await QueryService.natural_language_query(db, current_user, query_data)


@router.post("/execute", response_model=Query, status_code=status.HTTP_201_CREATED)
async def execute_direct_query(
    query_data: QueryExecute,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Execute pandas code directly on a data source.
    
    For advanced users who want to write their own pandas code.
    
    - **data_source_id**: UUID of the data source
    - **pandas_code**: Python pandas code to execute (result must be assigned to 'result' variable)
    - **query_text**: Optional description of what the query does
    
    Example code:
```python
    result = df.groupby('category')['revenue'].sum()
```
    """
    return await QueryService.execute_direct_query(db, current_user, query_data)


@router.get("", response_model=List[Query])
async def get_queries(
    skip: int = 0,
    limit: int = 100,
    data_source_id: Optional[UUID] = None,
    saved_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all queries for the current user.
    
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    - **data_source_id**: Optional filter by data source
    - **saved_only**: Only return saved/favorite queries
    """
    return QueryService.get_queries(db, current_user, skip, limit, data_source_id, saved_only)


@router.get("/{query_id}", response_model=Query)
async def get_query(
    query_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a single query by ID.
    
    - **query_id**: UUID of the query
    """
    return QueryService.get_query(db, current_user, query_id)


@router.post("/{query_id}/save", response_model=Query)
async def save_query(
    query_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Mark a query as saved/favorite.
    
    - **query_id**: UUID of the query to save
    """
    return QueryService.save_query(db, current_user, query_id)


@router.delete("/{query_id}", status_code=status.HTTP_200_OK)
async def delete_query(
    query_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a query.
    
    - **query_id**: UUID of the query to delete
    """
    return QueryService.delete_query(db, current_user, query_id)