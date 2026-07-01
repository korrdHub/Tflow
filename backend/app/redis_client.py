import json
from redis import Redis
from app.config import settings


class ReminderKey:
    @staticmethod
    def due_queue() -> str:
        return "yanshi:reminders:due"


class RedisClient:
    def __init__(self, redis: Redis | None = None):
        self._redis = redis or Redis.from_url(settings.redis_url, decode_responses=True)

    def set_session(self, user_id: str, data: dict, ttl: int = 86400) -> None:
        key = f"yanshi:session:{user_id}"
        self._redis.setex(key, ttl, json.dumps(data, ensure_ascii=False))

    def get_session(self, user_id: str) -> dict | None:
        key = f"yanshi:session:{user_id}"
        raw = self._redis.get(key)
        return json.loads(raw) if raw else None

    def delete_session(self, user_id: str) -> None:
        self._redis.delete(f"yanshi:session:{user_id}")
