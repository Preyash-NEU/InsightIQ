from fastapi import APIRouter
from app.api.v1.endpoints import auth, auth_oauth, users, data_sources, queries, stats

# Create main API router
api_router = APIRouter()

# Include all route modules
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["User Management"])
api_router.include_router(data_sources.router, prefix="/data-sources", tags=["Data Sources"])
api_router.include_router(queries.router, prefix="/queries", tags=["Queries & Analysis"])
api_router.include_router(stats.router, prefix="/stats", tags=["Statistics & Analytics"])
# Include OAuth routes
api_router.include_router(auth_oauth.router, prefix="/auth", tags=["authentication"])