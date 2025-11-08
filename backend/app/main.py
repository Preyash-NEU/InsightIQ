from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1 import auth, datasets, insights, queries

app = FastAPI(
    title="InsightIQ API",
    description="AI-powered analytics dashboard API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(datasets.router, prefix="/api/v1/datasets", tags=["Datasets"])
app.include_router(queries.router, prefix="/api/v1/queries", tags=["Queries"])
app.include_router(insights.router, prefix="/api/v1/insights", tags=["Insights"])


@app.get("/")
async def root():
    return {"message": "InsightIQ API", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}