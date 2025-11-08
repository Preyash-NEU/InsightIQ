from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class InsightBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    insight_type: str = Field(..., min_length=1, max_length=100)
    chart_config: Optional[Dict[str, Any]] = None
    confidence: Optional[float] = Field(None, ge=0, le=1)


class InsightResponse(InsightBase):
    id: UUID
    dataset_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class InsightGenerateRequest(BaseModel):
    dataset_id: UUID
    max_insights: int = Field(5, ge=1, le=20)
    refresh: bool = True


class InsightGenerateResponse(BaseModel):
    dataset_id: UUID
    insights: List[InsightResponse]

