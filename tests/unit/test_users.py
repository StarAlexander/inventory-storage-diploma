import pytest

@pytest.mark.asyncio
async def test_create_user(client):
    response = await client.post(
        "/users/",
        json={"username": "testuser", "password": "ValidPass123!",
              "email":"sample@mail.ru","first_name":"test",
              "last_name":"user","middle_name":"middle",
              "phone":"+79995436521","is_system":"false",
              "hired_at":"2024-12-10 10:35:36"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"

    response = await client.delete(
        "/users/testuser"
    )
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_get_users(client):
    response = await client.get("/users/")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_update_user(client):
    response = await client.post(
        "/users/",
        json={"username": "testuser", "password": "ValidPass123!",
              "email":"sample@mail.ru","first_name":"test",
              "last_name":"user","middle_name":"middle",
              "phone":"+79995436521","is_system":"false",
              "hired_at":"2024-12-10 10:35:36"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"

    # Обновление полей
    response = await client.put(
        "/users/",
        json={
            "username": "testuser",
            "password": "Admin123!",
            "email":"newemail@example.com",
            "first_name":"test_new",
              }
    )

    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "newemail@example.com"
    assert data["first_name"] == "test_new"

    # Смена пароля
    response = await client.put(
        "/users/",
        json={
            "username": "testuser",
            "password": "Admin123@",
              }
    )

    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"

    response = await client.delete(
        "/users/testuser"
    )
    assert response.status_code == 200


    
    
