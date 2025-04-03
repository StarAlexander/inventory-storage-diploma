from datetime import datetime
from httpx import AsyncClient
import pytest

from src.departments.schemas import DepartmentCreate, DepartmentSchema
from tests.unit.test_organizations import test_create_organization



@pytest.mark.asyncio
async def test_create_department(client:AsyncClient):
    test_create_organization(client)
    department_data = DepartmentCreate(
        organization_id=1,
        name="Test Department",
        abbreviation="TD",
        description="Test Description"
    )
    response = await client.post("/departments/", json=department_data.model_dump())
    assert response.status_code == 200
    assert response.json() == {
            "id": 1,
            "organization_id": 1,
            "name": "Test Department",
            "abbreviation": "TD",
            "description": "Test Description",
            "created_at": response.json()["created_at"],
            "updated_at": response.json()["updated_at"]
        }

@pytest.mark.asyncio
async def test_list_departments(client:AsyncClient):
    response = await client.get("/departments/")
    assert response.status_code == 200
    assert response.json() == [
        {
            "id": 1,
            "organization_id": 1,
            "name": "Test Department",
            "abbreviation": "TD",
            "description": "Test Description",
            "created_at": response.json()[0]["created_at"],
            "updated_at": response.json()[0]["updated_at"]
        }
    ]

@pytest.mark.asyncio
async def test_get_department(client:AsyncClient):
    response = await client.get("/departments/1")
    assert response.status_code == 200
    assert response.json() == {
            "id": 1,
            "organization_id": 1,
            "name": "Test Department",
            "abbreviation": "TD",
            "description": "Test Description",
            "created_at": response.json()["created_at"],
            "updated_at": response.json()["updated_at"]
        }

@pytest.mark.asyncio
async def test_update_department(client:AsyncClient):
    updated_data = DepartmentCreate(
        organization_id=1,
        name="Updated Department",
        abbreviation="UD",
        description="Updated Description"
    )
    response = await client.put("/departments/1", json=updated_data.model_dump())
    assert response.status_code == 200
    assert response.json() == {
        "id": 1,
        "organization_id": 1,
        "name": "Updated Department",
        "abbreviation": "UD",
        "description": "Updated Description",
        "created_at": response.json()["created_at"],
        "updated_at": response.json()["updated_at"]
    }

@pytest.mark.asyncio
async def test_delete_department(client:AsyncClient):
    response = await client.delete("/departments/1")
    assert response.status_code == 200
    assert response.json() == {"message": "Department deleted successfully"}