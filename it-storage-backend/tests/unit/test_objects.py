
from datetime import datetime
from httpx import AsyncClient
import pytest

from src.objects.schemas import DynamicFieldCreate, ObjectCategoryCreate, ObjectCreate, ObjectUpdate
from src.objects.models import Object

@pytest.mark.asyncio
async def test_create_object(client:AsyncClient):
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
    print(cat_response.read())
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
    object_data = ObjectCreate(
        category_id=1,
        name="Test Object",
        description="Test Description",
        inventory_number="INV-001",
        serial_number="SER-001",
        cost=1000.0,
        purchase_date=datetime.now().isoformat(),
        warranty_expiry_date=datetime.now().isoformat(),
        dynamic_values=[
            {"field_id": 1, "value": "Test Value 1"}
        ]
    )
    response = await client.post("/objects/", json=object_data.model_dump())
    assert response.status_code == 200
    assert response.json() == {
        "id": 1,
        "category_id": 1,
        "name": "Test Object",
        "description": "Test Description",
        "inventory_number": "INV-001",
        "serial_number": "SER-001",
        "cost": 1000.0,
        "purchase_date": response.json()["purchase_date"],
        "warranty_expiry_date": response.json()["warranty_expiry_date"],
        "created_at": response.json()["created_at"],
        "updated_at": response.json()["updated_at"],
        "dynamic_values": [
            {
                "field_id": 1,
                "value": "Test Value 1"
            }
        ]
    }

@pytest.mark.asyncio
async def test_list_objects(client:AsyncClient):
    response = await client.get("/objects/")
    assert response.status_code == 200
    assert response.json() == [
        {
            "id": 1,
            "category_id": 1,
            "name": "Test Object",
            "description": "Test Description",
            "inventory_number": "INV-001",
            "serial_number": "SER-001",
            "cost": 1000.0,
            "purchase_date": response.json()[0]["purchase_date"],
            "warranty_expiry_date": response.json()[0]["warranty_expiry_date"],
            "created_at": response.json()[0]["created_at"],
            "updated_at": response.json()[0]["updated_at"],
            "dynamic_values": [
                {
                "field_id": 1,
                "value": "Test Value 1"
            }
            ]
        }
    ]

@pytest.mark.asyncio
async def test_get_object(client:AsyncClient):
    response = await client.get("/objects/1")
    assert response.status_code == 200
    assert response.json() == {
        "id": 1,
        "category_id": 1,
        "name": "Test Object",
        "description": "Test Description",
        "inventory_number": "INV-001",
        "serial_number": "SER-001",
        "cost": 1000.0,
        "purchase_date": response.json()["purchase_date"],
        "warranty_expiry_date": response.json()["warranty_expiry_date"],
        "created_at": response.json()["created_at"],
        "updated_at": response.json()["updated_at"],
        "dynamic_values": [
            {
                "field_id": 1,
                "value": "Test Value 1"
            }
        ]
    }

@pytest.mark.asyncio
async def test_update_object(client:AsyncClient):
    updated_data = ObjectUpdate(
        name="Updated Object",
        description="Updated Description",
        category_id=1,
        dynamic_values=[
                {
                "field_id": 1,
                "value": "Test Value 1"
            }
            ],
        inventory_number="INV-002",
        serial_number="SER-002",
        cost=2000.0,
        purchase_date=datetime.now().isoformat(),
        warranty_expiry_date=datetime.now().isoformat()
    )
    response = await client.put("/objects/1", json=updated_data.model_dump())
    print(response.read())
    assert response.status_code == 200
    assert response.json() == {
        "id": 1,
        "category_id": 1,
        "name": "Updated Object",
        "description": "Updated Description",
        "inventory_number": "INV-002",
        "serial_number": "SER-002",
        "cost": 2000.0,
        "purchase_date": response.json()["purchase_date"],
        "warranty_expiry_date": response.json()["warranty_expiry_date"],
        "created_at": response.json()["created_at"],
        "updated_at": response.json()["updated_at"],
        "dynamic_values": [
                {
                "field_id": 1,
                "value": "Test Value 1"
            }
            ]
    }

@pytest.mark.asyncio
async def test_delete_object(client:AsyncClient):
    response = await client.delete("/objects/1")
    assert response.status_code == 200
    assert response.json() == {"message": f"{Object.__name__} deleted successfully"}