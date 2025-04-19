from typing import List
from fastapi import APIRouter, Depends, HTTPException
from src.repositories import check_permission
from src.utils.get_current_user import get_current_user
from src.roles.schemas import EntityType,RightType
from src.organizations.schemas import OrganizationBase, OrganizationResponse
from src.organizations.service import OrganizationService

app = APIRouter(tags=["Organizations"])



@app.post("/organizations/", response_model=OrganizationResponse)
@check_permission(EntityType.ORGANIZATIONS,RightType.CREATE)
async def create_organization(org: OrganizationBase,current_user = Depends(get_current_user)):
    return await OrganizationService.create_organization(org)


@app.get("/organizations/", response_model=List[OrganizationResponse])
@check_permission(EntityType.ORGANIZATIONS, RightType.READ)
async def list_organizations(current_user = Depends(get_current_user)):
    try:
        orgs = await OrganizationService.get_all_organizations()
        return orgs
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))


@app.get("/organizations/{org_id}", response_model=OrganizationResponse)
@check_permission(EntityType.ORGANIZATIONS, RightType.READ)
async def get_organization(org_id: int, current_user = Depends(get_current_user) ):
    org = await OrganizationService.get_organization_by_id(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


@app.put("/organizations/{org_id}", response_model=OrganizationResponse)
@check_permission(EntityType.ORGANIZATIONS, RightType.UPDATE)
async def update_organization(org_id: int, org: OrganizationBase, current_user = Depends(get_current_user) ):
    org = await OrganizationService.update_organization(org_id, org)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


@app.delete("/organizations/{org_id}",status_code=200)
@check_permission(EntityType.ORGANIZATIONS, RightType.DELETE)
async def delete_organization(org_id: int,current_user = Depends(get_current_user) ):
    await OrganizationService.delete_organization(org_id)
    return {"message": "Organization deleted successfully"}
