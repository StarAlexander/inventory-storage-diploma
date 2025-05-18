import json
import os
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from typing import Optional
from datetime import datetime

from fastapi.params import Body, Query
from fastapi.responses import FileResponse

from src.database import AsyncSessionLocal
from src.warehouses.analytics_service import AnalyticsService
from src.utils.get_current_user import get_current_user
from src.roles.schemas import EntityType, RightType
from src.repositories import check_permission
from src.warehouses.service import WarehouseService
from src.warehouses.schemas import (
    WarehouseCreate,
    ZoneCreate,
    TransactionCreate
)
from src.warehouses.document_service import DocumentService
from src.warehouses.models import WarehouseDocument

warehouse_router = APIRouter(tags=["Warehouses"])

# === Склады ===

@warehouse_router.post("/warehouses/")
@check_permission(EntityType.WAREHOUSES, RightType.CREATE)
async def create_warehouse_route(
    warehouse: WarehouseCreate,
    current_user=Depends(get_current_user)
):
    return await WarehouseService.create_warehouse(warehouse.model_dump())


@warehouse_router.get("/warehouses/")
@check_permission(EntityType.WAREHOUSES, RightType.READ)
async def list_warehouses_route(current_user=Depends(get_current_user)):
    return await WarehouseService.list_warehouses()


@warehouse_router.get("/warehouses/by-id/{id}")
@check_permission(EntityType.WAREHOUSES,RightType.READ)
async def get_warehouse_by_id(id:int,current_user = Depends(get_current_user)):
    return await WarehouseService.get_by_id(id)

# === Зоны ===

@warehouse_router.get("/warehouses/{warehouse_id}/zones")
@check_permission(EntityType.WAREHOUSE_ZONES, RightType.READ)
async def list_zones_route(warehouse_id: int, current_user=Depends(get_current_user)):
    return await WarehouseService.list_zones(warehouse_id)


@warehouse_router.post("/warehouses/{warehouse_id}/zones")
@check_permission(EntityType.WAREHOUSE_ZONES, RightType.CREATE)
async def create_zone_route(
    warehouse_id: int,
    zone: ZoneCreate,
    current_user=Depends(get_current_user)
):
    zone_data = zone.model_dump()
    zone_data["warehouse_id"] = warehouse_id
    return await WarehouseService.create_zone(zone_data)


# === Транзакции ===

@warehouse_router.post("/warehouses/transactions")
@check_permission(EntityType.WAREHOUSE_TRANSACTIONS, RightType.CREATE)
async def process_transaction_route(
    transaction: TransactionCreate,
    current_user=Depends(get_current_user)
):
    return await WarehouseService.process_transaction(transaction,current_user)


@warehouse_router.get("/warehouses/transactions")
@check_permission(EntityType.WAREHOUSE_TRANSACTIONS, RightType.READ)
async def filter_transactions_route(
    warehouse_id: Optional[int] = None,
    operation: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user=Depends(get_current_user)
):
    return await WarehouseService.filter_transactions(
        warehouse_id=warehouse_id,
        operation=operation,
        start_date=start_date,
        end_date=end_date
    )


@warehouse_router.post("/warehouses/documents", response_model=dict)
@check_permission(EntityType.WAREHOUSE_DOCUMENTS, RightType.CREATE)
async def create_document(
    warehouse_id: int,
    template_name: str,
    current_user=Depends(get_current_user)
):
    """
    создание документа по шаблону и привязка к складу
    """
    return await WarehouseService.create_document(warehouse_id,template_name)



@warehouse_router.post("/documents/{id}/generate")
@check_permission(EntityType.WAREHOUSE_DOCUMENTS, RightType.READ)
async def generate_pdf(
    id: int,
    backgroundTasks: BackgroundTasks,
    current_user=Depends(get_current_user)
):
    backgroundTasks.add_task(DocumentService.save_to_server,id)
    return {"status": "success", "message": "PDF будет создан в фоне", "document_id": id}


@warehouse_router.get("/documents/pdf/{id}")
async def download_document(id: int):
    file_path = f"media/documents/{id}.pdf"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Файл ещё не готов")

    return FileResponse(
        path=file_path,
        filename=f"document_{id}.pdf",
        media_type="application/pdf"
    )

@warehouse_router.get("/warehouses/documents")
@check_permission(EntityType.WAREHOUSE_DOCUMENTS, RightType.READ)
async def list_documents(warehouse_id: int = Query(...), current_user = Depends(get_current_user)):
    """Возвращает список документов по складу"""
    return await WarehouseService.get_documents_by_warehouse_id(warehouse_id)


@warehouse_router.put("/warehouses/documents/{document_id}")
@check_permission(EntityType.WAREHOUSE_DOCUMENTS, RightType.UPDATE)
async def update_document(document_id: int, data: dict, current_user=Depends(get_current_user)):
    async with AsyncSessionLocal() as db:
        doc = await db.get(WarehouseDocument, document_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Документ не найден")

        doc.document = data.get("document", doc.document)
        await db.commit()
        return {"message": "Документ обновлен", "document_id": doc.id}


@warehouse_router.get("/warehouses/documents/by-id/{doc_id}")
@check_permission(EntityType.WAREHOUSE_DOCUMENTS, RightType.READ)
async def get_document(doc_id: int,current_user = Depends(get_current_user)):
    """Возвращает документ по id"""
    return await WarehouseService.get_document_by_id(doc_id)

@warehouse_router.get("/warehouses/documents/to-sign")
@check_permission(EntityType.WAREHOUSE_DOCUMENTS, RightType.READ)
async def get_documents_to_sign(current_user=Depends(get_current_user)):
    """Возвращает список документов, требующих подписи"""
    return await WarehouseService.get_documents_to_sign(current_user)


@warehouse_router.post("/warehouses/documents/{document_id}/sign")
@check_permission(EntityType.WAREHOUSE_DOCUMENTS, RightType.UPDATE)
async def sign_document(document_id: int, current_user=Depends(get_current_user)):
    result = await WarehouseService.sign_document(document_id, current_user)
    if not result:
        raise HTTPException(status_code=400, detail="Ошибка при подписании документа")
    return {"message": "Документ подписан", document_id:document_id}


@warehouse_router.post("/verify-signature")
@check_permission(EntityType.WAREHOUSE_DOCUMENTS, RightType.READ)
async def verify_signature(
    doc_id: int = Body(...),
    public_key: str = Body(...),
    signature: str = Body(...),
    current_user = Depends(get_current_user)
):
    from src.utils.crypto import verify_document
    doc = await WarehouseService.get_document_by_id(doc_id)
    raw_data = {
                "generated_at":doc.generated_at.strftime('%d.%m.%Y %H:%M'),
                "template_id":doc.template_id
            }
    raw_data = json.dumps(raw_data).encode()
    valid = verify_document(raw_data, public_key, signature)
    return valid




@warehouse_router.get("/warehouses/analytics/inventory-levels")
@check_permission(EntityType.WAREHOUSES, RightType.READ)
async def inventory_levels(current_user=Depends(get_current_user)):
    data = await AnalyticsService.get_inventory_levels()
    return data


@warehouse_router.get("/warehouses/analytics/transactions-summary")
@check_permission(EntityType.WAREHOUSE_TRANSACTIONS, RightType.READ)
async def transaction_summary(days: int = 7, current_user=Depends(get_current_user)):
    data = await AnalyticsService.get_transaction_summary(days)
    return data


@warehouse_router.get("/warehouses/analytics/low-stock")
@check_permission(EntityType.WAREHOUSE_ZONES, RightType.READ)
async def low_stock_zones(threshold: int = 5, current_user=Depends(get_current_user)):
    data = await AnalyticsService.get_low_stock_zones(threshold)
    return data


@warehouse_router.get("/warehouses/analytics/transactions-by-day")
@check_permission(EntityType.WAREHOUSE_TRANSACTIONS, RightType.READ)
async def get_transactions_by_day(days: int = 7, current_user=Depends(get_current_user)):

    return await AnalyticsService.get_transactions_by_day(days)