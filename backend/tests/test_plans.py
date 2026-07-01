from fastapi.testclient import TestClient
from datetime import datetime, timedelta


def test_create_plan_requires_login(client: TestClient):
    response = client.post("/plans", json={"title": "Run", "completion_standard": "5km", "deadline": (datetime.utcnow() + timedelta(days=1)).isoformat()})
    assert response.status_code == 401


def test_create_and_list_plan(auth_client: TestClient):
    deadline = (datetime.utcnow() + timedelta(days=1)).isoformat()
    r = auth_client.post("/plans", json={"title": "Run", "completion_standard": "5km", "deadline": deadline})
    assert r.status_code == 201
    plan_id = r.json()["id"]
    list_resp = auth_client.get("/plans")
    assert list_resp.status_code == 200
    assert any(p["id"] == plan_id for p in list_resp.json())
