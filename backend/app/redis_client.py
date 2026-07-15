import json
import fakeredis
from redis import Redis
from app.config import settings


class ReminderKey:
    @staticmethod
    def due_queue() -> str:
        return "yanshi:reminders:due"


class RedisClient:
    def __init__(self, redis: Redis | None = None):
        self._redis = redis or Redis.from_url(settings.redis_url, decode_responses=True)

    @classmethod
    def from_fake(cls):
        return cls(fakeredis.FakeRedis())

    def set_session(self, user_id: str, data: dict, ttl: int = 86400) -> None:
        key = f"yanshi:session:{user_id}"
        self._redis.setex(key, ttl, json.dumps(data, ensure_ascii=False))

    def get_session(self, user_id: str) -> dict | None:
        key = f"yanshi:session:{user_id}"
        raw = self._redis.get(key)
        return json.loads(raw) if raw else None

    def delete_session(self, user_id: str) -> None:
        self._redis.delete(f"yanshi:session:{user_id}")

    def zadd_reminder(self, due_at_ts: float, payload: dict) -> None:
        self._redis.zadd(ReminderKey.due_queue(), {json.dumps(payload, ensure_ascii=False): due_at_ts})

    def zrange_due(self, before_ts: float, limit: int = 100) -> list[tuple[dict, float]]:
        items = self._redis.zrangebyscore(ReminderKey.due_queue(), 0, before_ts, withscores=True, start=0, num=limit)
        return [(json.loads(raw), score) for raw, score in items]

    def zrem_reminder(self, payload: dict) -> None:
        self._redis.zrem(ReminderKey.due_queue(), json.dumps(payload, ensure_ascii=False))
