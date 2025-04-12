from datetime import datetime
from sqlalchemy import JSON, TIMESTAMP, Boolean, Column, Enum, Float, ForeignKey, Integer, String, Table, Text, func
from sqlalchemy.orm import relationship
from src.database import Base




class ObjectCategory(Base):
    __tablename__ = "object_categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(Text)
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now())

    objects = relationship("Object", back_populates="category")
    fields = relationship("DynamicField", back_populates="category")


class DynamicField(Base):
    __tablename__ = "dynamic_fields"

    id = Column(Integer, primary_key=True, autoincrement=True)
    category_id = Column(Integer, ForeignKey("object_categories.id", ondelete="CASCADE"))
    name = Column(String(255), nullable=False)
    field_type = Column(String(50), nullable=False)  # e.g., "text", "number", "date", "select"
    description = Column(Text)
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now())

    category = relationship("ObjectCategory", back_populates="fields")

    object_values = relationship(
        "ObjectDynamicFieldValue",
        back_populates="field"
    )

    select_options = relationship("SelectValue", back_populates="field", 
                                cascade="all, delete-orphan")



class SelectValue(Base):
    __tablename__ = "select_values"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    field_id = Column(Integer, ForeignKey("dynamic_fields.id", ondelete="CASCADE"))
    value = Column(String(255), nullable=False)
    display_name = Column(String(255))  # Optional display name different from value
    sort_order = Column(Integer, default=0)  # For ordering options
    is_default = Column(Boolean, default=False)  # Mark default selection
    
    field = relationship("DynamicField", back_populates="select_options")


class ObjectDynamicFieldValue(Base):
    __tablename__ = "object_dynamic_field_values"

    object_id = Column(Integer, ForeignKey("objects.id", ondelete="CASCADE"), primary_key=True)
    field_id = Column(Integer, ForeignKey("dynamic_fields.id", ondelete="CASCADE"), primary_key=True)
    value = Column(String(255))

    # Связи с объектами Object и DynamicField
    object = relationship("Object", back_populates="dynamic_values")
    field = relationship("DynamicField", back_populates="object_values")


class Object(Base):
    __tablename__ = "objects"

    id = Column(Integer, primary_key=True, autoincrement=True)
    category_id = Column(Integer, ForeignKey("object_categories.id", ondelete="SET NULL"))
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    inventory_number = Column(String(50), unique=True, nullable=False)
    serial_number = Column(String(50), unique=True, nullable=False)
    cost = Column(Float, nullable=True)
    purchase_date = Column(TIMESTAMP, nullable=True)
    warranty_expiry_date = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now())
    status = Column(String(20), nullable="False",default="Активно")
    department = relationship("Department",back_populates="objects")
    category = relationship("ObjectCategory", back_populates="objects")
    dynamic_values = relationship(
        "ObjectDynamicFieldValue",
        back_populates="object",
        cascade="all, delete-orphan"
    )

    requests = relationship("Request",back_populates="object")


class Request(Base):
    __tablename__ = "requests"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    object_id = Column(Integer, ForeignKey("objects.id", ondelete="CASCADE"))
    status = Column(Enum("new", "in_progress", "resolved", "closed"), default="new", nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now())

    # Связи
    user = relationship("User", back_populates="requests")
    object = relationship("Object", back_populates="requests")
    audit_logs = relationship("RequestAudit",back_populates="request")


class RequestAudit(Base):
    __tablename__ = "request_audit"
    id = Column(Integer, primary_key=True, autoincrement=True)
    request_id = Column(Integer, ForeignKey("requests.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(10), nullable=False)  # e.g., "create", "update", "delete"
    old_data = Column(JSON)  # Старые данные (в формате JSON)
    new_data = Column(JSON)  # Новые данные (в формате JSON)
    performed_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reason = Column(Text)  # Причина изменения
    created_at = Column(TIMESTAMP, default=func.now())

    # Связи
    request = relationship("Request", back_populates="audit_logs")
    performer = relationship("User", back_populates="request_audit_logs")