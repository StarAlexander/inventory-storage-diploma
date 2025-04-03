from typing import List
from fastapi import APIRouter, HTTPException

from src.departments.schemas import DepartmentCreate
from src.organizations.schemas import OrganizationBase, OrganizationResponse
from src.organizations.service import OrganizationService

app = APIRouter(tags=["Organizations"])



@app.post("/organizations/", response_model=OrganizationResponse)
async def create_organization(org: OrganizationBase):
    return await OrganizationService.create_organization(org)


@app.get("/organizations/", response_model=List[OrganizationResponse])
async def list_organizations():
    try:
        orgs = await OrganizationService.get_all_organizations()
        return orgs
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))


@app.get("/organizations/{org_id}", response_model=OrganizationResponse)
async def get_organization(org_id: int ):
    org = await OrganizationService.get_organization_by_id(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


@app.put("/organizations/{org_id}", response_model=OrganizationResponse)
async def update_organization(org_id: int, org: OrganizationBase ):
    org = await OrganizationService.update_organization(org_id, org)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


@app.delete("/organizations/{org_id}",status_code=200)
async def delete_organization(org_id: int ):
    await OrganizationService.delete_organization(org_id)
    return {"message": "Organization deleted successfully"}
