from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class OrganizationBase(BaseModel):
    name: str
    email:str | None = Field(None, pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", description="Valid email format")
    phone:str | None = Field(None, pattern=r"^\+?[0-9]+$", description="Valid phone number")
    address: str | None = None
    notes: str | None = None


class OrganizationResponse(OrganizationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

