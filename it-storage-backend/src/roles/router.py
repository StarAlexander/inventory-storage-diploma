from typing import List
from fastapi import Depends, HTTPException,APIRouter
from sqlalchemy import select
from src.repositories import check_permission
from sqlalchemy.orm import selectinload
from src.roles.schemas import EntityType,RightType, RoleCreate, RoleSchema
from src.roles.service import RoleService
from src.utils.get_current_user import get_current_user
from src.database import AsyncSessionLocal
from src.roles.models import Role
import logging

logger = logging.getLogger('app')


app = APIRouter(tags=["Roles, Rights"])


@app.post("/roles/", response_model=RoleSchema)
@check_permission(EntityType.ROLES,RightType.CREATE)
async def create_role(role: RoleCreate,current_user = Depends(get_current_user)):
    return await RoleService.create_role(role)


@app.get("/roles/", response_model=List[RoleSchema])
@check_permission(EntityType.ROLES,RightType.READ)
async def list_roles(current_user = Depends(get_current_user)):
    return await RoleService.get_all_roles()


@app.get("/roles/hierarchy")
@check_permission(EntityType.ROLES,RightType.READ)
async def get_roles_hierarchy(current_user = Depends(get_current_user)):
    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(
            select(Role)
            .options(selectinload(Role.children))
        )
            root_roles = result.unique().scalars().all()
            
            # Фильтруем только корневые роли
            return [role for role in root_roles if role.parent_id is None]
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))

@app.get("/roles/{role_id}")
@check_permission(EntityType.ROLES,RightType.READ)
async def get_role(role_id: int,current_user = Depends(get_current_user)):
    try:

        role = await RoleService.get_role_by_id(role_id)
        return role
    
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500,detail=str(e))


@app.put("/roles/{role_id}", response_model=RoleSchema)
@check_permission(EntityType.ROLES,RightType.UPDATE)
async def update_role(role_id: int, role: RoleCreate,current_user = Depends(get_current_user)):
    role = await RoleService.update_role(role_id, role)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


@app.delete("/roles/{role_id}")
@check_permission(EntityType.ROLES,RightType.DELETE)
async def delete_role(role_id: int):
    role = await RoleService.delete_role(role_id,current_user = Depends(get_current_user))
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role