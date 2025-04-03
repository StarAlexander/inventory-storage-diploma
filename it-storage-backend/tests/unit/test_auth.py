from httpx import AsyncClient
import pytest
from tests.unit.test_users import test_create_user

@pytest.mark.asyncio
async def test_protected_endpoint(client: AsyncClient):
    # Получаем токен
    login_data = {
        "username": "testuser",
        "password": "Test123!"
    }
    token_response = await client.post("/token", data=login_data)
    token = token_response.json()["access_token"]

    # Выполняем запрос к защищенному эндпоинту с токеном
    headers = {"Authorization": f"Bearer {token}"}
    response = await client.get("/me", headers=headers)
    print(response.read())
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"