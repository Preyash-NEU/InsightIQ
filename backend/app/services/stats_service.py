from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Dict, Any, List
from datetime import datetime, timedelta

from app.models.user import User
from app.models.data_source import DataSource
from app.models.query import Query
from app.models.visualization import Visualization

class StatsService:
    """Service for generating statistics and analytics."""
    
    @staticmethod
    def get_dashboard_stats(db: Session, user: User) -> Dict[str, Any]:
        """
        Get comprehensive dashboard statistics for a user.
        
        Returns:
            Dictionary with various stats and metrics
        """
        
        # Count data sources
        total_data_sources = db.query(DataSource)\
            .filter(DataSource.user_id == user.id)\
            .count()
        
        # Count connected data sources
        connected_data_sources = db.query(DataSource)\
            .filter(
                DataSource.user_id == user.id,
                DataSource.status == "connected"
            )\
            .count()
        
        # Count total queries
        total_queries = db.query(Query)\
            .filter(Query.user_id == user.id)\
            .count()
        
        # Count saved queries
        saved_queries = db.query(Query)\
            .filter(
                Query.user_id == user.id,
                Query.is_saved == True
            )\
            .count()
        
        # Count queries this month
        first_day_of_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        queries_this_month = db.query(Query)\
            .filter(
                Query.user_id == user.id,
                Query.created_at >= first_day_of_month
            )\
            .count()
        
        # Calculate storage used (sum of all file sizes)
        storage_result = db.query(func.sum(DataSource.file_size))\
            .filter(DataSource.user_id == user.id)\
            .scalar()
        storage_used_bytes = storage_result or 0
        
        # Storage limit (10 GB for now - can be made configurable)
        storage_limit_bytes = 10 * 1024 * 1024 * 1024  # 10 GB
        storage_percentage = (storage_used_bytes / storage_limit_bytes * 100) if storage_limit_bytes > 0 else 0
        
        # Calculate average query execution time
        avg_execution_time = db.query(func.avg(Query.execution_time_ms))\
            .filter(Query.user_id == user.id)\
            .scalar()
        avg_execution_time = float(avg_execution_time) if avg_execution_time else 0
        
        # Get most recent data source update
        latest_data_source = db.query(DataSource)\
            .filter(DataSource.user_id == user.id)\
            .order_by(desc(DataSource.updated_at))\
            .first()
        
        last_data_sync = latest_data_source.updated_at.isoformat() if latest_data_source else None
        
        # Count queries in last 7 days
        seven_days_ago = datetime.now() - timedelta(days=7)
        queries_last_7_days = db.query(Query)\
            .filter(
                Query.user_id == user.id,
                Query.created_at >= seven_days_ago
            )\
            .count()
        
        # Count queries in last 30 days
        thirty_days_ago = datetime.now() - timedelta(days=30)
        queries_last_30_days = db.query(Query)\
            .filter(
                Query.user_id == user.id,
                Query.created_at >= thirty_days_ago
            )\
            .count()
        
        # Get most queried data source
        most_queried = db.query(
            DataSource.name,
            func.count(Query.id).label('query_count')
        )\
            .join(Query, Query.data_source_id == DataSource.id)\
            .filter(DataSource.user_id == user.id)\
            .group_by(DataSource.name)\
            .order_by(desc('query_count'))\
            .first()
        
        most_queried_source = {
            "name": most_queried[0] if most_queried else None,
            "query_count": most_queried[1] if most_queried else 0
        }
        
        return {
            "data_sources": {
                "total": total_data_sources,
                "connected": connected_data_sources,
                "syncing": total_data_sources - connected_data_sources,
                "most_queried": most_queried_source
            },
            "queries": {
                "total": total_queries,
                "saved": saved_queries,
                "this_month": queries_this_month,
                "last_7_days": queries_last_7_days,
                "last_30_days": queries_last_30_days,
                "avg_execution_time_ms": round(avg_execution_time, 2)
            },
            "storage": {
                "used_bytes": storage_used_bytes,
                "used_mb": round(storage_used_bytes / (1024 * 1024), 2),
                "used_gb": round(storage_used_bytes / (1024 * 1024 * 1024), 2),
                "limit_bytes": storage_limit_bytes,
                "limit_gb": round(storage_limit_bytes / (1024 * 1024 * 1024), 2),
                "percentage_used": round(storage_percentage, 2)
            },
            "last_data_sync": last_data_sync,
            "user_since": user.created_at.isoformat()
        }
    
    @staticmethod
    def get_usage_stats(
        db: Session,
        user: User,
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Get detailed usage statistics over time.
        
        Args:
            db: Database session
            user: Current user
            days: Number of days to look back
            
        Returns:
            Usage statistics with daily breakdown
        """
        from datetime import date
        
        start_date = datetime.now() - timedelta(days=days)
        
        # Get queries grouped by date
        queries_by_date = db.query(
            func.date(Query.created_at).label('date'),
            func.count(Query.id).label('count')
        )\
            .filter(
                Query.user_id == user.id,
                Query.created_at >= start_date
            )\
            .group_by(func.date(Query.created_at))\
            .order_by('date')\
            .all()
        
        # Convert to dictionary
        query_counts = {str(row[0]): row[1] for row in queries_by_date}
        
        # Fill in missing dates with 0
        daily_stats = []
        current_date = start_date.date()
        end_date = datetime.now().date()
        
        while current_date <= end_date:
            date_str = str(current_date)
            daily_stats.append({
                "date": date_str,
                "queries": query_counts.get(date_str, 0)
            })
            current_date += timedelta(days=1)
        
        # Get query type distribution
        query_type_stats = db.query(
            Query.query_type,
            func.count(Query.id).label('count')
        )\
            .filter(
                Query.user_id == user.id,
                Query.created_at >= start_date
            )\
            .group_by(Query.query_type)\
            .all()
        
        query_types = {row[0]: row[1] for row in query_type_stats}
        
        # Get busiest hour of day
        busiest_hour = db.query(
            func.extract('hour', Query.created_at).label('hour'),
            func.count(Query.id).label('count')
        )\
            .filter(
                Query.user_id == user.id,
                Query.created_at >= start_date
            )\
            .group_by('hour')\
            .order_by(desc('count'))\
            .first()
        
        return {
            "period_days": days,
            "start_date": start_date.date().isoformat(),
            "end_date": end_date.isoformat(),
            "daily_stats": daily_stats,
            "query_types": query_types,
            "busiest_hour": int(busiest_hour[0]) if busiest_hour else None,
            "total_queries_in_period": sum(query_counts.values())
        }
    
    @staticmethod
    def get_recent_activity(
        db: Session,
        user: User,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get recent activity for the user.
        
        Args:
            db: Database session
            user: Current user
            limit: Maximum number of activities to return
            
        Returns:
            List of recent activities
        """
        activities = []
        
        # Get recent queries
        recent_queries = db.query(Query)\
            .filter(Query.user_id == user.id)\
            .order_by(desc(Query.created_at))\
            .limit(limit)\
            .all()
        
        for query in recent_queries:
            # Get data source name
            data_source = db.query(DataSource)\
                .filter(DataSource.id == query.data_source_id)\
                .first()
            
            activities.append({
                "type": "query",
                "id": str(query.id),
                "title": query.query_text[:100],
                "description": f"Executed on {data_source.name if data_source else 'Unknown'}",
                "timestamp": query.created_at.isoformat(),
                "metadata": {
                    "query_type": query.query_type,
                    "execution_time_ms": query.execution_time_ms,
                    "is_saved": query.is_saved
                }
            })
        
        # Get recent data sources
        recent_data_sources = db.query(DataSource)\
            .filter(DataSource.user_id == user.id)\
            .order_by(desc(DataSource.created_at))\
            .limit(limit)\
            .all()
        
        for ds in recent_data_sources:
            activities.append({
                "type": "data_source",
                "id": str(ds.id),
                "title": f"Data source added: {ds.name}",
                "description": f"{ds.type.upper()} - {ds.row_count} rows",
                "timestamp": ds.created_at.isoformat(),
                "metadata": {
                    "type": ds.type,
                    "status": ds.status,
                    "row_count": ds.row_count
                }
            })
        
        # Sort all activities by timestamp
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return activities[:limit]
    
    @staticmethod
    def get_insights(db: Session, user: User) -> List[Dict[str, Any]]:
        """
        Generate AI-style insights based on user data.
        
        Returns:
            List of insight messages
        """
        insights = []
        
        # Check query frequency
        thirty_days_ago = datetime.now() - timedelta(days=30)
        queries_last_30 = db.query(Query)\
            .filter(
                Query.user_id == user.id,
                Query.created_at >= thirty_days_ago
            )\
            .count()
        
        if queries_last_30 > 50:
            insights.append({
                "type": "positive",
                "title": "High Activity",
                "message": f"You've run {queries_last_30} queries in the last 30 days. You're making great use of InsightIQ!",
                "icon": "trending-up"
            })
        
        # Check for saved queries
        saved_count = db.query(Query)\
            .filter(
                Query.user_id == user.id,
                Query.is_saved == True
            )\
            .count()
        
        if saved_count == 0 and queries_last_30 > 5:
            insights.append({
                "type": "tip",
                "title": "Save Your Queries",
                "message": "You have frequently used queries. Consider saving them for quick access!",
                "icon": "star"
            })
        
        # Check data source count
        data_source_count = db.query(DataSource)\
            .filter(DataSource.user_id == user.id)\
            .count()
        
        if data_source_count == 1:
            insights.append({
                "type": "tip",
                "title": "Add More Data Sources",
                "message": "Connect more data sources to unlock cross-dataset analysis capabilities.",
                "icon": "database"
            })
        
        # Check average execution time
        avg_time = db.query(func.avg(Query.execution_time_ms))\
            .filter(Query.user_id == user.id)\
            .scalar()
        
        if avg_time and avg_time < 100:
            insights.append({
                "type": "positive",
                "title": "Lightning Fast",
                "message": f"Your queries average {round(avg_time)}ms execution time. Excellent performance!",
                "icon": "zap"
            })
        
        return insights