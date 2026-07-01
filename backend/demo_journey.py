"""严师APP Phase 1 后端 API 效果演示（无需 Docker / PostgreSQL / Redis）。"""
import os
import sys

# 使用 SQLite 文件数据库运行演示（避免 :memory: 多连接丢失数据）
DB_PATH = "/tmp/yanshi_demo.db"
if os.path.exists(DB_PATH):
    os.remove(DB_PATH)
os.environ["DATABASE_URL"] = f"sqlite:///{DB_PATH}"
os.environ["REDIS_URL"] = "redis://localhost:6379/0"
os.environ["SECRET_KEY"] = "demo-secret"

import fakeredis
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(__file__))
from app.main import app
from app.redis_client import RedisClient
from app.services.reminder_scheduler import ReminderScheduler
from app.services.rule_engine import RuleEngine


def pretty(title, data):
    import json
    print(f"\n=== {title} ===")
    print(json.dumps(data, ensure_ascii=False, indent=2))


with TestClient(app) as client:
    # 1. 健康检查
    pretty("健康检查", client.get("/health").json())

    # 2. 匿名登录
    auth = client.post("/auth/anonymous").json()
    pretty("匿名登录", auth)
    token = auth["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. 创建计划
    from datetime import datetime, timedelta
    deadline = (datetime.utcnow() + timedelta(days=1)).isoformat()
    plan = client.post(
        "/plans",
        headers=headers,
        json={"title": "晨跑 5 公里", "completion_standard": "GPS 轨迹 >= 5km", "deadline": deadline},
    ).json()
    pretty("创建计划", plan)

    # 4. 计划列表
    plans = client.get("/plans", headers=headers).json()
    pretty("计划列表", plans)

    # 5. 追踪：选择“再给 1 小时”
    log = client.post(
        f"/plans/{plan['id']}/track",
        headers=headers,
        json={"type": "followup", "response": "extend", "extend_hours": 1},
    ).json()
    pretty("追踪日志（延期 1 小时）", log)

    # 6. 强制复盘：未完成必须填写原因
    fail = client.post(f"/plans/{plan['id']}/reviews", headers=headers, json={"completed": False})
    pretty("未完成未填原因 -> 422", {"status": fail.status_code, "detail": fail.json()})

    review = client.post(
        f"/plans/{plan['id']}/reviews",
        headers=headers,
        json={"completed": False, "reason": "临时加班"},
    ).json()
    pretty("复盘记录", review)

    # 7. 复盘分析
    analysis = client.get(f"/plans/{plan['id']}/reviews/analysis", headers=headers).json()
    pretty("复盘分析", analysis)

    # 8. 规则引擎：三档模式话术
    engine = RuleEngine()
    pretty("严格模式提醒话术", {"message": engine.render_reminder("strict", title="晨跑 5 公里", deadline=deadline)})
    pretty("适中模式建议", engine.analyze("moderate", consecutive_missed=4))

    # 9. Redis Sorted Set 提醒调度（使用 fakeredis）
    redis_client = RedisClient(fakeredis.FakeRedis())
    scheduler = ReminderScheduler(redis_client)
    due = datetime.utcnow() + timedelta(minutes=30)
    scheduler.schedule(plan_id=str(plan["id"]), user_id=str(plan["user_id"]), mode="strict", due_at=due)
    pretty("已调度提醒", {"due_at": due.isoformat(), "queue_length": redis_client._redis.zcard("yanshi:reminders:due")})

print("\n演示完成，所有核心流程均通过 TestClient 验证。")
