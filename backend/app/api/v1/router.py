from fastapi import APIRouter
from app.api.v1.endpoints import auth, data_sources

# Create main API router
api_router = APIRouter()

# Include authentication routes
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Include data source routes
api_router.include_router(data_sources.router, prefix="/data-sources", tags=["Data Sources"])