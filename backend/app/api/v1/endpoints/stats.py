from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from app.db.session import get_db
from app.models.user import User
from app.services.stats_service import StatsService
from app.api.deps import get_current_active_user

router = APIRouter()


@router.get("/dashboard", response_model=Dict[str, Any])
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get comprehensive dashboard statistics.
    
    Returns:
    - Data source counts and status
    - Query statistics (total, saved, monthly)
    - Storage usage
    - Average execution times
    - Most queried data sources
    """
    return StatsService.get_dashboard_stats(db, current_user)


@router.get("/usage", response_model=Dict[str, Any])
async def get_usage_stats(
    days: int = Query(default=30, ge=1, le=365, description="Number of days to look back"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get detailed usage statistics over time.
    
    - **days**: Number of days to analyze (1-365, default: 30)
    
    Returns:
    - Daily query counts
    - Query type distribution
    - Busiest hours
    - Usage trends
    """
    return StatsService.get_usage_stats(db, current_user, days)


@router.get("/activity", response_model=List[Dict[str, Any]])
async def get_recent_activity(
    limit: int = Query(default=10, ge=1, le=50, description="Number of activities to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get recent activity feed.
    
    - **limit**: Number of activities to return (1-50, default: 10)
    
    Returns list of recent:
    - Query executions
    - Data source additions
    - Other user activities
    
    Sorted by timestamp (newest first).
    """
    return StatsService.get_recent_activity(db, current_user, limit)


@router.get("/insights", response_model=List[Dict[str, Any]])
async def get_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get AI-generated insights about user data and usage patterns.
    
    Returns personalized insights such as:
    - Usage patterns and trends
    - Performance metrics
    - Recommendations for optimization
    - Tips for better data analysis
    """
    return StatsService.get_insights(db, current_user)