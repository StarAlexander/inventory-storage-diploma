from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, field_validator

RoleSchema = 'RoleSchema'

class EntityType(str, Enum):
    ORGANIZATIONS = "organizations"
    DEPARTMENTS = "departments"
    CATEGORIES = "categories"
    DYNAMIC_FIELDS = "dynamic_fields"
    OBJECTS = "objects"
    ROLES = "roles"
    RIGHTS = "rights"
    ROLE_PERMISSIONS = "role_rights"
    USERS = "users"
    POSTS = "posts"

class RightType(str, Enum):
    READ = "read"
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"

class RightCreate(BaseModel):
    entity_type: EntityType
    right_type: RightType

class RoleCreate(BaseModel):
    name: str
    description: str
    rights: List[RightCreate]


class RightSchema(RightCreate):
    id: int
    created_at: datetime
    updated_at: datetime
    parent_id: Optional[int] = None
    children: List["RightSchema"] = None

    class Config:
        orm_mode = True


class RoleSchema(RoleCreate):
    id: int
    created_at: datetime
    updated_at: datetime
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