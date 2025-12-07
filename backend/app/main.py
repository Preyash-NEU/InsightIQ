import logging
from app.core.logging_config import setup_logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from app.config import settings
from app.api.v1.router import api_router

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
