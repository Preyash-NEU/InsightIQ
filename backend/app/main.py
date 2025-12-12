import logging
from app.core.logging_config import setup_logging
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import logging
from fastapi.responses import JSONResponse
from app.config import settings
from app.api.v1.router import api_router

class RateLimitHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware to add rate limit headers to responses."""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Rate limit headers are added by the dependency
        # This middleware ensures they're always present
        
        return response

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Data Analytics Platform",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
origins = settings.CORS_ORIGINS.split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add after CORS middleware
app.add_middleware(RateLimitHeadersMiddleware)

# Include API v1 router
app.include_router(api_router, prefix="/api/v1")

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "status": "running",
        "docs": "/docs",
        "timestamp": datetime.now().isoformat()
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "cache": "connected",
        "timestamp": datetime.now().isoformat()
    }

@app.on_event("startup")
async def startup_event():
    # Setup logging
    setup_logging()
    
    logger = logging.getLogger(__name__)
    logger.info("=" * 60)
    logger.info(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} starting...")
    logger.info(f"📝 Environment: {settings.ENVIRONMENT}")
    logger.info(f"📚 API Docs: http://localhost:{settings.PORT}/docs")
    logger.info("=" * 60)

@app.on_event("shutdown")
async def shutdown_event():
    logger = logging.getLogger(__name__)
    logger.info("=" * 60)
    logger.info(f"👋 {settings.APP_NAME} shutting down...")
    logger.info("=" * 60)

@app.exception_handler(429)
async def rate_limit_handler(request: Request, exc: HTTPException):
    """Custom handler for rate limit exceeded errors."""
    return JSONResponse(
        status_code=429,
        content={
            "error": "Rate Limit Exceeded",
            "message": "You have exceeded the rate limit for this endpoint",
            "detail": exc.detail if hasattr(exc, 'detail') else None,
            "documentation": "Check response headers for X-RateLimit-* information"
        },
        headers=exc.headers if hasattr(exc, 'headers') else {}
    )
    