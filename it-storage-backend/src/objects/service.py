from typing import Dict

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from src.objects.schemas import ObjectCategoryCreate, DynamicFieldCreate, ObjectCreate, ObjectUpdate
from src.repositories import DynamicFieldRepository, ObjectCategoryRepository, ObjectRepository
from src.objects.models import Object,ObjectCategory
from src.organizations.models import Organization
from src.departments.models import Department
from src.database import AsyncSessionLocal

class ObjectCategoryService:


    @staticmethod
    async def count():
        async with AsyncSessionLocal() as session:
            return await ObjectCategoryRepository(session).count()


    @staticmethod
    async def create_category(data: ObjectCategoryCreate):
        async with AsyncSessionLocal() as session:
            repo = ObjectCategoryRepository(session)
            return await repo.create(data.model_dump())
    @staticmethod
    async def get_all_categories():
        async with AsyncSessionLocal() as session:
            repo = ObjectCategoryRepository(session)
            return await repo.get_all()
    @staticmethod
    async def get_category_by_id( id: int):
        async with AsyncSessionLocal() as session:
            repo = ObjectCategoryRepository(session)
            return await repo.get_by_id(id)
    @staticmethod
    async def update_category( id: int, data: ObjectCategoryCreate):
        async with AsyncSessionLocal() as session:
            repo = ObjectCategoryRepository(session)
            return await repo.update(id, data.model_dump())
    @staticmethod
    async def delete_category( id: int):
        async with AsyncSessionLocal() as session:
            repo = ObjectCategoryRepository(session)
            return await repo.delete(id)
    

class DynamicFieldService:

    @staticmethod
    async def create_field(data: DynamicFieldCreate):
        async with AsyncSessionLocal() as session:
            repo = DynamicFieldRepository(session)
            return await repo.create(data.model_dump())
    @staticmethod
    async def get_all_fields():
        async with AsyncSessionLocal() as session:
            repo = DynamicFieldRepository(session)
            return await repo.get_all()
    @staticmethod
    async def get_field_by_id( id: int):
        async with AsyncSessionLocal() as session:
            repo = DynamicFieldRepository(session)
            return await repo.get_by_id(id)
    @staticmethod
    async def update_field( id: int, data: DynamicFieldCreate):
        async with AsyncSessionLocal() as session:
            repo = DynamicFieldRepository(session)
            return await repo.update(id, data.model_dump())
    @staticmethod
    async def delete_field( id: int):
        async with AsyncSessionLocal() as session:
            repo = DynamicFieldRepository(session)
            return await repo.delete(id)
    

class ObjectService:




    @staticmethod
    async def count():
        async with AsyncSessionLocal() as session:
            return await ObjectRepository(session).count()
    @staticmethod
    async def create_object( data: ObjectCreate):
        async with AsyncSessionLocal() as session:
            repo = ObjectRepository(session)
            obj = await repo.create(data.model_dump())
            print(obj.__dict__)
            return obj
    @staticmethod
    async def get_all_objects():
        async with AsyncSessionLocal() as session:
            repo = ObjectRepository(session)
            return await repo.get_all()
        
    
    @staticmethod
    async def search_objects(query:str):
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(Object)
                .options(selectinload(Object.department).selectinload(Department.organization),
                         selectinload(Object.category))
                .where(Object.name.ilike(f"%{query}%"))
                .limit(10)
            )
            objects = result.unique().scalars().all()

            return [
                {
                    "id": obj.id,
                    "name": obj.name,
                    "organization": obj.department.organization if obj.department and obj.department.organization else None,
                    "department": obj.department if obj.department else None,
                    "category": obj.category if obj.category else None,
                }
                for obj in objects
            ]

    @staticmethod
    async def get_object_by_id( id: int):
        async with AsyncSessionLocal() as session:
            repo = ObjectRepository(session)
            return await repo.get_by_id(id)
    @staticmethod
    async def update_object( id: int, data: ObjectUpdate):
        async with AsyncSessionLocal() as session:
            repo = ObjectRepository(session)
            return await repo.update(id, data.model_dump())
    @staticmethod
    async def delete_object( id: int):
        async with AsyncSessionLocal() as session:
            repo = ObjectRepository(session)
            return await repo.delete(id)