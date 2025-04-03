from datetime import datetime
from typing import List, Optional,ForwardRef

from pydantic import BaseModel, Field, field_validator

RoleSchema = 'RoleSchema'

class RightCreate(BaseModel):
    name: str
    description: Optional[str] = None
    parent_id: Optional[int] = None


class RightSchema(RightCreate):
    id: int
    created_at: datetime
    updated_at: datetime
    parent_id: Optional[int] = None
    children: List["RightSchema"] = None

    class Config:
        orm_mode = True



class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    parent_id: Optional[int] = None


class RoleSchema(RoleCreate):
    id: int
    created_at: datetime
    updated_at: datetime
    rights: List[RightSchema] = []
    children: List["RoleSchema"] = []

    class Config:
        orm_mode = True

RoleSchema.model_rebuild()

class RoleRightCreate(BaseModel):
    role_id: int
    right_id: int

class RoleRightResponse(RoleRightCreate):
    class Config:
        from_attributes = True


class BulkUpdateRequest(BaseModel):
    role_ids: List[int]
    right_id: int
    action: str  # 'add' или 'remove'

    @field_validator('action')
    def validate_action(cls, v):
        if v not in ('add', 'remove'):
            raise ValueError("Action must be either 'add' or 'remove'")
        return v


class PageCreate(BaseModel):
    path: str
    name:str
    description:str | None = None
    right_ids: List[int] = []


class PageUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    right_ids: List[int] | None = None