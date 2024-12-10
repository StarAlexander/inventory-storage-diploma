from fastapi import HTTPException,APIRouter,status
import logging
from .schemas import OrganizationBase, OrganizationResponse
from .service import OrganizationService

logger = logging.getLogger("app")
router = APIRouter(tags=["Organizations"])

@router.post("/organizations/",response_model=OrganizationResponse)
async def create_organization(org_create: OrganizationBase):
    """Создает новую организацию"""
    try:
        print("sdflqwerpoi")
        org =  await OrganizationService.create_organization(org_create)
        return org
    except HTTPException as e:
        logger.error(f"Ошибка при создании организации: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail=str(e))
