from sqlalchemy import Column, String, Integer, BigInteger, DateTime, ForeignKey, Text, Float  # Added Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.base import Base

class DataSource(Base):
    __tablename__ = "data_sources"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # 'csv', 'google_sheets', 'api', 'database'
    status = Column(String(50), default="connected")  # 'connected', 'syncing', 'error', 'disconnected'
    file_path = Column(Text, nullable=True)  # For CSV files
    connection_info = Column(JSONB, nullable=True)  # For API/Database connections
    row_count = Column(Integer, nullable=True)
    file_size = Column(BigInteger, nullable=True)  # In bytes
    columns_info = Column(JSONB, nullable=True)  # Column names and types
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_synced_at = Column(DateTime, nullable=True)
    
    # Add after last_synced_at, before relationships
    processing_report = Column(JSONB, nullable=True)
    quality_score = Column(Float, nullable=True)
    quality_level = Column(String(20), nullable=True)
    column_mapping = Column(JSONB, nullable=True)
    column_stats = Column(JSONB, nullable=True)
    cleaned_path = Column(Text, nullable=True)
    preview_path = Column(Text, nullable=True)
    processing_duration_seconds = Column(Float, nullable=True)
    last_processed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="data_sources")
    queries = relationship("Query", back_populates="data_source", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<DataSource {self.name} ({self.type})>"