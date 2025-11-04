from pydantic_settings import BaseSettings
from pathlib import Path
import os

# Get the backend directory (where .env is located)
# This file is at: backend/app/core/config.py
# We need to go up 2 levels to reach: backend/
BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    
    # AI Provider (optional for now)
    AI_PROVIDER: str = "openai"
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    
    class Config:
        # Point to .env file in backend/ directory
        env_file = os.path.join(BASE_DIR, ".env")
        env_file_encoding = "utf-8"
        case_sensitive = False


# Create settings instance
settings = Settings()

# Debug: Print to verify it's loading (remove after testing)
if __name__ == "__main__":
    print(f"Loading .env from: {os.path.join(BASE_DIR, '.env')}")
    print(f"DATABASE_URL: {settings.DATABASE_URL}")