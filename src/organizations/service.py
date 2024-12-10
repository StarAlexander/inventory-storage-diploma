from src.database import SessionLocal
from .schemas import OrganizationBase
from .models import Organization
from fastapi import HTTPException
from .repository import OrganizationRepository
import logging
logger = logging.getLogger("app")


class OrganizationService:

    @staticmethod
    async def create_organization(org_create:OrganizationBase) -> Organization:
        async with SessionLocal() as session:
            repo = OrganizationRepository(session)
            existing = await repo.get_organization_by_name(org_create.name)
            if existing:
                raise HTTPException(status_code=400,detail="Such organization exists")
            org = Organization(
            name=org_create.name,
            phone = org_create.phone,
            address = org_create.address,
            email = org_create.email,
            notes = org_create.notes,
        )
            
            await repo.create_organization(org)
            logger.info(f"Организация успешно создана")
            return org
    