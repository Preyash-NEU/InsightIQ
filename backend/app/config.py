from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "InsightIQ"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Security
    JWT_SECRET_KEY: str
    JWT_REFRESH_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # Logging
    LOG_LEVEL: str = "INFO" 
    
    # Database
    DATABASE_URL: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432
    
    # Redis
    REDIS_URL: str
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    
    # Rate Limiting Settings
    RATE_LIMIT_ENABLED: bool = True
    
    # Authentication endpoints (stricter limits)
    RATE_LIMIT_AUTH_LOGIN: int = 5          # 5 login attempts
    RATE_LIMIT_AUTH_REGISTER: int = 3       # 3 registrations
    RATE_LIMIT_AUTH_WINDOW: int = 60        # per minute
    
    # Query endpoints (moderate limits)
    RATE_LIMIT_QUERIES: int = 30            # 30 queries
    RATE_LIMIT_QUERIES_WINDOW: int = 60     # per minute
    
    # Upload endpoints (stricter)
    RATE_LIMIT_UPLOADS: int = 10            # 10 uploads
    RATE_LIMIT_UPLOADS_WINDOW: int = 3600   # per hour
    
    # General API (lenient)
    RATE_LIMIT_GENERAL: int = 100           # 100 requests
    RATE_LIMIT_GENERAL_WINDOW: int = 60     # per minute
    
    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4-turbo"
    OPENAI_MAX_TOKENS: int = 2000
    OPENAI_TEMPERATURE: float = 0.2
    
    # File Storage
    MAX_FILE_SIZE_MB: int = 100
    ALLOWED_FILE_EXTENSIONS: str = ".csv,.xlsx,.json"
    UPLOAD_DIR: str = "/app/storage/uploads"
    
    # File Upload Settings
    MAX_FILE_SIZE_MB: int = 100
    ALLOWED_FILE_EXTENSIONS: str = ".csv,.xlsx,.xls,.json,.parquet,.tsv,.txt"
    UPLOAD_DIR: str = "/app/storage/uploads"
    
    # OpenAI Settings
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    OPENAI_MAX_TOKENS: int = 2000
    OPENAI_TEMPERATURE: float = 0.2
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    CORS_ALLOW_CREDENTIALS: bool = True
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str | None = None
    GOOGLE_CLIENT_SECRET: str | None = None
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/google/callback"

    # GitHub OAuth
    GITHUB_CLIENT_ID: str | None = None
    GITHUB_CLIENT_SECRET: str | None = None
    GITHUB_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/github/callback"

    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # Data Pipeline Settings
    STORAGE_PATH: str = "/app/storage"
    USE_PIPELINE_BY_DEFAULT: bool = True
    PREVIEW_ROW_LIMIT: int = 1000
    MIN_QUALITY_SCORE: float = 60.0
    WARN_QUALITY_SCORE: float = 80.0
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()