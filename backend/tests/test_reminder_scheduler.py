from datetime import datetime, timedelta
from app.redis_client import RedisClient
from app.services.reminder_scheduler import ReminderScheduler


def test_schedule_and_pop_due_reminders():
    fake = RedisClient.from_fake()
    scheduler = ReminderScheduler(fake)
    due = datetime.utcnow() - timedelta(seconds=1)
    scheduler.schedule(plan_id="p1", user_id="u1", mode="strict", due_at=due)
    due_items = scheduler.get_due_items(limit=10)
    assert len(due_items) == 1
    assert due_items[0]["plan_id"] == "p1"


def test_non_due_reminder_not_popped():
    fake = RedisClient.from_fake()
    scheduler = ReminderScheduler(fake)
    future = datetime.utcnow() + timedelta(hours=1)
    scheduler.schedule(plan_id="p2", user_id="u1", mode="strict", due_at=future)
    assert scheduler.get_due_items(limit=10) == []
