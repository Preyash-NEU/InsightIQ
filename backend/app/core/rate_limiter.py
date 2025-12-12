import redis
import time
import logging
from typing import Optional
from fastapi import Request, HTTPException, status
from app.config import settings

logger = logging.getLogger(__name__)

class RateLimiter:
    """Redis-based rate limiter."""
    
    def __init__(self):
        """Initialize Redis connection for rate limiting."""
        self.redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
    
    def get_identifier(self, request: Request, user_id: Optional[str] = None) -> str:
        """
        Get unique identifier for rate limiting.
        
        Uses user_id if authenticated, otherwise uses IP address.
        """
        if user_id:
            return f"user:{user_id}"
        
        # Fallback to IP address
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            ip = forwarded.split(",")[0]
        else:
            ip = request.client.host
        
        return f"ip:{ip}"
    
    def check_rate_limit(
        self,
        identifier: str,
        limit: int,
        window: int,
        endpoint: str
    ) -> dict:
        """
        Check if request is within rate limit.
        
        Args:
            identifier: Unique identifier (user_id or IP)
            limit: Maximum requests allowed
            window: Time window in seconds
            endpoint: Endpoint name for tracking
            
        Returns:
            Dictionary with rate limit info
            
        Raises:
            HTTPException if rate limit exceeded
        """
        key = f"rate_limit:{endpoint}:{identifier}"
        
        try:
            # Get current count
            current = self.redis_client.get(key)
            
            if current is None:
                # First request in window
                self.redis_client.setex(key, window, 1)
                return {
                    "limit": limit,
                    "remaining": limit - 1,
                    "reset": int(time.time()) + window
                }
            
            current = int(current)
            
            if current >= limit:
                # Rate limit exceeded
                ttl = self.redis_client.ttl(key)
                reset_time = int(time.time()) + ttl
                
                logger.warning(f"Rate limit exceeded for {identifier} on {endpoint}")
                
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "error": "Rate limit exceeded",
                        "limit": limit,
                        "window_seconds": window,
                        "retry_after": ttl,
                        "reset_at": reset_time
                    },
                    headers={
                        "X-RateLimit-Limit": str(limit),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": str(reset_time),
                        "Retry-After": str(ttl)
                    }
                )
            
            # Increment counter
            self.redis_client.incr(key)
            remaining = limit - current - 1
            ttl = self.redis_client.ttl(key)
            reset_time = int(time.time()) + ttl
            
            return {
                "limit": limit,
                "remaining": remaining,
                "reset": reset_time
            }
            
        except HTTPException:
            raise
        except Exception as e:
            # If Redis fails, allow the request but log the error
            logger.error(f"Rate limiter error: {str(e)}")
            return {
                "limit": limit,
                "remaining": limit,
                "reset": int(time.time()) + window
            }
    
    def reset_rate_limit(self, identifier: str, endpoint: str) -> bool:
        """Reset rate limit for an identifier (admin function)."""
        key = f"rate_limit:{endpoint}:{identifier}"
        try:
            self.redis_client.delete(key)
            logger.info(f"Rate limit reset for {identifier} on {endpoint}")
            return True
        except Exception as e:
            logger.error(f"Failed to reset rate limit: {str(e)}")
            return False

# Global rate limiter instance
rate_limiter = RateLimiter()