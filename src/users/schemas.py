import re
from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict, field_validator

# Базовая модель для пользователя
class UserBase(BaseModel):
    username: str
    email: str | None = Field(None, pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", description="Valid email format")
    first_name: str | None = None
    last_name: str | None = None
    middle_name: str | None = None
    phone: str | None = Field(None, pattern=r"^\+?[0-9]+$", description="Valid phone number")
    is_system: bool = False
    hired_at: datetime | None = None
    

    @field_validator("username")
    def validate_username(cls, value):
        if len(value) < 3:
            raise ValueError("Username must be at least 3 characters long.")
        if not re.match(r"^[A-Za-z0-9._-]+$", value):
            raise ValueError("Username can contain only Latin letters, digits, dots, underscores, and dashes.")
        return value

# Модель для создания пользователя
class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters long.")

    @field_validator("password")
    def validate_password(cls, value):
        if not re.match(r"^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$", value):
            raise ValueError("Password must contain at least one letter, one digit, and one special character.")
        return value

# Модель для обновления пользователя
class UserUpdate(UserBase):
    password: str | None = Field(None, description="Optional new password.")

    @field_validator("password", mode="before")
    def validate_password(cls, value):
        if value and len(value) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if value and not re.match(r"^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$", value):
            raise ValueError("Password must contain at least one letter, one digit, and one special character.")
        return value

# Модель для ответа с данными пользователя
class UserResponse(UserBase):
    id: int
    status: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

