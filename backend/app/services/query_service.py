import redis
import hashlib
import json
from app.config import settings

# Initialize Redis client
redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional, Any, Dict
from uuid import UUID
import pandas as pd
import json
from datetime import datetime
import os

from app.models.query import Query
from app.models.data_source import DataSource
from app.models.visualization import Visualization
from app.models.user import User
from app.schemas.query import QueryCreate, QueryExecute
from app.services.ai_service import AIService
from app.services.data_service import DataSourceService

class QueryService:
    """Service for executing and managing queries."""
    
    @staticmethod
    def execute_pandas_code(
        df: pd.DataFrame,
        code: str,
        timeout: int = 30
    ) -> Any:
        """
        Safely execute pandas code on a DataFrame.
        
        Args:
            df: The DataFrame to operate on
            code: Python pandas code to execute
            timeout: Maximum execution time in seconds
            
        Returns:
            The result of the code execution
        """
        # Create a restricted namespace
        namespace = {
            'df': df,
            'pd': pd,
            'result': None
        }
        
        # Banned keywords for security
        banned_keywords = [
            'import', 'eval', 'exec', 'compile', '__import__',
            'open', 'file', 'input', 'raw_input', 'execfile',
            'reload', 'os', 'sys', 'subprocess', 'socket'
        ]
        
        # Check for banned keywords
        for keyword in banned_keywords:
            if keyword in code.lower():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Forbidden keyword '{keyword}' in code"
                )
        
        try:
            # Execute the code
            exec(code, namespace)
            result = namespace.get('result')
            
            if result is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Code did not produce a 'result' variable"
                )
            
            return result
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error executing query: {str(e)}"
            )
    
    @staticmethod
    def serialize_result(result: Any) -> Any:
        """Convert query result to JSON-serializable format."""
        import pandas as pd
        import numpy as np
        
        if isinstance(result, pd.DataFrame):
            # Convert DataFrame to dict
            return {
                "type": "dataframe",
                "data": result.to_dict(orient='records'),
                "columns": result.columns.tolist(),
                "shape": result.shape
            }
        elif isinstance(result, pd.Series):
            return {
                "type": "series",
                "data": result.to_dict(),
                "name": result.name
            }
        elif isinstance(result, (np.integer, np.floating)):
            return {
                "type": "scalar",
                "value": float(result)
            }
        elif isinstance(result, (int, float, str, bool)):
            return {
                "type": "scalar",
                "value": result
            }
        elif isinstance(result, (list, dict)):
            return {
                "type": "object",
                "value": result
            }
        else:
            return {
                "type": "unknown",
                "value": str(result)
            }
    
    @staticmethod
    async def natural_language_query(
        db: Session,
        user: User,
        query_data: QueryCreate
    ) -> Query:
        """
        Process a natural language query.
        
        Args:
            db: Database session
            user: Current user
            query_data: Query data with natural language text and data source ID
            
        Returns:
            Query object with results
        """
        # Get data source
        data_source = DataSourceService.get_data_source(
            db, user, query_data.data_source_id
        )
        
        # NEW: Check cache first
        cache_key = QueryService._generate_cache_key(
            data_source.id, 
            query_data.query_text
        )
        cached_result = QueryService._get_cached_result(cache_key)
        
        if cached_result:
            # Return cached query result
            cached_query = Query(
                id=UUID(cached_result["id"]),
                user_id=user.id,
                data_source_id=data_source.id,
                query_text=query_data.query_text,
                query_type="natural_language",
                result_data=cached_result["result_data"],
                execution_time_ms=cached_result["execution_time_ms"],
                is_saved=False,
                created_at=datetime.fromisoformat(cached_result["created_at"])
            )
            # Note: This is a cached result, not saved to DB
            return cached_query
        
        if data_source.type != "csv":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Natural language queries only supported for CSV files currently"
            )
        
        if not data_source.file_path or not os.path.exists(data_source.file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Data file not found"
            )
        
        # Load the data
        try:
            df = pd.read_csv(data_source.file_path)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error loading data: {str(e)}"
            )
        
        # Get AI interpretation
        ai_service = AIService()
        start_time = datetime.now()
        
        try:
            ai_response = ai_service.interpret_natural_language_query(
                query_text=query_data.query_text,
                columns_info=data_source.columns_info
            )
            
            pandas_code = ai_response["pandas_code"]
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error interpreting query: {str(e)}"
            )
        
        # Execute the generated code
        try:
            result = QueryService.execute_pandas_code(df, pandas_code)
            execution_time = (datetime.now() - start_time).total_seconds() * 1000  # Convert to ms
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error executing query: {str(e)}"
            )
        
        # Serialize the result
        serialized_result = QueryService.serialize_result(result)
        
        # Generate visualization suggestion
        viz_config = ai_service.suggest_visualization(result, query_data.query_text)
        
        # Create query record
        new_query = Query(
            user_id=user.id,
            data_source_id=data_source.id,
            query_text=query_data.query_text,
            query_type="natural_language",
            result_data=serialized_result,
            execution_time_ms=int(execution_time),
            is_saved=False
        )
        
        db.add(new_query)
        db.commit()
        db.refresh(new_query)
        
        # Create visualization record
        visualization = Visualization(
            query_id=new_query.id,
            chart_type=viz_config["type"],
            config_json=viz_config["config"]
        )
        
        db.add(visualization)
        db.commit()
        
        # NEW: Cache the result
        cache_data = {
            "id": str(new_query.id),
            "result_data": serialized_result,
            "execution_time_ms": int(execution_time),
            "created_at": new_query.created_at.isoformat()
        }
        QueryService._set_cached_result(cache_key, cache_data, ttl=300)  # 5 min cache
        
        # Add visualization to query response
        new_query.visualizations = [visualization]
        
        return new_query
    
    @staticmethod
    async def execute_direct_query(
        db: Session,
        user: User,
        query_data: QueryExecute
    ) -> Query:
        """
        Execute pandas code directly (for advanced users).
        
        Args:
            db: Database session
            user: Current user
            query_data: Query with pandas code
            
        Returns:
            Query object with results
        """
        # Get data source
        data_source = DataSourceService.get_data_source(
            db, user, query_data.data_source_id
        )
        
        if not data_source.file_path or not os.path.exists(data_source.file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Data file not found"
            )
        
        # Load the data
        try:
            df = pd.read_csv(data_source.file_path)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error loading data: {str(e)}"
            )
        
        # Execute the code
        start_time = datetime.now()
        result = QueryService.execute_pandas_code(df, query_data.pandas_code)
        execution_time = (datetime.now() - start_time).total_seconds() * 1000
        
        # Serialize result
        serialized_result = QueryService.serialize_result(result)
        
        # Create query record
        new_query = Query(
            user_id=user.id,
            data_source_id=data_source.id,
            query_text=query_data.query_text or "Direct pandas execution",
            query_type="direct",
            result_data=serialized_result,
            execution_time_ms=int(execution_time),
            is_saved=False
        )
        
        db.add(new_query)
        db.commit()
        db.refresh(new_query)
        
        return new_query
    
    @staticmethod
    def get_queries(
        db: Session,
        user: User,
        skip: int = 0,
        limit: int = 100,
        data_source_id: Optional[UUID] = None,
        saved_only: bool = False
    ) -> List[Query]:
        """Get queries for a user with optional filters."""
        query = db.query(Query).filter(Query.user_id == user.id)
        
        if data_source_id:
            query = query.filter(Query.data_source_id == data_source_id)
        
        if saved_only:
            query = query.filter(Query.is_saved == True)
        
        return query.order_by(Query.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_query(db: Session, user: User, query_id: UUID) -> Query:
        """Get a single query by ID."""
        query = db.query(Query).filter(
            Query.id == query_id,
            Query.user_id == user.id
        ).first()
        
        if not query:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Query not found"
            )
        
        return query
    
    @staticmethod
    def save_query(db: Session, user: User, query_id: UUID) -> Query:
        """Mark a query as saved/favorite."""
        query = QueryService.get_query(db, user, query_id)
        query.is_saved = True
        db.commit()
        db.refresh(query)
        return query
    
    @staticmethod
    def delete_query(db: Session, user: User, query_id: UUID) -> dict:
        """Delete a query."""
        query = QueryService.get_query(db, user, query_id)
        db.delete(query)
        db.commit()
        return {"message": "Query deleted successfully"}
    
    @staticmethod
    def _generate_cache_key(data_source_id: UUID, query_text: str) -> str:
        """Generate a unique cache key for a query."""
        combined = f"{data_source_id}:{query_text}"
        return f"query_cache:{hashlib.md5(combined.encode()).hexdigest()}"
    
    @staticmethod
    def _get_cached_result(cache_key: str) -> Optional[Dict[str, Any]]:
        """Get cached query result from Redis."""
        try:
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
        except Exception as e:
            print(f"Redis get error: {e}")
        return None
    
    @staticmethod
    def _set_cached_result(cache_key: str, result: Dict[str, Any], ttl: int = 300) -> None:
        """Cache query result in Redis with TTL (default 5 minutes)."""
        try:
            redis_client.setex(
                cache_key,
                ttl,
                json.dumps(result, default=str)
            )
        except Exception as e:
            print(f"Redis set error: {e}")