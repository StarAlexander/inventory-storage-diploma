from enum import Enum
from sqlalchemy import JSON, Column, DateTime, Integer, String, ForeignKey, Boolean, TIMESTAMP, Text, func
from sqlalchemy.orm import relationship
from src.database import Base
from src.roles.models import user_roles


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(255), unique=True, nullable=False)
    first_name = Column(String(255), nullable=True)
    phone = Column(String(20),nullable=True)
    last_name = Column(String(255), nullable=True)
    middle_name = Column(String(255), nullable=True)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_system = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now())
    public_key = Column(String(1024))
    private_key = Column(String(1024))
    own_audits = relationship("UserAudit",foreign_keys="[UserAudit.user_id]",back_populates="user")
    user_audits = relationship("UserAudit",foreign_keys="[UserAudit.performed_by]",back_populates="performer")
    auth_logs = relationship("AuthLog", back_populates="user")
    role_audits = relationship("RoleAudit",back_populates="performer")
    request_audit_logs = relationship("RequestAudit",back_populates="performer")
    
    requests = relationship("Request",back_populates="user")

    # Связь для ролей
    role_ids = Column(String(255))  # Хранение идентификаторов ролей через строку
    roles = relationship("Role", secondary=user_roles, back_populates="users",lazy="selectin")

    # Связь для департамента
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"))
    department = relationship("Department", back_populates="users")

    # Связь для должности
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="SET NULL"))
    post = relationship("Post", back_populates="users")

    # Связь для складов
    managed_warehouses = relationship("Warehouse", back_populates="manager")
    transactions = relationship(
        "WarehouseTransaction",
        foreign_keys="[WarehouseTransaction.user_id]",
        back_populates="user"
    )

    repair_transactions = relationship(
        "WarehouseTransaction",
        foreign_keys="[WarehouseTransaction.repairer_id]",
        back_populates="repairer"
    )


class ActionType(str, Enum):
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    PASSWORD_CHANGE = "PASSWORD_CHANGE"
    ROLE_CHANGE = "ROLE_CHANGE"

class UserAudit(Base):
    __tablename__ = "user_audit"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    action = Column(String(10), nullable=False)
    entity_type = Column(String(50), nullable=False)  # e.g., "user", "role", "permission"
    entity_id = Column(String(50))  # ID of the affected entity
    old_data = Column(JSON)  
    new_data = Column(JSON)  
    performed_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ip_address = Column(String(45))  # Store IPv4 or IPv6
    user_agent = Column(Text)  # Browser/device info
    reason = Column(Text)
    created_at = Column(TIMESTAMP, default=func.now())

    user = relationship("User", foreign_keys=[user_id], back_populates="own_audits")
    performer = relationship("User", foreign_keys=[performed_by], back_populates="user_audits")



class AuthLog(Base):
    __tablename__ = "auth_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    username = Column(String(50))
    action = Column(String(20))  # "login", "logout", "failed_login"
    timestamp = Column(DateTime, default=func.now())
    ip_address = Column(String(20))
    user_agent = Column(Text)
    
    user = relationship("User", back_populates="auth_logs")



class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(Text)
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now())
    organization_id = Column(Integer,ForeignKey("organizations.id"))

    organization = relationship("Organization")
    users = relationship("User", back_populates="post")
