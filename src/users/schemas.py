from pydantic import BaseModel, field_validator, ConfigDict
import re

class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: str

    @field_validator("password")
    def validate_password(cls, value):
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long.")

        # Проверка на латиницу, цифры и спецсимволы
        if not re.match(r"^[A-Za-z0-9!@#$%^&*()_+=\-{}\[\]:;\"'<>,.?/|\\~`]+$", value):
            raise ValueError("Password must contain only Latin letters, digits, and special characters.")

        return value


class UserResponse(UserBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
