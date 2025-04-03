import pytest
from httpx import AsyncClient
from src.objects.schemas import DynamicFieldCreate, DynamicFieldSchema, ObjectCategoryCreate, ObjectCreate, ObjectUpdate
from src.departments.schemas import DepartmentCreate, DepartmentSchema
from src.organizations.schemas import OrganizationBase, OrganizationResponse
from datetime import datetime






    


# Тесты для организаций
@pytest.mark.asyncio
async def test_create_organization(client:AsyncClient):
    organization_data = OrganizationBase(
        name="Test Organization",
        email="test@example.com",
        phone="+1234567890",
        address="Test Address",
        notes="Test Notes"
    )
    response = await client.post("/organizations/", json=organization_data.model_dump())
    assert response.status_code == 200
    assert response.json() == {
    "id": 1,
    "name": "Test Organization",
    "email": "test@example.com",
    "phone": "+1234567890",
    "address": "Test Address",
    "notes": "Test Notes",
    "created_at": response.json()["created_at"],
    "updated_at": response.json()["updated_at"]
    }

@pytest.mark.asyncio
async def test_list_organizations(client:AsyncClient):
    response = await client.get("/organizations/")
    assert response.status_code == 200
    assert response.json() == [
        {
            "id": 1,
            "name": "Test Organization",
            "email": "test@example.com",
            "phone": "+1234567890",
            "address": "Test Address",
            "notes": "Test Notes",
            "created_at": response.json()[0]["created_at"],
            "updated_at": response.json()[0]["updated_at"]
        }
    ]

@pytest.mark.asyncio
async def test_get_organization(client:AsyncClient):
    response = await client.get("/organizations/1")
    assert response.status_code == 200
    assert response.json() == {
    "id": 1,
    "name": "Test Organization",
    "email": "test@example.com",
    "phone": "+1234567890",
    "address": "Test Address",
    "notes": "Test Notes",
    "created_at": response.json()["created_at"],
    "updated_at": response.json()["updated_at"]
    }

@pytest.mark.asyncio
async def test_update_organization(client:AsyncClient):

    updated_data = OrganizationBase(
        name="Updated Organization",
        email="updated@example.com",
        phone="+9876543210",
        address="Updated Address",
        notes="Updated Notes"
    )
    response = await client.put("/organizations/1", json=updated_data.model_dump())
    assert response.status_code == 200
    assert response.json() == {
        "id": 1,
        "name": "Updated Organization",
        "email": "updated@example.com",
        "phone": "+9876543210",
        "address": "Updated Address",
        "notes": "Updated Notes",
        "created_at": response.json()["created_at"],
        "updated_at": response.json()["updated_at"]
    }

@pytest.mark.asyncio
async def test_delete_organization(client:AsyncClient):
    response = await client.delete("/organizations/1")
    assert response.status_code == 200
    assert response.json() == {"message": "Organization deleted successfully"}

