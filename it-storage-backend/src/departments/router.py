from typing import List
from fastapi import HTTPException
from src.departments.schemas import DepartmentCreate, DepartmentSchema

from src.departments.service import DepartmentService
from fastapi import APIRouter


app = APIRouter(tags=["Departments"])



@app.post("/departments/", response_model=DepartmentSchema)
async def create_department(dept: DepartmentCreate):
    return await DepartmentService.create_department(dept)


@app.get("/departments/", response_model=List[DepartmentSchema])
async def list_departments():
    return await DepartmentService.get_all_departments()


@app.get("/departments/{dept_id}", response_model=DepartmentSchema)
async def get_department(dept_id: int ):
    dept = await DepartmentService.get_department_by_id(dept_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return dept


@app.put("/departments/{dept_id}", response_model=DepartmentSchema)
async def update_department(dept_id: int, dept: DepartmentCreate):
    dept = await DepartmentService.update_department(dept_id, dept)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return dept


@app.delete("/departments/{dept_id}")
async def delete_department(dept_id: int):
    msg = await DepartmentService.delete_department(dept_id)
    if not msg:
        raise HTTPException(status_code=404,detail="No such department")
    return msg 
