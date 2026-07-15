from datetime import datetime, timedelta


def test_log_response_and_extend(auth_client):
    deadline = (datetime.utcnow() + timedelta(days=1)).isoformat()
    plan = auth_client.post("/plans", json={"title": "Run", "completion_standard": "5km", "deadline": deadline}).json()
    r = auth_client.post(f"/plans/{plan['id']}/track", json={"type": "followup", "response": "extend", "extend_hours": 1})
    assert r.status_code == 201
    data = r.json()
    assert data["response"] == "extend"
    assert data["extend_hours"] == 1
