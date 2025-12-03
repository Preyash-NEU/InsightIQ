from sqlalchemy.ext.declarative import declarative_base

# Create Base class for all models
Base = declarative_base()

# Import all models here so Alembic can detect them
from app.models.user import User
from app.models.data_source import DataSource
from app.models.query import Query
from app.models.visualization import Visualization