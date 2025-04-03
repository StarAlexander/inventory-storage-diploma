from typing import Any, List
from fastapi import APIRouter, HTTPException
from src.objects.service import DynamicFieldService, ObjectCategoryService, ObjectService
from src.objects.schemas import DynamicFieldCreate, DynamicFieldSchema, ObjectCategoryCreate,ObjectCategorySchema, ObjectCreate, ObjectSchema, ObjectUpdate
import logging

logger = logging.getLogger("app")





# router

app = APIRouter(tags=["Object Categories, Dynamic Fields, Objects"])

@app.post("/object-categories/", response_model=ObjectCategorySchema)
async def create_category(category: ObjectCategoryCreate):
    return await ObjectCategoryService.create_category(category)


@app.get("/object-categories/", response_model=List[ObjectCategorySchema])
async def list_categories():
    return await ObjectCategoryService.get_all_categories()


@app.get("/object-categories/{cat_id}", response_model=ObjectCategorySchema)
async def get_category(cat_id: int):
    category = await ObjectCategoryService.get_category_by_id(cat_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@app.put("/object-categories/{cat_id}", response_model=ObjectCategorySchema)
async def update_category(cat_id: int, category: ObjectCategoryCreate):
    category = await ObjectCategoryService.update_category(cat_id, category)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@app.delete("/object-categories/{cat_id}")
async def delete_category(cat_id: int):
    category = await ObjectCategoryService.delete_category(cat_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


# Dynamic Fields

@app.post("/dynamic-fields/", response_model=DynamicFieldSchema)
async def create_dynamic_field(field: DynamicFieldCreate):
    return await DynamicFieldService.create_field(field)


@app.get("/dynamic-fields/", response_model=List[DynamicFieldSchema])
async def list_dynamic_fields():
    return await DynamicFieldService.get_all_fields()


@app.get("/dynamic-fields/{field_id}", response_model=DynamicFieldSchema)
async def get_dynamic_field(field_id: int):
    field = await DynamicFieldService.get_field_by_id(field_id)
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    return field


@app.put("/dynamic-fields/{field_id}", response_model=DynamicFieldSchema)
async def update_dynamic_field(field_id: int, field: DynamicFieldCreate):
    field = await DynamicFieldService.update_field(field_id, field)
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    return field


@app.delete("/dynamic-fields/{field_id}")
async def delete_dynamic_field(field_id: int):
    field = await DynamicFieldService.delete_field(field_id)
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    return field


# Objects

@app.post("/objects/")
async def create_object(obj: ObjectCreate):
    try:

        obj =  await ObjectService.create_object(obj)
        return obj
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))


@app.get("/objects/")
async def list_objects():
    return await ObjectService.get_all_objects()


@app.get("/objects/{obj_id}")
async def get_object(obj_id: int):
    obj = await ObjectService.get_object_by_id(obj_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")
    return obj


@app.put("/objects/{obj_id}")
async def update_object(obj_id: int, obj: ObjectUpdate):
    obj = await ObjectService.update_object(obj_id, obj)
    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")
    return obj


@app.delete("/objects/{obj_id}")
async def delete_object(obj_id: int):
    obj = await ObjectService.delete_object(obj_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")
    return obj