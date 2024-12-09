def test_create_user(client):
    response = client.post(
        "/users/",
        json={"username": "testuser", "password": "ValidPass123!"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"