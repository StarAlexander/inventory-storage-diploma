from typing import List
from fastapi import APIRouter, Depends, HTTPException
from src.repositories import check_permission
from src.utils.get_current_user import get_current_user
from src.roles.schemas import EntityType, RightType
from src.objects.service import DynamicFieldService, ObjectCategoryService, ObjectService
from src.objects.schemas import DynamicFieldCreate, DynamicFieldSchema, ObjectCategoryCreate,ObjectCategorySchema, ObjectCreate, ObjectUpdate
import logging

logger = logging.getLogger("app")





# router

app = APIRouter(tags=["Object Categories, Dynamic Fields, Objects"])

@app.post("/object-categories/", response_model=ObjectCategorySchema)
@check_permission(EntityType.CATEGORIES,RightType.CREATE)
async def create_category(category: ObjectCategoryCreate,current_user = Depends(get_current_user)):
    return await ObjectCategoryService.create_category(category)


@app.get("/object-categories/", response_model=List[ObjectCategorySchema])
@check_permission(EntityType.CATEGORIES,RightType.READ)
async def list_categories(current_user = Depends(get_current_user)):
    return await ObjectCategoryService.get_all_categories()


@app.get("/object-categories/{cat_id}", response_model=ObjectCategorySchema)
@check_permission(EntityType.CATEGORIES,RightType.READ)
async def get_category(cat_id: int,current_user = Depends(get_current_user)):
    category = await ObjectCategoryService.get_category_by_id(cat_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@app.put("/object-categories/{cat_id}", response_model=ObjectCategorySchema)
@check_permission(EntityType.CATEGORIES,RightType.UPDATE)
async def update_category(cat_id: int, category: ObjectCategoryCreate,current_user = Depends(get_current_user)):
    category = await ObjectCategoryService.update_category(cat_id, category)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@app.delete("/object-categories/{cat_id}")
@check_permission(EntityType.CATEGORIES,RightType.DELETE)
async def delete_category(cat_id: int,current_user = Depends(get_current_user)):
    category = await ObjectCategoryService.delete_category(cat_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


# Dynamic Fields

@app.post("/dynamic-fields/", response_model=DynamicFieldSchema)
@check_permission(EntityType.DYNAMIC_FIELDS,RightType.CREATE)
async def create_dynamic_field(field: DynamicFieldCreate,current_user = Depends(get_current_user)):
    return await DynamicFieldService.create_field(field)


@app.get("/dynamic-fields/", response_model=List[DynamicFieldSchema])
@check_permission(EntityType.DYNAMIC_FIELDS,RightType.READ)
async def list_dynamic_fields(current_user = Depends(get_current_user)):
    return await DynamicFieldService.get_all_fields()


@app.get("/dynamic-fields/{field_id}", response_model=DynamicFieldSchema)
@check_permission(EntityType.DYNAMIC_FIELDS,RightType.READ)
async def get_dynamic_field(field_id: int,current_user = Depends(get_current_user)):
    field = await DynamicFieldService.get_field_by_id(field_id)
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    return field


@app.put("/dynamic-fields/{field_id}")
@check_permission(EntityType.DYNAMIC_FIELDS,RightType.UPDATE)
async def update_dynamic_field(field_id: int, field:DynamicFieldCreate,current_user = Depends(get_current_user)):
    try:

        field = await DynamicFieldService.update_field(field_id, field)
        if not field:
            raise HTTPException(status_code=404, detail="Field not found")
        return field
    except HTTPException as e:
        if e.status_code == 400:
            raise e


@app.delete("/dynamic-fields/{field_id}")
@check_permission(EntityType.DYNAMIC_FIELDS,RightType.DELETE)
async def delete_dynamic_field(field_id: int,current_user = Depends(get_current_user)):
    field = await DynamicFieldService.delete_field(field_id)
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    return field


# Objects

@app.post("/objects/")
@check_permission(EntityType.OBJECTS,RightType.CREATE)
async def create_object(obj: ObjectCreate,current_user = Depends(get_current_user)):
    try:

        obj =  await ObjectService.create_object(obj)
        return obj
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))


@app.get("/objects/")
@check_permission(EntityType.OBJECTS,RightType.READ)
async def list_objects(current_user = Depends(get_current_user)):
    return await ObjectService.get_all_objects()


@app.get("/objects/{obj_id}")
@check_permission(EntityType.OBJECTS,RightType.READ)
async def get_object(obj_id: int,current_user = Depends(get_current_user)):
    obj = await ObjectService.get_object_by_id(obj_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")
    return obj


@app.put("/objects/{obj_id}")
@check_permission(EntityType.OBJECTS,RightType.UPDATE)
async def update_object(obj_id: int, obj: ObjectUpdate,current_user = Depends(get_current_user)):
    obj = await ObjectService.update_object(obj_id, obj)
    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")
    return obj


@app.delete("/objects/{obj_id}")
@check_permission(EntityType.OBJECTS,RightType.DELETE)
async def delete_object(obj_id: int,current_user = Depends(get_current_user)):
    obj = await ObjectService.delete_object(obj_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")
    return obj