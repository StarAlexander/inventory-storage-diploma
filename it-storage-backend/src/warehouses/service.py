from datetime import datetime
import json
from typing import Optional
from sqlalchemy import or_
from sqlalchemy.future import select
from sqlalchemy.orm import aliased
from src.database import AsyncSessionLocal
from src.warehouses.models import Warehouse, WarehouseZone, WarehouseTransaction, DocumentTemplate, WarehouseDocument
from src.objects.models import Object
from src.users.models import User
from src.warehouses.schemas import TransactionCreate, TransactionOperation
from src.warehouses.document_service import DocumentService
from fastapi import HTTPException
from src.utils.load_relationships import load_relationships
from src.utils.crypto import sign_document

class WarehouseService:
    @staticmethod
    async def create_warehouse(warehouse: dict):
        async with AsyncSessionLocal() as db:
            db_warehouse = Warehouse(**warehouse)
            db.add(db_warehouse)
            await db.commit()
            await db.refresh(db_warehouse)
            return db_warehouse

    @staticmethod
    async def list_warehouses():
        async with AsyncSessionLocal() as db:
            result = await db.execute(load_relationships(Warehouse,select(Warehouse)))
            return result.unique().scalars().all()
        

    
    @staticmethod
    async def get_by_id(id:int):
        async with AsyncSessionLocal() as db:
            result = await db.execute(load_relationships(Warehouse,select(Warehouse).where(Warehouse.id == id)))
            return result.unique().scalar_one_or_none()

    @staticmethod
    async def create_zone(zone: dict):
        async with AsyncSessionLocal() as db:
            db_zone = WarehouseZone(**zone)
            db.add(db_zone)
            await db.commit()
            await db.refresh(db_zone)
            return db_zone

    @staticmethod
    async def list_zones(warehouse_id: int):
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                load_relationships(WarehouseZone,select(WarehouseZone).where(WarehouseZone.warehouse_id == warehouse_id))
            )
            return result.unique().scalars().all()


    @staticmethod
    async def create_doc_template(data:dict):
        async with AsyncSessionLocal() as db:
            dt = DocumentTemplate(
                name=data["name"],
                type=data["type"]
            )

            db.add(dt)
            await db.commit()
            await db.refresh(dt)
            return dt
    
    @staticmethod
    async def process_transaction(data: TransactionCreate, current_user: User):
        async with AsyncSessionLocal() as db:
            # Получение объекта
            equipment = await db.get(Object, data.equipment_id)
            if not equipment:
                raise HTTPException(status_code=404, detail="Equipment not found")

            # Получение зон
            from_zone = await db.get(WarehouseZone, data.from_zone_id) if data.from_zone_id else None
            to_zone = await db.get(WarehouseZone, data.to_zone_id) if data.to_zone_id else None

            # Проверка корректности перехода зон
            if from_zone and to_zone and from_zone.warehouse_id != to_zone.warehouse_id:
                raise HTTPException(status_code=400, detail="Zones must belong to the same warehouse")

            # Обновление местоположения оборудования
            if to_zone:
                equipment.location_id = to_zone.id
                await db.commit()

            if data.operation == TransactionOperation.ISSUE:
                equipment.status = "in_repair" 
                from_zone = await db.get(WarehouseZone,equipment.location_id)


            if data.operation == TransactionOperation.WRITE_OFF:
                equipment.status = "decomissioned"

            # Создание транзакции
            db_transaction = WarehouseTransaction(
                equipment_id=data.equipment_id,
                from_zone_id=from_zone.id if from_zone else None,
                to_zone_id=data.to_zone_id if to_zone else None,
                operation=data.operation,
                user_id=current_user.id,
                repairer_id = data.repairer_id,
                note=data.note
            )
            db.add(db_transaction)
            await db.commit()
            await db.refresh(db_transaction)

            # Создание черновика документа
            print(data.operation.value)
            template = await db.execute(select(DocumentTemplate).where(DocumentTemplate.type == data.operation.value))
            template = template.scalars().first()
            print(template)
            if template:
                document = WarehouseDocument(
                    transaction_id = db_transaction.id,
                    warehouse_id = to_zone.warehouse_id if to_zone else from_zone.warehouse_id,
                    template_id=template.id,
                    document=b""
                )
                db.add(document)
                await db.commit()
                await db.refresh(document)
                document.document = await DocumentService.render_document_html(document.id)
                await db.commit()

            return db_transaction
        
    

    @staticmethod
    async def filter_transactions(
        warehouse_id: Optional[int] = None,
        operation: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ):
        from src.warehouses.models import WarehouseTransaction
        async with AsyncSessionLocal() as db:
            query = select(WarehouseTransaction)
            from_zone_alias = aliased(WarehouseZone)
            to_zone_alias = aliased(WarehouseZone)
            if warehouse_id is not None:
                query = (
                select(WarehouseTransaction)
                .outerjoin(from_zone_alias, WarehouseTransaction.from_zone_id == from_zone_alias.id)
                .outerjoin(to_zone_alias, WarehouseTransaction.to_zone_id == to_zone_alias.id)
                .where(
                    or_(
                        from_zone_alias.warehouse_id == warehouse_id,
                        to_zone_alias.warehouse_id == warehouse_id
                    )
                    )
                    )

            if operation:
                query = query.where(WarehouseTransaction.operation == operation)

            if start_date:
                query = query.where(WarehouseTransaction.timestamp >= start_date)

            if end_date:
                query = query.where(WarehouseTransaction.timestamp <= end_date)

            result = await db.execute(load_relationships(WarehouseTransaction,query))
            return result.unique().scalars().all()
    

    @staticmethod
    async def get_document_by_id(doc_id:int):
        async with AsyncSessionLocal() as db:
            res = await db.execute(load_relationships(WarehouseDocument,select(WarehouseDocument).where(WarehouseDocument.id == doc_id)))
            doc = res.unique().scalar_one_or_none()
            if not doc:
                raise HTTPException(status_code=404,detail="Document not found")
            return doc

    @staticmethod
    async def get_documents_by_warehouse_id(warehouse_id:int):
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                load_relationships(WarehouseDocument,select(WarehouseDocument).where(WarehouseDocument.warehouse_id == warehouse_id))
            )
            documents = result.unique().scalars().all()
            return documents
        
    
    @staticmethod
    async def create_document(warehouse_id:int,template_name:str):
       async with AsyncSessionLocal() as db:
            # Проверяем, существует ли склад
            warehouse = await db.get(Warehouse, warehouse_id)
            if not warehouse:
                raise HTTPException(status_code=404, detail="Склад не найден")

            # Проверяем, существует ли шаблон
            template = await db.execute(
                select(DocumentTemplate).where(DocumentTemplate.type == template_name)
            )
            template = template.scalars().first()
            if not template:
                raise HTTPException(status_code=404, detail="Шаблон не найден")

            # Создаем документ
            new_document = WarehouseDocument(
                template_id=template.id,
                warehouse_id=warehouse_id,
                signed=False,
            )

            db.add(new_document)
            await db.commit()
            await db.refresh(new_document)

            return {
                "message": "Документ успешно создан",
                "document_id": new_document.id,
                "template_name": template.name,
                "warehouse_id": warehouse_id,
            }
 

    @staticmethod
    async def get_documents_to_sign(user):
        async with AsyncSessionLocal() as db:
            # Предположим, что документы с signed=False требуют подписи
            result = await db.execute(
                load_relationships(WarehouseDocument,select(WarehouseDocument).where(WarehouseDocument.signed == False))
            )
            return result.scalars().all()

    @staticmethod
    async def sign_document(document_id: int, user):
        async with AsyncSessionLocal() as db:
            doc = await db.get(WarehouseDocument, document_id)
            if not doc:
                raise HTTPException(status_code=404, detail="Документ не найден")

            user = await db.get(User, user.id)
            if not user.public_key:
                raise HTTPException(status_code=400, detail="Пользователь не имеет открытого ключа")

            # Генерация подписи
            raw_data = {
                "generated_at":doc.generated_at.strftime('%d.%m.%Y %H:%M'),
                "template_id":doc.template_id
            }
            raw_data = json.dumps(raw_data).encode()
            signature = sign_document(raw_data, user.private_key)
            doc.signature = signature
            doc.signer_public_key = user.public_key
            doc.signed_by = user.id
            doc.signed = True
            doc.signed_at = datetime.now()
            await db.commit()
            return {"message": "Документ успешно подписан", "signature": signature}