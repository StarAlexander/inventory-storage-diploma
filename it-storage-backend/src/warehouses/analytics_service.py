from datetime import datetime, timedelta
from sqlalchemy import func
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from src.database import AsyncSessionLocal
from src.warehouses.models import WarehouseTransaction, WarehouseZone
from typing import Any, List, Dict


class AnalyticsService:
    @staticmethod
    async def get_inventory_levels() -> List[Dict[str, int]]:
        """Возвращает количество оборудования на каждом складе и зоне"""
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(WarehouseZone)
                .options(selectinload(WarehouseZone.equipments))
            )
            zones = result.unique().scalars().all()
            print(zones)
            inventory = [
                {
                    "warehouseId": zone.warehouse_id,
                    "zoneId": zone.id,
                    "totalCount": len(zone.equipments) if hasattr(zone, "equipments") else 0
                }
                for zone in zones
            ]
            print(inventory)
            return inventory

    @staticmethod
    async def get_transaction_summary(days: int = 7) -> List[Dict[str, Any]]:
        """Возвращает количество транзакций по типам за последние N дней"""
        start_date = datetime.now() - timedelta(days=days)

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