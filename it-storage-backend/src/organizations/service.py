from typing import List

from fastapi import HTTPException
from src.database import AsyncSessionLocal
from src.departments.models import Department
from src.organizations.models import Organization
from src.departments.schemas import DepartmentCreate
from src.organizations.schemas import OrganizationBase
from src.repositories import OrganizationRepository
import logging

logger = logging.getLogger("app")

class OrganizationService:




    @staticmethod
    async def count():
        async with AsyncSessionLocal() as session:
            return await OrganizationRepository(session).count()
        

    @staticmethod
    async def create_organization(data: OrganizationBase):

        async with AsyncSessionLocal() as session:
            repo = OrganizationRepository(session)
            return await repo.create(data.model_dump())

    @staticmethod
    async def get_organization_by_id(id: int):

        async with AsyncSessionLocal() as session:
            repo = OrganizationRepository(session)
            return await repo.get_by_id(id)

    @staticmethod
    async def get_all_organizations() -> List[Organization]:
        """Получение списка всех организаций."""
        logger.info("Попытка получить список всех организаций")
        async with AsyncSessionLocal() as session:
            repo = OrganizationRepository(session)
            orgs = await repo.get_all()
            return orgs

    @staticmethod
    async def update_organization(id: int, data: OrganizationBase) -> Organization:
        """Обновление организации."""
        logger.info(f"Попытка обновить организацию с ID {id}")
        async with AsyncSessionLocal() as session:
            repo = OrganizationRepository(session)
            updated = await repo.update(id, data.model_dump())
            if not updated:
                raise HTTPException(status_code=500, detail="Не удалось обновить организацию")
            logger.info(f"Организация с ID {id} успешно обновлена")
            return updated

    @staticmethod
    async def delete_organization(id: int):
        """Удаление организации."""
        logger.info(f"Попытка удалить организацию с ID {id}")
        async with AsyncSessionLocal() as session:
            repo = OrganizationRepository(session)
            await repo.delete(id)
            logger.info(f"Организация с ID {id} успешно удалена")