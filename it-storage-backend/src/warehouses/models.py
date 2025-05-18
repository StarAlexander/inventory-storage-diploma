# src/warehouses/models.py

from sqlalchemy import Boolean, Column, Integer, String, Enum, ForeignKey, DateTime, Text, BLOB,func
from sqlalchemy.orm import relationship
from src.database import Base

class Warehouse(Base):
    __tablename__ = 'warehouses'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    address = Column(String(255), nullable=False)
    manager_id = Column(Integer, ForeignKey('users.id'))
    organization_id = Column(Integer,ForeignKey('organizations.id'))

    organization = relationship("Organization")
    manager = relationship("User", back_populates="managed_warehouses")
    zones = relationship("WarehouseZone", back_populates="warehouse")

class WarehouseZone(Base):
    __tablename__ = 'warehouse_zones'

    id = Column(Integer, primary_key=True, autoincrement=True)
    warehouse_id = Column(Integer, ForeignKey('warehouses.id'), nullable=False)
    name = Column(String(255), nullable=False)
    type = Column(Enum('RECEIPT', 'STORAGE', 'SHIPPING', 'REPAIR'), nullable=False)
    department_id = Column(Integer,ForeignKey("departments.id"))

    department = relationship("Department")
    warehouse = relationship("Warehouse", back_populates="zones")
    transactions_from = relationship("WarehouseTransaction", foreign_keys='WarehouseTransaction.from_zone_id', back_populates="from_zone")
    transactions_to = relationship("WarehouseTransaction", foreign_keys='WarehouseTransaction.to_zone_id', back_populates="to_zone")
    equipments = relationship("Object",back_populates="location")

class WarehouseTransaction(Base):
    __tablename__ = 'warehouse_transactions'

    id = Column(Integer, primary_key=True, autoincrement=True)
    equipment_id = Column(Integer, ForeignKey('objects.id'), nullable=False)
    from_zone_id = Column(Integer, ForeignKey('warehouse_zones.id'))
    to_zone_id = Column(Integer, ForeignKey('warehouse_zones.id'))
    operation = Column(Enum('RECEIPT', 'PUTAWAY', 'MOVE', 'ISSUE', 'RETURN', 'REPAIR', 'WRITE_OFF'), nullable=False)
    timestamp = Column(DateTime, default=func.now())
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    note = Column(Text)
    repairer_id = Column(Integer,ForeignKey('users.id'))
    equipment = relationship("Object", back_populates="transactions")
    from_zone = relationship("WarehouseZone", foreign_keys=[from_zone_id], back_populates="transactions_from")
    to_zone = relationship("WarehouseZone", foreign_keys=[to_zone_id], back_populates="transactions_to")
    user = relationship("User", foreign_keys=[user_id], back_populates="transactions")
    repairer = relationship("User",foreign_keys=[repairer_id],back_populates="repair_transactions")

class DocumentTemplate(Base):
    __tablename__ = 'warehouse_document_templates'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    type = Column(Enum('RECEIPT', 'MOVE', 'ISSUE', 'WRITE_OFF'), nullable=False)
    documents = relationship("WarehouseDocument", back_populates="template")

class WarehouseDocument(Base):
    __tablename__ = 'warehouse_documents'

    id = Column(Integer, primary_key=True, autoincrement=True)
    template_id = Column(Integer, ForeignKey('warehouse_document_templates.id'), nullable=False)
    transaction_id = Column(Integer,ForeignKey('warehouse_transactions.id'))
    warehouse_id = Column(Integer,ForeignKey('warehouses.id'),nullable=False)
    document = Column(Text, nullable=False)
    generated_path = Column(String(255))
    generated_at = Column(DateTime, default=func.now())
    signed = Column(Boolean, default=False)  # Подписан ли
    signature = Column(Text)  # Хранение сигнатуры в base64
    signer_public_key = Column(Text)  # Открытый ключ пользователя
    signed_by = Column(Integer, ForeignKey("users.id"))  # Кто подписал
    signed_at = Column(DateTime)  # Когда подписан
    signer = relationship("User")  # Связь с пользователем
    warehouse = relationship("Warehouse")
    template = relationship("DocumentTemplate", back_populates="documents")