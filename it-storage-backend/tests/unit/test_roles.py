import pytest
from httpx import AsyncClient
from src.roles.schemas import RoleCreate, RightCreate

@pytest.mark.asyncio
async def test_create_role(client: AsyncClient):
    role_data = RoleCreate(name="Admin", description="Administrator role")
    response = await client.post("/roles/", json=role_data.model_dump())
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Admin"
    assert data["description"] == "Administrator role"
    assert "id" in data

@pytest.mark.asyncio
async def test_list_roles(client: AsyncClient):
    response = await client.get("/roles/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_get_role(client: AsyncClient):
    # Сначала создаем роль
    role_data = RoleCreate(name="Manager", description="Manager role")
    create_response = await client.post("/roles/", json=role_data.model_dump())
    role_id = create_response.json()["id"]

    # Получаем роль по ID
    response = await client.get(f"/roles/{role_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Manager"
    assert data["description"] == "Manager role"

@pytest.mark.asyncio
async def test_update_role(client: AsyncClient):
    # Сначала создаем роль
    role_data = RoleCreate(name="Editor", description="Editor role")
    create_response = await client.post("/roles/", json=role_data.model_dump())
    role_id = create_response.json()["id"]

    # Обновляем роль
    updated_data = RoleCreate(name="Senior Editor", description="Senior Editor role")
    response = await client.put(f"/roles/{role_id}", json=updated_data.model_dump())
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Senior Editor"
    assert data["description"] == "Senior Editor role"

@pytest.mark.asyncio
async def test_delete_role(client: AsyncClient):
    # Сначала создаем роль
    role_data = RoleCreate(name="Temporary", description="Temporary role")
    create_response = await client.post("/roles/", json=role_data.model_dump())
    role_id = create_response.json()["id"]

    # Удаляем роль
    response = await client.delete(f"/roles/{role_id}")
    assert response.status_code == 200
    assert response.json() == {"message": "Role deleted successfully"}

@pytest.mark.asyncio
async def test_add_right_to_role(client: AsyncClient):
    # Сначала создаем роль
    role_data = RoleCreate(name="Moderator", description="Moderator role")
    create_response = await client.post("/roles/", json=role_data.model_dump())
    print(create_response.json())
    role_id = create_response.json()["id"]

    # Добавляем право к роли
    right_data = RightCreate(role_id=role_id, name="Edit Posts", description="Can edit posts")
    response = await client.post(f"/roles/{role_id}/rights/", json=right_data.model_dump())
    print(response.read())
    assert response.status_code == 200
    data = response.json()
    assert "message" in data