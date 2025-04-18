from sqlalchemy import Column, Integer, String, TIMESTAMP, Text, CheckConstraint, func
from sqlalchemy.orm import relationship
from datetime import datetime
from src.database import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20))
    address = Column(String(255))
    email = Column(String(255), unique=True, nullable=False)
    notes = Column(Text)
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now())
    departments = relationship("Department", back_populates="organization")