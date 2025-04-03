from typing import List
from fastapi import HTTPException,APIRouter
from sqlalchemy import and_, delete, insert, select
from sqlalchemy.orm import selectinload
from src.roles.schemas import BulkUpdateRequest, PageCreate, PageUpdate, RightCreate, RightSchema, RoleCreate, RoleRightCreate, RoleRightResponse, RoleSchema
from src.roles.service import RightsService, RoleService
from src.database import AsyncSessionLocal
from src.roles.models import Page, Right, Role, role_rights
import logging

logger = logging.getLogger('app')


app = APIRouter(tags=["Roles, Rights"])


@app.post("/roles/", response_model=RoleSchema)
async def create_role(role: RoleCreate):
    return await RoleService.create_role(role)


@app.get("/roles/", response_model=List[RoleSchema])
async def list_roles():
    return await RoleService.get_all_roles()


@app.get("/roles/hierarchy")
async def get_roles_hierarchy():
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
async def get_role(role_id: int):
    try:

        role = await RoleService.get_role_by_id(role_id)
        return role
    
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500,detail=str(e))


@app.put("/roles/{role_id}", response_model=RoleSchema)
async def update_role(role_id: int, role: RoleCreate):
    role = await RoleService.update_role(role_id, role)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


@app.delete("/roles/{role_id}")
async def delete_role(role_id: int):
    role = await RoleService.delete_role(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


@app.post("/rights/",response_model=RightSchema)
async def create_right(right:RightCreate):
    try:
        right = await RightsService.create_right(right)
        return right
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))


@app.get("/rights/",response_model=List[RightSchema])
async def get_rights():
    try:
        rights = await RightsService.get_all_rights()
        return rights
    
    except Exception as e:
        raise HTTPException(status_code=404,detail=str(e))


@app.get("/rights/{id}",response_model=RightSchema)
async def get_right_by_id(id: int):
    try:
        right = await RightsService.get_right_by_id(id)
        return right
    
    except Exception as e:
        raise HTTPException(status_code=404,detail=str(e))


@app.put("/rights/{id}",response_model=RightSchema)
async def update_right(id:int,data:RightCreate):
    try:
        right = await RightsService.update_right(id,data)
        return right
    
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))
    

@app.delete("/rights/{id}")
async def delete_right(id:int):
    try:
        msg = await RightsService.delete_right(id)
        return msg
    
    except Exception as e:
        raise HTTPException(status_code=404,detail=str(e))


@app.post("/role-rights/",response_model=RoleRightResponse)
async def create_role_right(rr: RoleRightCreate):
    try:
        async with AsyncSessionLocal() as session:
            # Проверяем существование роли и права
            role_exists = await session.execute(select(Role).where(Role.id == rr.role_id))
            if not role_exists.scalar_one_or_none():
                raise HTTPException(status_code=404, detail="Role not found")
                
            right_exists = await session.execute(select(Right).where(Right.id == rr.right_id))
            if not right_exists.scalar_one_or_none():
                raise HTTPException(status_code=404, detail="Right not found")
            
            stmt = role_rights.insert().values(role_id=rr.role_id, right_id=rr.right_id)
            await session.execute(stmt)
            await session.commit()
            return RoleRightResponse(role_id=rr.role_id, right_id=rr.right_id)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/role-rights/bulk")
async def bulk_update(
    request: BulkUpdateRequest
):
    try:
        async with AsyncSessionLocal() as db:
            logger.info(f"Starting bulk update for {len(request.role_ids)} roles")
        
            # Проверяем существование права
            right = await db.get(Right, request.right_id)
            if not right:
                logger.error(f"Right not found: {request.right_id}")
                raise HTTPException(status_code=404, detail="Right not found")

            if request.action == 'add':
                # Создаем список для массовой вставки
                values = [{"role_id": rid, "right_id": request.right_id} 
                        for rid in request.role_ids]
                
                # Исключаем уже существующие связи
                existing = await db.execute(
                    select(role_rights)
                    .where(role_rights.c.role_id.in_(request.role_ids))
                    .where(role_rights.c.right_id == request.right_id)
                )
                existing_ids = {r.role_id for r in existing}
                values = [v for v in values if v['role_id'] not in existing_ids]
                
                if values:
                    await db.execute(insert(role_rights), values)
                    logger.info(f"Added rights to {len(values)} roles")
                else:
                    logger.info("No new rights to add")

            elif request.action == 'remove':
                # Удаляем связи
                result = await db.execute(
                    delete(role_rights)
                    .where(and_(
                        role_rights.c.role_id.in_(request.role_ids),
                        role_rights.c.right_id == request.right_id
                    ))
                )
                logger.info(f"Removed rights from {result.rowcount} roles")

            await db.commit()
            return {"status": "success", "affected": len(request.role_ids)}
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/role-rights/",response_model=List[RoleRightResponse])
async def get_role_rights():
    try:
        async with AsyncSessionLocal() as session:
            # Правильный способ запроса данных из ассоциативной таблицы
            query = select(role_rights.c.role_id, role_rights.c.right_id)
            result = await session.execute(query)
            
            # Преобразуем результат в список словарей
            return [{"role_id": row.role_id, "right_id": row.right_id} for row in result]
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/role-rights/")
async def delete_role_right(rr: RoleRightCreate):
    try:
        async with AsyncSessionLocal() as session:
            role = await session.get(Role, rr.role_id)
            right = await session.get(Right, rr.right_id)
            
            if not role or not right:
                raise HTTPException(status_code=404, detail="Role or Right not found")
                
            stmt = role_rights.delete().filter(role_rights.c.role_id == rr.role_id, role_rights.c.right_id==rr.right_id)
            await session.execute(stmt)
            await session.commit()
            return {"message": "Relation removed successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))


@app.post("/roles/{role_id}/rights/")
async def add_right_to_role(role_id: int, right: RightCreate):
    try:
        return await RoleService.add_right_to_role(role_id, right)
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))

@app.delete("/roles/{role_id}/rights/{right_id}")
async def remove_right_from_role(role_id: int, right_id: int):
    try:
        return await RoleService.remove_right_from_role(role_id, right_id)
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))
    


@app.get("/admin/pages")
async def list_pages():
    try:

        async with AsyncSessionLocal() as db:
            res = await db.execute(select(Page).options(selectinload(Page.required_rights)))
            return res.scalars().unique().all()
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500,detail=str(e))


@app.get('/admin/pages/{id}')
async def get_page_by_id(id:int):
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Page).where(Page.id == id).options(selectinload(Page.required_rights)))
        return res.unique().scalar_one_or_none()



@app.post("/admin/pages")
async def create_page(page: PageCreate):
    # Check if page already exists
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Page).where(Page.path == page.path).options(selectinload(Page.required_rights)))
        existing_page = res.unique().scalar_one_or_none()
        if existing_page:
            raise HTTPException(status_code=400, detail="Page with this path already exists")
        
        # Get the rights
        res = await db.execute(select(Right).where(Right.id.in_(page.right_ids)))
        rights = res.scalars().unique().all()
        if len(rights) != len(page.right_ids):
            raise HTTPException(status_code=400, detail="One or more rights not found")
        
        # Create the page
        db_page = Page(
            path=page.path,
            name=page.name,
            description=page.description,
            required_rights=rights
        )
        db.add(db_page)
        await db.commit()
        return await get_page_by_id(db_page.id)

@app.put("/admin/pages/{page_id}")
async def update_page(
    page_id: int,
    page: PageUpdate
):
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Page).where(Page.id == page_id).options(selectinload(Page.required_rights)))
        db_page = await res.unique().scalar_one_or_none()
        if not db_page:
            raise HTTPException(status_code=404, detail="Page not found")
        
        # Update basic fields
        if page.name is not None:
            db_page.name = page.name
        if page.description is not None:
            db_page.description = page.description
        
        # Update rights if provided
        if page.right_ids is not None:
            res = await db.execute(select(Right).where(Right.id.in_(page.right_ids)))
            rights = res.scalars().unique().all()
            if len(rights) != len(page.right_ids):
                raise HTTPException(status_code=400, detail="One or more rights not found")
            db_page.required_rights = rights
        
        await db.commit()
        return await get_page_by_id(db_page.id)

@app.delete("/admin/pages/{page_id}")
async def delete_page(page_id: int):
    async with AsyncSessionLocal() as db:
        db_page = await db.get(Page,page_id)
        if not db_page:
            raise HTTPException(status_code=404, detail="Page not found")
        
        await db.delete(db_page)
        await db.commit()
        return {"message": "Page deleted successfully"}