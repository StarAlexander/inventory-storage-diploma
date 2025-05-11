import re
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, ConfigDict, field_validator
from src.users.models import ActionType
from src.roles.schemas import RoleSchema

# Базовая модель для пользователя
class UserBase(BaseModel):
    username: str
    email: str | None = Field(None, pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", description="Valid email format")
    first_name: str | None = None
    middle_name: str | None = None
    last_name: str | None = None
    phone: str | None = Field(None, pattern=r"^\+?[0-9]+$", description="Valid phone number")
    is_system: bool = False
    is_active: bool = True
    

    @field_validator("username")
    def validate_username(cls, value):
        if len(value) < 3:
            raise ValueError("Username must be at least 3 characters long.")
        if not re.match(r"^[A-Za-z0-9._-]+$", value):
            raise ValueError("Username can contain only Latin letters, digits, dots, underscores, and dashes.")
        return value

# Модель для создания пользователя
class UserCreate(UserBase):
    department_id: int | None = None
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters long.")

    @field_validator("password")
    def validate_password(cls, value):
        if not re.match(r"^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$", value):
            raise ValueError("Password must contain at least one letter, one digit, and one special character.")
        return value

# Модель для обновления пользователя
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = Field(None, pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = Field(None, pattern=r"^\+?[0-9]+$")
    is_active: Optional[bool] = None
    is_system: Optional[bool] = None
    department_id: Optional[int] = None
    password: Optional[str] = None

    @field_validator("username", mode="before")
    def validate_username(cls, value):
        if value is None:
            return value
        if len(value) < 3:
            raise ValueError("Username must be at least 3 characters long.")
        if not re.match(r"^[A-Za-z0-9._-]+$", value):
            raise ValueError("Username can contain only Latin letters, digits, dots, underscores, and dashes.")
        return value

    @field_validator("password", mode="before")
    def validate_password(cls, value):
        if value is None:
            return value
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not re.match(r"^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$", value):
            raise ValueError("Password must contain at least one letter, one digit, and one special character.")
        return value

# Модель для ответа с данными пользователя
class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    department_id: Optional[int] = None
    roles: List[Any] = []
    post_id:Optional[int] = None
    class Config:
        orm_mode = True


class AuditLogCreate(BaseModel):
    user_id: int
    action: ActionType
    entity_type: str
    entity_id: Optional[str] = None
    old_data: Optional[Dict[str, Any]] = None
    new_data: Optional[Dict[str, Any]] = None
    performed_by: int
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    reason: Optional[str] = None


class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    action: str
    entity_type: str
    entity_id: Optional[str]
    old_data: Optional[dict]
    new_data: Optional[dict]
    performed_by: int
    ip_address: Optional[str]
    user_agent: Optional[str]
    reason: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True


class AuditLogFilter(BaseModel):
    user_id: Optional[int] = None
    action: Optional[ActionType] = None
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    performer_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    limit: Optional[int] = 100

class PostCreate(BaseModel):
    name:str
    description:str
    organization_id: int


class PostSchema(PostCreate):
    id:int
    created_at:datetime
    updated_at:datetime


class AuthLogResponse(BaseModel):
    id: int
    user_id: int
    username: str
    action: str
    timestamp: datetime
    ip_address: str
    user_agent: str

    class Config:
        orm_mode = True