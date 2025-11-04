from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.base import Base


class Insight(Base):
    __tablename__ = "insights"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    
    # AI-generated insight title and description
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    
    # Type: 'trend', 'anomaly', 'correlation', 'summary', etc.
    insight_type = Column(String, nullable=False)
    
    # Chart suggestion if applicable
    chart_config = Column(JSON, nullable=True)  # {type: 'bar', x: 'col1', y: 'col2', ...}
    
    # Confidence score (0-1)
    confidence = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    dataset = relationship("Dataset", back_populates="insights")

    def __repr__(self):
        return f"<Insight '{self.title}'>"