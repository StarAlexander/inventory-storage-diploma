from src.database import AsyncSessionLocal
from src.departments.schemas import DepartmentCreate
from src.repositories import DepartmentRepository


class DepartmentService:



    @staticmethod
    async def count():
        async with AsyncSessionLocal() as session:
            return await DepartmentRepository(session).count()

    @staticmethod
    async def create_department(data: DepartmentCreate):
        async with AsyncSessionLocal() as session:
            repo = DepartmentRepository(session)
            return await repo.create(data.model_dump())


    @staticmethod
    async def get_all_departments():
        async with AsyncSessionLocal() as session:
            repo = DepartmentRepository(session)
            return await repo.get_all()


    @staticmethod
    async def get_department_by_id(id: int):
        async with AsyncSessionLocal() as session:
            repo = DepartmentRepository(session)
            return await repo.get_by_id(id)


    @staticmethod
    async def update_department(id: int, data: DepartmentCreate):
        async with AsyncSessionLocal() as session:
            repo = DepartmentRepository(session)
            return await repo.update(id, data.model_dump())


    @staticmethod
    async def delete_department(id: int):
        async with AsyncSessionLocal() as session:
            repo = DepartmentRepository(session)
            return await repo.delete(id)
    