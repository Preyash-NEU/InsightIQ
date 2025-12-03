from sqlalchemy import Column, String, Integer, BigInteger, DateTime, ForeignKey, Text
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
    
    # Relationships
    user = relationship("User", back_populates="data_sources")
    queries = relationship("Query", back_populates="data_source", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<DataSource {self.name} ({self.type})>"