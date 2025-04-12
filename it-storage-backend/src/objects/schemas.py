from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, field_validator

class ObjectCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None


class ObjectCategorySchema(ObjectCategoryCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True



class SelectValue(BaseModel):
    value: str

class DynamicFieldCreate(BaseModel):
    category_id: int
    name: str
    field_type: str
    description: Optional[str]
    select_options: List[SelectValue] | None = None


class DynamicFieldSchema(BaseModel):
    id: int
    category_id: int
    name: str
    field_type: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime

    select_options:List[SelectValue] | None = None

    class Config:
        orm_mode = True


class ObjectCreate(BaseModel):
    category_id: int
    department_id: int
    name: str
    description: Optional[str]
    inventory_number: str
    serial_number: str
    cost: Optional[float]
    purchase_date: Optional[str] = None
    warranty_expiry_date: Optional[str] = None
    status: str = None
    dynamic_values: List[Dict[str,int | str]]  # e.g.: [{"field_id": 1, "value": "some_value"}]

    @field_validator('purchase_date', 'warranty_expiry_date', mode='before')
    def parse_dates(cls, value):
        if not value:
            return None
        try:
            # Parse from MySQL format if needed
            if isinstance(value, str) and 'T' in value:
                return datetime.fromisoformat(value.replace('Z', '+00:00')).strftime('%Y-%m-%d %H:%M:%S')
            return value
        except ValueError:
            raise ValueError("Invalid date format. Expected YYYY-MM-DD HH:MM:SS")


class ObjectUpdate(BaseModel):
    category_id: Optional[int] = None
    department_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str]= None
    inventory_number: str= None
    serial_number: str= None
    cost: Optional[float]= None
    purchase_date: Optional[str]= None
    warranty_expiry_date: Optional[str]= None
    dynamic_values: Optional[List[Dict[str, str | int]]]= None  # e.g.: [{"field_id": 1, "value": "some_value"}]
    requests: Optional[object] = None

    @field_validator('purchase_date', 'warranty_expiry_date', mode='before')
    def parse_dates(cls, value):
        if not value:
            return None
        try:
            # Parse from MySQL format if needed
            if isinstance(value, str) and 'T' in value:
                return datetime.fromisoformat(value.replace('Z', '+00:00')).strftime('%Y-%m-%d %H:%M:%S')
            return value
        except ValueError:
            raise ValueError("Invalid date format. Expected YYYY-MM-DD HH:MM:SS")


class FieldValueSchema(BaseModel):
    field_id:int
    value:str


class ObjectSchema(BaseModel):
    id: int
    category_id: int
    department_id: int
    name: str
    description: Optional[str]
    inventory_number: str
    serial_number: str
    cost: Optional[float]
    purchase_date: Optional[str] = None
    warranty_expiry_date: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    dynamic_values: Optional[List[Dict[str, str | int]]]= None


    @field_validator('purchase_date', 'warranty_expiry_date', mode='before')
    def parse_dates(cls, value):
        if not value:
            return None
        try:
            # Parse from MySQL format if needed
            if isinstance(value, str) and 'T' in value:
                return datetime.fromisoformat(value.replace('Z', '+00:00')).strftime('%Y-%m-%d %H:%M:%S')
            return value
        except ValueError:
            raise ValueError("Invalid date format. Expected YYYY-MM-DD HH:MM:SS")

    class Config:
        orm_mode = True