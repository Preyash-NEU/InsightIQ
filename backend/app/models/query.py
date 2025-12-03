from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.base import Base

class Query(Base):
    __tablename__ = "queries"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    data_source_id = Column(UUID(as_uuid=True), ForeignKey("data_sources.id", ondelete="SET NULL"), nullable=True)
    query_text = Column(Text, nullable=False)
    query_type = Column(String(50), nullable=True)  # 'natural_language', 'sql', 'aggregation'
    result_data = Column(JSONB, nullable=True)  # Store query results
    execution_time_ms = Column(Integer, nullable=True)
    is_saved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="queries")
    data_source = relationship("DataSource", back_populates="queries")
    visualizations = relationship("Visualization", back_populates="query", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Query {self.id} - {self.query_text[:50]}>"