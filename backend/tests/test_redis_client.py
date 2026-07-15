import fakeredis
from app.redis_client import RedisClient, ReminderKey


def test_can_set_and_get_session_with_ttl():
    fake = fakeredis.FakeRedis()
    client = RedisClient(fake)
    client.set_session("user-123", {"mode": "strict"}, ttl=60)
    data = client.get_session("user-123")
    assert data == {"mode": "strict"}
    assert fake.ttl("yanshi:session:user-123") > 0


def test_reminder_key_format():
    assert ReminderKey.due_queue() == "yanshi:reminders:due"
