from __future__ import annotations

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.dataset import Dataset
from app.models.insight import Insight
from app.models.user import User
from app.schemas.insight import InsightGenerateRequest, InsightGenerateResponse, InsightResponse
from app.services.data_profiler import DataProfiler
from app.services.insight_generator import InsightGenerator

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


@router.get("/{dataset_id}", response_model=List[InsightResponse])
async def get_insights(
    dataset_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dataset = _get_dataset(dataset_id, current_user, db)
    insights = (
        db.query(Insight)
        .filter(Insight.dataset_id == dataset.id)
        .order_by(Insight.created_at.desc())
        .all()
    )
    return insights


@router.post("/generate", response_model=InsightGenerateResponse)
async def generate_insights(
    payload: InsightGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dataset = _get_dataset(payload.dataset_id, current_user, db)

    try:
        profile = DataProfiler.build_profile(dataset, db)
        generated = InsightGenerator.generate(profile, limit=payload.max_insights)
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - safety net
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

    if payload.refresh:
        db.query(Insight).filter(Insight.dataset_id == dataset.id).delete()

    insights: List[Insight] = []
    for item in generated:
        insight = Insight(
            dataset_id=dataset.id,
            title=item["title"],
            description=item["description"],
            insight_type=item["insight_type"],
            chart_config=item.get("chart_config"),
            confidence=str(item.get("confidence")) if item.get("confidence") is not None else None,
        )
        db.add(insight)
        insights.append(insight)

    try:
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

    all_insights = (
        db.query(Insight)
        .filter(Insight.dataset_id == dataset.id)
        .order_by(Insight.created_at.desc())
        .all()
    )

    return InsightGenerateResponse(dataset_id=dataset.id, insights=all_insights)
