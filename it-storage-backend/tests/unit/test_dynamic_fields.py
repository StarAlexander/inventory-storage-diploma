from datetime import datetime
from httpx import AsyncClient
import pytest

from src.objects.schemas import DynamicFieldCreate, DynamicFieldSchema, ObjectCategoryCreate
from src.objects.models import DynamicField

@pytest.mark.asyncio
async def test_create_dynamic_field(client:AsyncClient):
    category = ObjectCategoryCreate(
        name="Test Category",
        description="Test Description"
    )
    field_data = DynamicFieldCreate(
        category_id=1,
        name="Test Field",
        field_type="text",
        description="Test Description"
    )
    cat_response = await client.post("/object-categories/",json=category.model_dump())
    assert cat_response.status_code == 200
    assert cat_response.json() == {
        "id":1,
        "name":"Test Category",
        "description":"Test Description",
        "created_at": cat_response.json()["created_at"],
        "updated_at": cat_response.json()["updated_at"]

    }
    response = await client.post("/dynamic-fields/", json=field_data.model_dump())
    assert response.status_code == 200
    assert response.json() == {
        "id": 1,
        "category_id": 1,
        "name": "Test Field",
        "field_type": "text",
        "description": "Test Description",
        "created_at": response.json()["created_at"],
        "updated_at": response.json()["updated_at"]
    }

@pytest.mark.asyncio
async def test_list_dynamic_fields(client:AsyncClient):
    response = await client.get("/dynamic-fields/")
    assert response.status_code == 200
    assert response.json() == [
        {
        "id": 1,
        "category_id": 1,
        "name": "Test Field",
        "field_type": "text",
        "description": "Test Description",
        "created_at": response.json()[0]["created_at"],
        "updated_at": response.json()[0]["updated_at"]
    }
    ]

@pytest.mark.asyncio
async def test_get_dynamic_field(client:AsyncClient):
    response = await client.get("/dynamic-fields/1")
    assert response.status_code == 200
    assert response.json() == {
        "id": 1,
        "category_id": 1,
        "name": "Test Field",
        "field_type": "text",
        "description": "Test Description",
        "created_at": response.json()["created_at"],
        "updated_at": response.json()["updated_at"]
    }

@pytest.mark.asyncio
async def test_update_dynamic_field(client:AsyncClient):
    updated_data = DynamicFieldCreate(
        category_id=1,
        name="Updated Field",
        field_type="number",
        description="Updated Description"
    )
    response = await client.put("/dynamic-fields/1", json=updated_data.model_dump())
    assert response.status_code == 200
    assert response.json() == {
        "id": 1,
        "category_id": 1,
        "name": "Updated Field",
        "field_type": "number",
        "description": "Updated Description",
        "created_at": response.json()["created_at"],
        "updated_at": response.json()["updated_at"]
    }

@pytest.mark.asyncio
async def test_delete_dynamic_field(client:AsyncClient):
    response = await client.delete("/dynamic-fields/1")
    assert response.status_code == 200
    assert response.json() == {"message": f"{DynamicField.__name__} deleted successfully"}
