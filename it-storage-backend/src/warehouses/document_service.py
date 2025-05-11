# src/warehouses/document_service.py

import time
from pathlib import Path
from fastapi.responses import FileResponse, StreamingResponse
from jinja2 import Environment, FileSystemLoader, select_autoescape
import os
from weasyprint import HTML
from sqlalchemy import select
from src.utils.load_relationships import load_relationships
from src.warehouses.models import Warehouse, WarehouseDocument, WarehouseTransaction, WarehouseZone
from src.database import AsyncSessionLocal
from src.objects.models import Object
from src.users.models import User
from src.utils.generate_barcode import generate_barcode

# Путь к шаблонам
TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "templates")
env = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR),
    autoescape=select_autoescape(['html', 'xml'])
)

class DocumentService:
    @staticmethod
    async def render_document_html(document_id: int) -> str:
        async with AsyncSessionLocal() as db:
            res = await db.execute(load_relationships(WarehouseDocument,select(WarehouseDocument).where(WarehouseDocument.id == document_id)))
            doc = res.unique().scalar_one_or_none()
            if not doc:
                raise ValueError("Документ не найден")
            print(doc)
            template_name = {
                "RECEIPT": "pko.html",
                "ISSUE": "rko.html",
                "MOVE": "act_io.html",
                "WRITE_OFF": "act_wo.html"
            }.get(doc.template.type, "default.html")
            transaction = await db.get(WarehouseTransaction, doc.transaction_id)

            res = await db.execute(load_relationships(Warehouse,select(Warehouse).where(Warehouse.id == doc.warehouse_id)))
            warehouse = res.unique().scalar_one_or_none()
            res = await db.execute(load_relationships(WarehouseZone,select(WarehouseZone).where(WarehouseZone.id == transaction.from_zone_id)))
            from_zone = res.unique().scalar_one_or_none()
            res = await db.execute(load_relationships(WarehouseZone,select(WarehouseZone).where(WarehouseZone.id == transaction.to_zone_id)))
            to_zone = res.unique().scalar_one_or_none()
            res = await db.execute(load_relationships(Object, select(Object).where(Object.id==transaction.equipment_id)))
            item = res.unique().scalar_one_or_none()
            user = await db.get(User, transaction.user_id)
            barcode_image = generate_barcode(item.inventory_number)
            template = env.get_template(template_name)
            return template.render(
                doc=doc,
                transaction=transaction,
                item=item,
                warehouse = warehouse,
                from_zone = from_zone,
                to_zone = to_zone,
                user=user,
                barcode_image = barcode_image
            )

    @staticmethod
    async def save_to_server(document_id:int):
        try:
            async with AsyncSessionLocal() as db:
                doc = await db.get(WarehouseDocument, document_id)
                output_path = f"media/documents/{document_id}.pdf"


                # Путь к директории media/documents
                output_dir = "media/documents"
                output_path = f"{output_dir}/{document_id}.pdf"

                # Создаем директорию, если она не существует
                Path(output_dir).mkdir(parents=True, exist_ok=True)
                # Генерация PDF
                HTML(string=doc.document).write_pdf(output_path)
                doc.generated_path = output_path
                await db.commit()
        except Exception as e:
            print(e)
            raise