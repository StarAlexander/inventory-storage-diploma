
from enum import Enum
from pydantic import BaseModel, Field
from datetime import datetime

class ZoneType(str, Enum):
    RECEIPT = "RECEIPT"
    STORAGE = "STORAGE"
    SHIPPING = "SHIPPING"
    REPAIR = "REPAIR"

class TransactionOperation(str, Enum):
    RECEIPT = "RECEIPT"
    PUTAWAY = "PUTAWAY"
    MOVE = "MOVE"
    ISSUE = "ISSUE"
    RETURN = "RETURN"
    REPAIR = "REPAIR"
    WRITE_OFF = "WRITE_OFF"

class WarehouseCreate(BaseModel):
    name: str
    address: str
    manager_id: int
    organization_id: int

class WarehouseRead(BaseModel):
    id: int
    name: str
    address: str
    manager_id: int

    class Config:
        orm_mode = True

class ZoneCreate(BaseModel):
    warehouse_id: int
    department_id: int
    name: str
    type: ZoneType

class ZoneRead(BaseModel):
    id: int
    warehouse_id: int
    name: str
    type: ZoneType

    class Config:
        orm_mode = True

class TransactionCreate(BaseModel):
    equipment_id: int
    from_zone_id: int | None = None
    to_zone_id: int | None = None
    operation: TransactionOperation
    note: str | None = None

class TransactionRead(BaseModel):
    id: int
    equipment_id: int
    from_zone_id: int | None = None
    to_zone_id: int | None = None
    operation: TransactionOperation
    timestamp: datetime
    user_id: int
    note: str | None = None

    class Config:
        orm_mode = True

class DocumentTemplateRead(BaseModel):
    id: int
    name: str
    template: str

    class Config:
        orm_mode = True

class WarehouseDocumentRead(BaseModel):
    id: int
    template_id: int
    document: bytes
    generated_at: datetime

    class Config:
        orm_mode = True