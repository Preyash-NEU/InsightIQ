from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.base import Base


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    
    # Physical table name in database (e.g., "ds_8f2c1a")
    table_name = Column(String, unique=True, nullable=False, index=True)
    
    # Metadata about the dataset
    row_count = Column(Integer, default=0)
    columns = Column(JSON, nullable=False)  # [{"name": "col1", "dtype": "int64", "null_count": 5, ...}]
    
    # File metadata
    original_filename = Column(String, nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="datasets")
    queries = relationship("Query", back_populates="dataset", cascade="all, delete-orphan")
    insights = relationship("Insight", back_populates="dataset", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Dataset {self.name} ({self.table_name})>"