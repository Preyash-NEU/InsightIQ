from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.base import Base

class Visualization(Base):
    __tablename__ = "visualizations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    query_id = Column(UUID(as_uuid=True), ForeignKey("queries.id", ondelete="CASCADE"), nullable=False)
    chart_type = Column(String(50), nullable=False)  # 'line', 'bar', 'pie', 'table', 'scatter'
    config_json = Column(JSONB, nullable=False)  # Chart configuration
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    query = relationship("Query", back_populates="visualizations")
    
    def __repr__(self):
        return f"<Visualization {self.chart_type} for Query {self.query_id}>"