from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import relationship
from src.database import Base
from datetime import datetime



class DepartmentRights(Base):
    __tablename__ = "department_rights"
    id = Column(Integer, primary_key=True, autoincrement=True)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    right_id = Column(Integer, ForeignKey("rights.id", ondelete="CASCADE"), nullable=False)

    # Связи
    department = relationship("Department", back_populates="rights")
    right = relationship("Right", back_populates="departments")


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    abbreviation = Column(String(10))
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now())

    organization = relationship("Organization", back_populates="departments")
    users = relationship("User", back_populates="department")
    rights = relationship("DepartmentRights",back_populates="department")
    objects = relationship("Object", back_populates="department",cascade="all, delete-orphan")

