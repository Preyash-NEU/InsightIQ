from fastapi import APIRouter
from app.api.v1.endpoints import auth

# Create main API router
api_router = APIRouter()

# Include authentication routes
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Future routers will be added here:
# api_router.include_router(data_sources.router, prefix="/data-sources", tags=["Data Sources"])
# api_router.include_router(queries.router, prefix="/queries", tags=["Queries"])