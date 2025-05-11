# src/warehouses/analytics_service.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from sqlalchemy.future import select
from src.database import AsyncSessionLocal
from src.warehouses.models import WarehouseZone, WarehouseTransaction
from typing import List, Dict, Any
from datetime import datetime, timedelta


class AnalyticsService:
    @staticmethod
    async def get_inventory_levels() -> List[Dict[str, int]]:
        """Возвращает количество оборудования на каждом складе и зоне"""
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(WarehouseZone.warehouse_id, WarehouseZone.id.label("zone_id"))
                .outerjoin(WarehouseZone.equipments)
                .group_by(WarehouseZone.warehouse_id, WarehouseZone.id)
            )
            zones = result.all()

            # Теперь считаем количество объектов в каждой зоне
            inventory = [
                {
                    "warehouseId": zone.warehouse_id,
                    "zoneId": zone.zone_id,
                    "totalCount": len(zone.equipment) if hasattr(zone, "equipment") else 0
                }
                for zone in zones
            ]
            return inventory

    @staticmethod
    async def get_transaction_summary(days: int = 7) -> List[Dict[str, Any]]:
        """Возвращает количество транзакций по типам за последние N дней"""
        start_date = datetime.utcnow() - timedelta(days=days)

        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(WarehouseTransaction.operation, func.count().label("count"))
                .where(WarehouseTransaction.timestamp >= start_date)
                .group_by(WarehouseTransaction.operation)
            )
            return [{"operation": op, "count": cnt} for op, cnt in result]

    @staticmethod
    async def get_low_stock_zones(threshold: int = 5) -> List[Dict[str, Any]]:
        """Возвращает список зон с количеством оборудования ниже порога"""
        inventory = await AnalyticsService.get_inventory_levels()
        low_stock = [item for item in inventory if item["totalCount"] < threshold]
        return low_stock
    

    @staticmethod
    async def get_transactions_by_day(days:int):
        async with AsyncSessionLocal() as db:
            from src.warehouses.models import WarehouseTransaction
            from datetime import datetime, timedelta

            seven_days_ago = datetime.now() - timedelta(days=days)
            result = await db.execute(
                select(func.date(WarehouseTransaction.timestamp), func.count(WarehouseTransaction.id))
                .where(WarehouseTransaction.timestamp >= seven_days_ago)
                .group_by(func.date(WarehouseTransaction.timestamp))
                .order_by(func.date(WarehouseTransaction.timestamp))
            )
            data = result.all()
            return [{"date": d.strftime('%Y-%m-%d'), "count": c} for d, c in data]