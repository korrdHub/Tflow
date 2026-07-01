from datetime import datetime
from uuid import UUID
from app.redis_client import RedisClient


class ReminderScheduler:
    def __init__(self, redis_client: RedisClient):
        self.redis = redis_client

    def schedule(self, plan_id: str | UUID, user_id: str | UUID, mode: str, due_at: datetime) -> None:
        payload = {
            "plan_id": str(plan_id),
            "user_id": str(user_id),
            "mode": mode,
            "due_at": due_at.isoformat(),
        }
        self.redis.zadd_reminder(due_at.timestamp(), payload)

    def get_due_items(self, now: datetime | None = None, limit: int = 100) -> list[dict]:
        now = now or datetime.utcnow()
        items = self.redis.zrange_due(now.timestamp(), limit=limit)
        return [payload for payload, _ in items]

    def ack(self, payload: dict) -> None:
        self.redis.zrem_reminder(payload)
