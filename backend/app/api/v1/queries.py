from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query as QueryParam, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.dataset import Dataset
from app.models.query import Query
from app.models.user import User
from app.schemas.query import QueryCreate, QueryHistoryResponse, QueryResponse, QueryResultResponse
from app.services.query_generator import QueryExecutor

router = APIRouter()


def _get_dataset(dataset_id: UUID, user: User, db: Session) -> Dataset:
    dataset = (
        db.query(Dataset)
        .filter(Dataset.id == dataset_id, Dataset.owner_id == user.id)
        .first()
    )
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")
    return dataset


@router.post("", response_model=QueryResultResponse, status_code=status.HTTP_201_CREATED)
async def create_query(
    payload: QueryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dataset = _get_dataset(payload.dataset_id, current_user, db)
    executor = QueryExecutor(db)

    try:
        query, response_payload = executor.execute(
            dataset=dataset,
            user=current_user,
            question=payload.nl_question,
        )
        db.commit()
        db.refresh(query)
        return response_payload
    except Exception as exc:  # pragma: no cover - defensive guard
        db.rollback()
        executor.record_failure(dataset=dataset, user=current_user, question=payload.nl_question, error=exc)
        db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get("/{query_id}", response_model=QueryResponse)
async def get_query(query_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = (
        db.query(Query)
        .filter(Query.id == query_id, Query.user_id == current_user.id)
        .first()
    )
    if not query:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Query not found")
    return query


@router.get("", response_model=QueryHistoryResponse)
async def list_queries(
    dataset_id: UUID,
    page: int = QueryParam(1, ge=1),
    page_size: int = QueryParam(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dataset = _get_dataset(dataset_id, current_user, db)

    total = (
        db.query(Query)
        .filter(Query.dataset_id == dataset.id, Query.user_id == current_user.id)
        .count()
    )

    offset = (page - 1) * page_size
    items = (
        db.query(Query)
        .filter(Query.dataset_id == dataset.id, Query.user_id == current_user.id)
        .order_by(Query.created_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return QueryHistoryResponse(queries=items, total=total, page=page, page_size=page_size)
