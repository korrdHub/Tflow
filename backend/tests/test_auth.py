from fastapi.testclient import TestClient


def test_anonymous_login_creates_user(client: TestClient):
    response = client.post("/auth/anonymous")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_register_and_login(client: TestClient):
    client.post("/auth/register", json={"email": "a@b.com", "password": "secret", "name": "A"})
    response = client.post("/auth/login", data={"username": "a@b.com", "password": "secret"})
    assert response.status_code == 200
    assert "access_token" in response.json()
