from datetime import datetime, timedelta


def test_create_review_requires_reason_when_incomplete(auth_client):
    deadline = (datetime.utcnow() + timedelta(days=1)).isoformat()
    plan = auth_client.post("/plans", json={"title": "Run", "completion_standard": "5km", "deadline": deadline}).json()
    r = auth_client.post(f"/plans/{plan['id']}/reviews", json={"completed": False})
    assert r.status_code == 422
    r2 = auth_client.post(f"/plans/{plan['id']}/reviews", json={"completed": False, "reason": "no time"})
    assert r2.status_code == 201


def test_review_analysis_counts_streak(auth_client):
    deadline = (datetime.utcnow() + timedelta(days=1)).isoformat()
    plan = auth_client.post("/plans", json={"title": "Run", "completion_standard": "5km", "deadline": deadline}).json()
    auth_client.post(f"/plans/{plan['id']}/reviews", json={"completed": True})
    analysis = auth_client.get(f"/plans/{plan['id']}/reviews/analysis").json()
    assert analysis["consecutive_completed"] == 1
