from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.base import Base


class Query(Base):
    __tablename__ = "queries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Natural language question from user
    nl_question = Column(Text, nullable=False)
    
    # Generated SQL
    generated_sql = Column(Text, nullable=False)
    
    # Execution metadata
    row_count = Column(Integer, nullable=True)
    execution_time_ms = Column(Float, nullable=True)
    error = Column(Text, nullable=True)
    
    # Status: 'success', 'failed', 'timeout'
    status = Column(String, default='success')
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    dataset = relationship("Dataset", back_populates="queries")
    user = relationship("User", back_populates="queries")

    def __repr__(self):
        return f"<Query '{self.nl_question[:50]}...'>"