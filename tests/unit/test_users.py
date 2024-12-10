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

@pytest.mark.asyncio
async def test_get_users(client):
    response = await client.get("/users/")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_delete_user(client):
    response = await client.delete("/users/testuser")
    assert response.status_code == 200
    
    
