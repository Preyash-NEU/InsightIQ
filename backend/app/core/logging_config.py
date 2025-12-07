import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler
from app.config import settings

def setup_logging():
    """
    Configure application logging.
    
    Sets up:
    - Console logging (colorized)
    - File logging (rotating)
    - Different levels for different environments
    """
    
    # Create logs directory if it doesn't exist
    log_dir = Path("/app/logs")
    log_dir.mkdir(exist_ok=True)
    
    # Determine log level from settings
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    
    # Create formatters
    detailed_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    simple_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%H:%M:%S'
    )
    
    # Console handler (stdout)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_handler.setFormatter(simple_formatter)
    
    # File handler - rotating (max 10MB, keep 5 backups)
    file_handler = RotatingFileHandler(
        filename=log_dir / "insightiq.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setLevel(log_level)
    file_handler.setFormatter(detailed_formatter)
    
    # Error file handler - separate file for errors
    error_handler = RotatingFileHandler(
        filename=log_dir / "errors.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(detailed_formatter)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Remove existing handlers
    root_logger.handlers.clear()
    
    # Add handlers
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(error_handler)
    
    # Set levels for specific libraries
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("fastapi").setLevel(logging.INFO)
    
    # Log startup message
    logging.info("=" * 60)
    logging.info(f"InsightIQ Logging initialized - Level: {settings.LOG_LEVEL}")
    logging.info(f"Environment: {settings.ENVIRONMENT}")
    logging.info("=" * 60)