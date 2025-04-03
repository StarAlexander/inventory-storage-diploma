import pytest
from httpx import AsyncClient
from src.roles.schemas import RoleCreate
from src.users.schemas import UserCreate, UserUpdate

@pytest.mark.asyncio
async def test_create_user(client: AsyncClient):
    user_data = UserCreate(
        username="testuser",
        email="test@example.com",
        password="Test123!",
        first_name="Test",
        last_name="User"
    )
    response = await client.post("/users/register", json=user_data.model_dump())
    print(response.read())
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert "id" in data

@pytest.mark.asyncio
async def test_list_users(client: AsyncClient):
    response = await client.get("/users/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_get_user(client: AsyncClient):
    # Сначала создаем пользователя
    user_data = UserCreate(
        username="testuser2",
        email="test2@example.com",
        password="Test123!",
        first_name="Test",
        last_name="User"
    )
    create_response = await client.post("/users/register", json=user_data.model_dump())
    user_id = create_response.json()["id"]

    # Получаем пользователя по ID
    response = await client.get(f"/users/{user_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser2"
    assert data["email"] == "test2@example.com"

@pytest.mark.asyncio
async def test_update_user(client: AsyncClient):
    # Сначала создаем пользователя
    user_data = UserCreate(
        username="testuser3",
        email="test3@example.com",
        password="Test123!",
        first_name="Test",
        last_name="User"
    )
    create_response = await client.post("/users/register", json=user_data.model_dump())
    user_id = create_response.json()["id"]

    # Обновляем пользователя
    updated_data = UserUpdate(
        username="updateduser",
        email="updated@example.com",
        first_name="Updated",
        last_name="User"
    )
    response = await client.put(f"/users/{user_id}", json=updated_data.model_dump())
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "updateduser"
    assert data["email"] == "updated@example.com"

@pytest.mark.asyncio
async def test_delete_user(client: AsyncClient):
    # Сначала создаем пользователя
    user_data = UserCreate(
        username="testuser4",
        email="test4@example.com",
        password="Test123!",
        first_name="Test",
        last_name="User"
    )
    create_response = await client.post("/users/register", json=user_data.model_dump())
    user_id = create_response.json()["id"]

    # Удаляем пользователя
    response = await client.delete(f"/users/{user_id}")
    assert response.status_code == 200
    assert response.json() == {"message": "User deleted successfully"}

@pytest.mark.asyncio
async def test_add_role_to_user(client: AsyncClient):
    # Сначала создаем пользователя и роль
    user_data = UserCreate(
        username="testuser5",
        email="test5@example.com",
        password="Test123!",
        first_name="Test",
        last_name="User"
    )
    create_user_response = await client.post("/users/register", json=user_data.model_dump())
    user_id = create_user_response.json()["id"]

    role_data = RoleCreate(name="Editor", description="Editor role")
    create_role_response = await client.post("/roles/", json=role_data.model_dump())
    role_id = create_role_response.json()["id"]

    # Добавляем роль пользователю
    response = await client.post(f"/users/{user_id}/roles/{role_id}")
    assert response.status_code == 200
    assert response.json() == {"message": f"Role {role_id} added to User {user_id}"}