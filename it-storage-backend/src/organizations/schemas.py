from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from src.departments.schemas import DepartmentSchema

class OrganizationBase(BaseModel):
    name: str
    email:str | None = Field(None, pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", description="Valid email format")
    phone:str | None = Field(None, pattern=r"^\+?[0-9]+$", description="Valid phone number")
    address: str | None = None
    notes: str | None = None


class OrganizationResponse(OrganizationBase):
    id: int
    departments: list[DepartmentSchema] | None = None
    created_at: datetime | str
    updated_at: datetime | str
    model_config = ConfigDict(from_attributes=True)

