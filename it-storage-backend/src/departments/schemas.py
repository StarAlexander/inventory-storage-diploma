from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class DepartmentCreate(BaseModel):
    organization_id: int
    name: str
    abbreviation: str
    description: Optional[str] = None


class DepartmentSchema(DepartmentCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True