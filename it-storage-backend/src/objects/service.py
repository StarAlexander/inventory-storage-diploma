from typing import Dict
from src.objects.schemas import ObjectCategoryCreate, DynamicFieldCreate, ObjectCreate, ObjectUpdate
from src.repositories import DynamicFieldRepository, ObjectCategoryRepository, ObjectRepository
from src.database import AsyncSessionLocal

class ObjectCategoryService:


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