from fastapi.testclient import TestClient


def test_full_journey(client: TestClient):
    # anonymous login
    auth = client.post("/auth/anonymous").json()
    headers = {"Authorization": f"Bearer {auth['access_token']}"}

    # create plan
    from datetime import datetime, timedelta
    deadline = (datetime.utcnow() + timedelta(days=1)).isoformat()
    plan = client.post("/plans", headers=headers, json={
        "title": "Read 20 pages",
        "completion_standard": "Finish chapter 1",
        "deadline": deadline,
    }).json()
    assert plan["status"] == "active"

    # track followup extend
    log = client.post(f"/plans/{plan['id']}/track", headers=headers, json={
        "type": "followup", "response": "extend", "extend_hours": 1,
    }).json()
    assert log["response"] == "extend"

    # review
    review = client.post(f"/plans/{plan['id']}/reviews", headers=headers, json={
        "completed": True,
    }).json()
    assert review["completed"] is True
