from fastapi import Request, HTTPException, status, Depends
from typing import Optional
import logging

from app.core.rate_limiter import rate_limiter
from app.config import settings

logger = logging.getLogger(__name__)


async def apply_rate_limit(
    request: Request,
    limit: int,
    window: int,
    endpoint_name: str,
    user_id: Optional[str] = None
) -> dict:
    """
    Apply rate limiting check.
    
    Args:
        request: FastAPI request
        limit: Max requests allowed
        window: Time window in seconds
        endpoint_name: Endpoint identifier
        user_id: Optional user ID
        
    Returns:
        Rate limit info
    """
    if not settings.RATE_LIMIT_ENABLED:
        return {"limit": limit, "remaining": limit, "reset": 0}
    
    identifier = rate_limiter.get_identifier(request, user_id)
    
    limit_info = rate_limiter.check_rate_limit(
        identifier=identifier,
        limit=limit,
        window=window,
        endpoint=endpoint_name
    )
    
    return limit_info


# Dependency functions for different endpoint types
async def auth_rate_limit_dependency(request: Request):
    """Rate limit dependency for auth endpoints."""
    return await apply_rate_limit(
        request=request,
        limit=settings.RATE_LIMIT_AUTH_LOGIN,
        window=settings.RATE_LIMIT_AUTH_WINDOW,
        endpoint_name="auth"
    )


async def query_rate_limit_dependency(request: Request):
    """Rate limit dependency for query endpoints."""
    return await apply_rate_limit(
        request=request,
        limit=settings.RATE_LIMIT_QUERIES,
        window=settings.RATE_LIMIT_QUERIES_WINDOW,
        endpoint_name="queries"
    )


async def upload_rate_limit_dependency(request: Request):
    """Rate limit dependency for upload endpoints."""
    return await apply_rate_limit(
        request=request,
        limit=settings.RATE_LIMIT_UPLOADS,
        window=settings.RATE_LIMIT_UPLOADS_WINDOW,
        endpoint_name="uploads"
    )


async def general_rate_limit_dependency(request: Request):
    """Rate limit dependency for general endpoints."""
    return await apply_rate_limit(
        request=request,
        limit=settings.RATE_LIMIT_GENERAL,
        window=settings.RATE_LIMIT_GENERAL_WINDOW,
        endpoint_name="general"
    )