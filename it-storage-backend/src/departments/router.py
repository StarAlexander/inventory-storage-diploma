from typing import List
from fastapi import Depends, HTTPException
from src.departments.schemas import DepartmentCreate, DepartmentSchema
from src.repositories import check_permission
from src.utils.get_current_user import get_current_user
from src.roles.schemas import EntityType, RightType
from src.departments.service import DepartmentService
from fastapi import APIRouter


app = APIRouter(tags=["Departments"])



@app.post("/departments/", response_model=DepartmentSchema)
@check_permission(EntityType.DEPARTMENTS,RightType.CREATE)
async def create_department(dept: DepartmentCreate,current_user = Depends(get_current_user)):
    return await DepartmentService.create_department(dept)


@app.get("/departments/", response_model=List[DepartmentSchema])
@check_permission(EntityType.DEPARTMENTS,RightType.READ)
async def list_departments(current_user = Depends(get_current_user)):
    return await DepartmentService.get_all_departments()


@app.get("/departments/{dept_id}", response_model=DepartmentSchema)
@check_permission(EntityType.DEPARTMENTS,RightType.READ)
async def get_department(dept_id: int, current_user = Depends(get_current_user) ):
    dept = await DepartmentService.get_department_by_id(dept_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return dept


@app.put("/departments/{dept_id}", response_model=DepartmentSchema)
@check_permission(EntityType.DEPARTMENTS,RightType.UPDATE)
async def update_department(dept_id: int, dept: DepartmentCreate, current_user = Depends(get_current_user)):
    dept = await DepartmentService.update_department(dept_id, dept)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return dept


@app.delete("/departments/{dept_id}")
@check_permission(EntityType.DEPARTMENTS,RightType.DELETE)
async def delete_department(dept_id: int, current_user = Depends(get_current_user)):
    msg = await DepartmentService.delete_department(dept_id)
    if not msg:
        raise HTTPException(status_code=404,detail="No such department")
    return msg 
