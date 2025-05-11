from datetime import datetime
from sqlalchemy import JSON, TIMESTAMP, Column, ForeignKey, Integer, String, Table, Text, func
from sqlalchemy.orm import relationship,backref
from src.database import Base






role_rights = Table(
    "role_rights",
    Base.metadata,
    Column("role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("right_id", Integer, ForeignKey("rights.id", ondelete="CASCADE"), primary_key=True),
)

right_child = Table(
    "right_child",
    Base.metadata,
    Column("parent_id", Integer, ForeignKey("rights.id", ondelete="CASCADE"), primary_key=True),
    Column("child_id", Integer, ForeignKey("rights.id", ondelete="CASCADE"), primary_key=True),
)

class Right(Base):
    __tablename__ = "rights"

    id = Column(Integer, primary_key=True, autoincrement=True)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="SET NULL"))
    entity_type = Column(String(255),nullable=False)
    right_type = Column(String(255),nullable=False)
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now())
    parent_id = Column(Integer, ForeignKey("rights.id", ondelete="SET NULL"))
    departments = relationship("DepartmentRights",back_populates="right")
    # Связь для наследования прав
    roles = relationship(
        "Role", 
        secondary=role_rights, 
        back_populates="rights",
        lazy="selectin"  # Changed from default lazy loading
    )
    
    children = relationship(
        "Right",
        secondary=right_child,
        primaryjoin=id == right_child.c.parent_id,
        secondaryjoin=id == right_child.c.child_id,
        lazy="selectin",
        backref=backref("parents", lazy="selectin")
    )



role_child = Table(
    "role_child",
    Base.metadata,
    Column("parent_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("child_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
)


user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
)




class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(Text)
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now())

    own_audits = relationship("RoleAudit",back_populates="role")


    parent_id = Column(Integer, ForeignKey("roles.id", ondelete="SET NULL"))

    rights = relationship(
        "Right",
        secondary=role_rights,
        back_populates="roles",
        lazy="selectin"  # Changed from default lazy loading
    )
    
    children = relationship(
        "Role",
        secondary=role_child,
        primaryjoin=id == role_child.c.parent_id,
        secondaryjoin=id == role_child.c.child_id,
        lazy="selectin",
        backref=backref("parents", lazy="selectin")
    )

    # Связь для пользователей
    users = relationship("User", back_populates="roles",secondary=user_roles)






class RoleAudit(Base):
    __tablename__ = "role_audit"
    id = Column(Integer, primary_key=True, autoincrement=True)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(10), nullable=False)  # e.g., "create", "update", "delete"
    old_data = Column(JSON)  # Старые данные (в формате JSON)
    new_data = Column(JSON)  # Новые данные (в формате JSON)
    performed_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reason = Column(Text)  # Причина изменения
    created_at = Column(TIMESTAMP, default=func.now())

    # Связи
    role = relationship("Role", back_populates="own_audits")
    performer = relationship("User", back_populates="role_audits")