# 严师APP Phase 1 后端核心实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现严师APP Phase 1 MVP 后端核心服务，让用户能够完成"注册/匿名 → 创建计划 → 收到提醒 → 完成/放弃 → 复盘"的最小闭环。

**Architecture:** 采用 FastAPI 构建 REST API，SQLAlchemy 2.0 操作 PostgreSQL 主库，独立 services 层封装业务逻辑；Redis 承担提醒调度队列、会话缓存与限流，遵循 Redis 最佳实践（连接池、TTL、Sorted Set 延迟队列、一致性键名）；规则引擎基于 JSON 配置文件驱动，支持三档模式。

**Tech Stack:** Python 3.11, FastAPI, SQLAlchemy 2.0, Pydantic v2, PostgreSQL 15, Redis 7, pytest, httpx, fakeredis, uvicorn, docker-compose, nginx.

---

## 文件结构

```
/workspace/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI 应用、生命周期、中间件
│   │   ├── config.py               # Pydantic Settings
│   │   ├── database.py             # SQLAlchemy engine / session / Base
│   │   ├── models.py               # 核心 ORM 模型
│   │   ├── schemas.py              # Pydantic 请求/响应模型
│   │   ├── dependencies.py         # DB / Redis / 当前用户依赖
│   │   ├── redis_client.py         # Redis 连接池与键名规范
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py             # 注册 / 登录 / 匿名
│   │   │   ├── users.py            # 用户画像 / 设置
│   │   │   ├── plans.py            # 计划 CRUD / 状态机
│   │   │   ├── tracking.py         # 追踪层日志 / 追问响应
│   │   │   └── review.py           # 复盘记录 / 分析
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── user_service.py
│   │       ├── plan_service.py
│   │       ├── tracking_service.py
│   │       ├── review_service.py
│   │       ├── rule_engine.py
│   │       └── reminder_scheduler.py
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py             # 测试 fixtures（内存 DB + fakeredis）
│   │   ├── test_health.py
│   │   ├── test_auth.py
│   │   ├── test_plans.py
│   │   ├── test_tracking.py
│   │   ├── test_review.py
│   │   ├── test_rule_engine.py
│   │   └── test_reminder_scheduler.py
│   ├── alembic/                    # Phase 1 使用 `create_all`，保留目录占位
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── pytest.ini
│   └── .env.test
├── docker-compose.yml              # backend + db + redis + nginx
└── nginx.conf
```

---

## Task 1: 后端项目骨架与健康检查端点

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/pytest.ini`
- Create: `backend/app/__init__.py`
- Create: `backend/app/config.py`
- Create: `backend/app/main.py`
- Create: `backend/tests/__init__.py`
- Create: `backend/tests/conftest.py`
- Create: `backend/tests/test_health.py`

- [ ] **Step 1: 编写失败测试**

```python
# backend/tests/test_health.py
from fastapi.testclient import TestClient
from app.main import app


def test_health_returns_ok():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /workspace/backend && python -m pytest tests/test_health.py -v`

Expected: `FAILED tests/test_health.py::test_health_returns_ok - AssertionError` (404 because endpoint missing)

- [ ] **Step 3: 编写最小实现**

```python
# backend/requirements.txt
fastapi==0.111.0
uvicorn[standard]==0.30.0
sqlalchemy==2.0.31
psycopg2-binary==2.9.9
redis==5.0.6
pydantic==2.7.4
pydantic-settings==2.3.4
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
pytest==8.2.2
httpx==0.27.0
fakeredis==2.23.3
```

```python
# backend/app/__init__.py
```

```python
# backend/app/config.py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg2://postgres:postgres@db:5432/yanshi"
    redis_url: str = "redis://redis:6379/0"
    secret_key: str = "dev-secret-change-in-production"
    access_token_expire_minutes: int = 60 * 24
    algorithm: str = "HS256"


settings = Settings()
```

```python
# backend/app/main.py
from fastapi import FastAPI

app = FastAPI(title="严师APP Backend", version="0.1.0")


@app.get("/health")
def health():
    return {"status": "ok"}
```

```python
# backend/pytest.ini
[pytest]
asyncio_mode = auto
testpaths = tests
python_files = test_*.py
```

```python
# backend/tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /workspace/backend && python -m pytest tests/test_health.py -v`

Expected: `PASSED tests/test_health.py::test_health_returns_ok`

- [ ] **Step 5: 提交**

```bash
cd /workspace
git add backend/
git commit -m "feat(backend): bootstrap FastAPI project with health endpoint"
```

---

## Task 2: 数据库模型与初始化

**Files:**
- Create: `backend/app/database.py`
- Create: `backend/app/models.py`
- Modify: `backend/app/main.py`（添加 lifespan 创建/清理表）
- Create: `backend/tests/test_models.py`

- [ ] **Step 1: 编写失败测试**

```python
# backend/tests/test_models.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import User, Plan


def test_user_and_plan_tables_are_created():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    user = User(email="test@example.com", name="Test", mode="strict")
    db.add(user)
    db.commit()
    db.refresh(user)
    plan = Plan(user_id=user.id, title="Run 5km", completion_standard="GPS >= 5km", deadline="2026-07-10T08:00:00")
    db.add(plan)
    db.commit()
    assert db.query(Plan).filter(Plan.user_id == user.id).count() == 1
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /workspace/backend && python -m pytest tests/test_models.py -v`

Expected: `FAILED tests/test_models.py::test_user_and_plan_tables_are_created - ImportError: cannot import name 'Base' from 'app.database'`

- [ ] **Step 3: 编写最小实现**

```python
# backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

```python
# backend/app/models.py
import uuid
from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Enum, JSON, Boolean, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class UserMode(str, PyEnum):
    STRICT = "strict"
    MODERATE = "moderate"
    COACH = "coach"


class PlanStatus(str, PyEnum):
    DRAFT = "draft"
    ACTIVE = "active"
    COMPLETED = "completed"
    ABANDONED = "abandoned"
    OVERDUE = "overdue"
    ARCHIVED = "archived"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=True, index=True)
    name = Column(String, nullable=True)
    mode = Column(Enum(UserMode), default=UserMode.MODERATE, nullable=False)
    settings = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow)
    is_anonymous = Column(Boolean, default=False)

    plans = relationship("Plan", back_populates="user", cascade="all, delete-orphan")


class Plan(Base):
    __tablename__ = "plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    completion_standard = Column(String, nullable=False)
    deadline = Column(DateTime, nullable=False)
    reminder_frequency = Column(Integer, default=60)  # minutes
    status = Column(Enum(PlanStatus), default=PlanStatus.ACTIVE, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="plans")


class PlanLog(Base):
    __tablename__ = "plan_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("plans.id"), nullable=False)
    type = Column(String, nullable=False)  # reminder / followup / escalation
    detail = Column(String, default="")
    response = Column(String, nullable=True)  # completed / extend / abandon
    extend_hours = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class ReviewEntry(Base):
    __tablename__ = "review_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("plans.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    completed = Column(Boolean, nullable=False)
    reason = Column(String, nullable=True)
    ai_analysis = Column(JSON, default=dict)
    user_reflection = Column(String, default="")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("plans.id"), nullable=False)
    messages = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
```

```python
# backend/app/main.py 修改 lifespan
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.database import engine, Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="严师APP Backend", version="0.1.0", lifespan=lifespan)


@app.get("/health")
def health():
    return {"status": "ok"}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /workspace/backend && python -m pytest tests/test_models.py -v`

Expected: `PASSED tests/test_models.py::test_user_and_plan_tables_are_created`

- [ ] **Step 5: 提交**

```bash
cd /workspace
git add backend/
git commit -m "feat(backend): add SQLAlchemy models and database setup"
```

---

## Task 3: Redis 客户端与键名规范

**Files:**
- Create: `backend/app/redis_client.py`
- Create: `backend/tests/test_redis_client.py`

- [ ] **Step 1: 编写失败测试**

```python
# backend/tests/test_redis_client.py
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
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /workspace/backend && python -m pytest tests/test_redis_client.py -v`

Expected: `FAILED ... ImportError: cannot import name 'RedisClient'`

- [ ] **Step 3: 编写最小实现**

```python
# backend/app/redis_client.py
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
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /workspace/backend && python -m pytest tests/test_redis_client.py -v`

Expected: `PASSED`

- [ ] **Step 5: 提交**

```bash
cd /workspace
git add backend/
git commit -m "feat(backend): add Redis client with key naming and session TTL"
```

---

## Task 4: 用户系统（注册 / 登录 / 匿名）

**Files:**
- Create: `backend/app/services/user_service.py`
- Create: `backend/app/routers/auth.py`
- Create: `backend/app/dependencies.py`
- Modify: `backend/app/main.py`（挂载 auth router）
- Create: `backend/tests/test_auth.py`

- [ ] **Step 1: 编写失败测试**

```python
# backend/tests/test_auth.py
from fastapi.testclient import TestClient
from app.main import app


def test_anonymous_login_creates_user(client: TestClient):
    response = client.post("/auth/anonymous")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_register_and_login(client: TestClient):
    client.post("/auth/register", json={"email": "a@b.com", "password": "secret", "name": "A"})
    response = client.post("/auth/login", data={"username": "a@b.com", "password": "secret"})
    assert response.status_code == 200
    assert "access_token" in response.json()
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /workspace/backend && python -m pytest tests/test_auth.py -v`

Expected: `FAILED ... 404` because routers missing

- [ ] **Step 3: 编写最小实现**

```python
# backend/app/services/user_service.py
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_anonymous_user(db: Session) -> User:
    user = User(is_anonymous=True, mode="moderate")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_user(db: Session, email: str, password: str, name: str | None = None) -> User:
    hashed = pwd_context.hash(password)
    user = User(email=email, name=name, hashed_password=hashed, is_anonymous=False, mode="moderate")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = db.query(User).filter(User.email == email).first()
    if not user or not pwd_context.verify(password, user.hashed_password):
        return None
    return user
```

```python
# backend/app/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user
```

```python
# backend/app/routers/auth.py
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.schemas import Token, UserCreate
from app.services import user_service

router = APIRouter(prefix="/auth", tags=["auth"])


def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode({"sub": str(user_id), "exp": expire}, settings.secret_key, algorithm=settings.algorithm)


@router.post("/anonymous", response_model=Token)
def anonymous(db: Session = Depends(get_db)):
    user = user_service.create_anonymous_user(db)
    return {"access_token": create_access_token(user.id), "token_type": "bearer"}


@router.post("/register", response_model=Token)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    try:
        user = user_service.create_user(db, payload.email, payload.password, payload.name)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    return {"access_token": create_access_token(user.id), "token_type": "bearer"}


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = user_service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return {"access_token": create_access_token(user.id), "token_type": "bearer"}
```

```python
# backend/app/schemas.py
from uuid import UUID
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None


class Token(BaseModel):
    access_token: str
    token_type: str
```

```python
# backend/app/main.py 挂载 router
from app.routers import auth

app.include_router(auth.router)
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /workspace/backend && python -m pytest tests/test_auth.py -v`

Expected: `PASSED`

- [ ] **Step 5: 提交**

```bash
cd /workspace
git add backend/
git commit -m "feat(backend): add user authentication (register/login/anonymous)"
```

---

## Task 5: 计划 CRUD API 与状态机

**Files:**
- Create: `backend/app/services/plan_service.py`
- Create: `backend/app/routers/plans.py`
- Modify: `backend/app/schemas.py`
- Modify: `backend/app/main.py`
- Create: `backend/tests/test_plans.py`

- [ ] **Step 1: 编写失败测试**

```python
# backend/tests/test_plans.py
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
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /workspace/backend && python -m pytest tests/test_plans.py -v`

Expected: `FAILED ... 401 / 404`

- [ ] **Step 3: 编写最小实现**

```python
# backend/app/schemas.py 添加 Plan 相关 schema
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field
from app.models import PlanStatus


class PlanCreate(BaseModel):
    title: str = Field(..., min_length=1)
    completion_standard: str = Field(..., min_length=1)
    deadline: datetime
    reminder_frequency: int = 60


class PlanUpdate(BaseModel):
    title: str | None = None
    completion_standard: str | None = None
    deadline: datetime | None = None
    reminder_frequency: int | None = None


class PlanOut(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    completion_standard: str
    deadline: datetime
    reminder_frequency: int
    status: PlanStatus
    created_at: datetime
    completed_at: datetime | None

    class Config:
        from_attributes = True
```

```python
# backend/app/services/plan_service.py
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import Plan, PlanStatus

VAGUE_KEYWORDS = ["我要", "尽量", "尽量多", "尽可能", "多一点", "好一点"]


def validate_completion_standard(standard: str) -> bool:
    return not any(k in standard for k in VAGUE_KEYWORDS)


def create_plan(db: Session, user_id: uuid.UUID, data: dict) -> Plan:
    if not validate_completion_standard(data["completion_standard"]):
        raise ValueError("Completion standard is too vague")
    plan = Plan(
        user_id=user_id,
        title=data["title"],
        completion_standard=data["completion_standard"],
        deadline=data["deadline"],
        reminder_frequency=data.get("reminder_frequency", 60),
        status=PlanStatus.ACTIVE,
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


def list_plans(db: Session, user_id: uuid.UUID):
    return db.query(Plan).filter(Plan.user_id == user_id).order_by(Plan.created_at.desc()).all()


def get_plan(db: Session, plan_id: uuid.UUID, user_id: uuid.UUID) -> Plan | None:
    return db.query(Plan).filter(Plan.id == plan_id, Plan.user_id == user_id).first()


def update_plan(db: Session, plan: Plan, data: dict) -> Plan:
    for field in ["title", "completion_standard", "deadline", "reminder_frequency"]:
        if field in data and data[field] is not None:
            if field == "completion_standard" and not validate_completion_standard(data[field]):
                raise ValueError("Completion standard is too vague")
            setattr(plan, field, data[field])
    db.commit()
    db.refresh(plan)
    return plan


def transition_plan(db: Session, plan: Plan, new_status: PlanStatus) -> Plan:
    allowed = {
        PlanStatus.DRAFT: [PlanStatus.ACTIVE],
        PlanStatus.ACTIVE: [PlanStatus.COMPLETED, PlanStatus.ABANDONED, PlanStatus.ARCHIVED],
        PlanStatus.COMPLETED: [PlanStatus.ARCHIVED],
        PlanStatus.ABANDONED: [PlanStatus.ARCHIVED],
        PlanStatus.OVERDUE: [PlanStatus.ABANDONED, PlanStatus.ARCHIVED],
    }
    if new_status not in allowed.get(plan.status, []):
        raise ValueError(f"Cannot transition from {plan.status} to {new_status}")
    plan.status = new_status
    if new_status == PlanStatus.COMPLETED:
        plan.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(plan)
    return plan
```

```python
# backend/app/routers/plans.py
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models import PlanStatus, User
from app.schemas import PlanCreate, PlanOut, PlanUpdate
from app.services import plan_service

router = APIRouter(prefix="/plans", tags=["plans"])


@router.get("", response_model=list[PlanOut])
def list_plans(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return plan_service.list_plans(db, user.id)


@router.post("", response_model=PlanOut, status_code=status.HTTP_201_CREATED)
def create_plan(payload: PlanCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    try:
        return plan_service.create_plan(db, user.id, payload.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{plan_id}", response_model=PlanOut)
def get_plan(plan_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    plan = plan_service.get_plan(db, plan_id, user.id)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    return plan


@router.put("/{plan_id}", response_model=PlanOut)
def update_plan(plan_id: uuid.UUID, payload: PlanUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    plan = plan_service.get_plan(db, plan_id, user.id)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    try:
        return plan_service.update_plan(db, plan, payload.model_dump(exclude_unset=True))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{plan_id}/transition")
def transition_plan(plan_id: uuid.UUID, new_status: PlanStatus, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    plan = plan_service.get_plan(db, plan_id, user.id)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    try:
        return plan_service.transition_plan(db, plan, new_status)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
```

```python
# backend/tests/conftest.py 添加 auth_client fixture
import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def auth_client(client):
    r = client.post("/auth/anonymous")
    token = r.json()["access_token"]
    client.headers["Authorization"] = f"Bearer {token}"
    return client
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /workspace/backend && python -m pytest tests/test_plans.py -v`

Expected: `PASSED`

- [ ] **Step 5: 提交**

```bash
cd /workspace
git add backend/
git commit -m "feat(backend): add plan CRUD and state machine"
```

---

## Task 6: 追踪层 API（提醒日志 / 追问响应 / 延期）

**Files:**
- Create: `backend/app/services/tracking_service.py`
- Create: `backend/app/routers/tracking.py`
- Modify: `backend/app/main.py`
- Modify: `backend/app/schemas.py`
- Create: `backend/tests/test_tracking.py`

- [ ] **Step 1: 编写失败测试**

```python
# backend/tests/test_tracking.py
from datetime import datetime, timedelta


def test_log_response_and_extend(auth_client):
    deadline = (datetime.utcnow() + timedelta(days=1)).isoformat()
    plan = auth_client.post("/plans", json={"title": "Run", "completion_standard": "5km", "deadline": deadline}).json()
    r = auth_client.post(f"/plans/{plan['id']}/track", json={"type": "followup", "response": "extend", "extend_hours": 1})
    assert r.status_code == 201
    data = r.json()
    assert data["response"] == "extend"
    assert data["extend_hours"] == 1
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /workspace/backend && python -m pytest tests/test_tracking.py -v`

Expected: `FAILED ... 404`

- [ ] **Step 3: 编写最小实现**

```python
# backend/app/schemas.py
from uuid import UUID
from pydantic import BaseModel


class PlanLogCreate(BaseModel):
    type: str
    detail: str = ""
    response: str | None = None
    extend_hours: int = 0


class PlanLogOut(BaseModel):
    id: UUID
    plan_id: UUID
    type: str
    detail: str
    response: str | None
    extend_hours: int

    class Config:
        from_attributes = True
```

```python
# backend/app/services/tracking_service.py
import uuid
from sqlalchemy.orm import Session
from app.models import PlanLog


def log_event(db: Session, plan_id: uuid.UUID, data: dict) -> PlanLog:
    log = PlanLog(
        plan_id=plan_id,
        type=data["type"],
        detail=data.get("detail", ""),
        response=data.get("response"),
        extend_hours=data.get("extend_hours", 0),
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def list_logs(db: Session, plan_id: uuid.UUID):
    return db.query(PlanLog).filter(PlanLog.plan_id == plan_id).order_by(PlanLog.created_at.desc()).all()
```

```python
# backend/app/routers/tracking.py
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import PlanLogCreate, PlanLogOut
from app.services import plan_service, tracking_service

router = APIRouter(tags=["tracking"])


@router.post("/plans/{plan_id}/track", response_model=PlanLogOut, status_code=status.HTTP_201_CREATED)
def track(plan_id: uuid.UUID, payload: PlanLogCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    plan = plan_service.get_plan(db, plan_id, user.id)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    return tracking_service.log_event(db, plan_id, payload.model_dump())


@router.get("/plans/{plan_id}/logs", response_model=list[PlanLogOut])
def list_logs(plan_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    plan = plan_service.get_plan(db, plan_id, user.id)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    return tracking_service.list_logs(db, plan_id)
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /workspace/backend && python -m pytest tests/test_tracking.py -v`

Expected: `PASSED`

- [ ] **Step 5: 提交**

```bash
cd /workspace
git add backend/
git commit -m "feat(backend): add tracking layer API for plan events"
```

---

## Task 7: 复盘层 API（复盘记录 / 规则分析）

**Files:**
- Create: `backend/app/services/review_service.py`
- Create: `backend/app/routers/review.py`
- Modify: `backend/app/main.py`
- Modify: `backend/app/schemas.py`
- Create: `backend/tests/test_review.py`

- [ ] **Step 1: 编写失败测试**

```python
# backend/tests/test_review.py
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
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /workspace/backend && python -m pytest tests/test_review.py -v`

Expected: `FAILED ... 404 / 422`

- [ ] **Step 3: 编写最小实现**

```python
# backend/app/schemas.py
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, model_validator


class ReviewCreate(BaseModel):
    date: datetime | None = None
    completed: bool
    reason: str | None = None
    user_reflection: str = ""

    @model_validator(mode="after")
    def require_reason_if_incomplete(self):
        if not self.completed and not self.reason:
            raise ValueError("Reason is required when plan is not completed")
        return self


class ReviewOut(BaseModel):
    id: UUID
    plan_id: UUID
    date: datetime
    completed: bool
    reason: str | None
    ai_analysis: dict
    user_reflection: str

    class Config:
        from_attributes = True
```

```python
# backend/app/services/review_service.py
import uuid
from datetime import datetime
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models import PlanLog, ReviewEntry


def create_review(db: Session, plan_id: uuid.UUID, data: dict) -> ReviewEntry:
    review = ReviewEntry(
        plan_id=plan_id,
        date=data.get("date") or datetime.utcnow(),
        completed=data["completed"],
        reason=data.get("reason"),
        user_reflection=data.get("user_reflection", ""),
        ai_analysis={},
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


def list_reviews(db: Session, plan_id: uuid.UUID):
    return db.query(ReviewEntry).filter(ReviewEntry.plan_id == plan_id).order_by(ReviewEntry.date.desc()).all()


def analyze(db: Session, plan_id: uuid.UUID) -> dict:
    total = db.query(func.count(ReviewEntry.id)).filter(ReviewEntry.plan_id == plan_id).scalar()
    completed = db.query(func.count(ReviewEntry.id)).filter(ReviewEntry.plan_id == plan_id, ReviewEntry.completed == True).scalar()
    extend_count = db.query(func.count(PlanLog.id)).filter(
        PlanLog.plan_id == plan_id, PlanLog.response == "extend"
    ).scalar()
    # Simplified consecutive completed count from latest streak
    reviews = db.query(ReviewEntry).filter(ReviewEntry.plan_id == plan_id).order_by(ReviewEntry.date.asc()).all()
    streak = 0
    for r in reviews:
        if r.completed:
            streak += 1
        else:
            streak = 0
    return {
        "total_reviews": total,
        "completed_reviews": completed,
        "completion_rate": completed / total if total else 0,
        "consecutive_completed": streak,
        "extend_count": extend_count,
        "suggestion": "Keep going!" if streak >= 3 else "Try to finish the next one on time.",
    }
```

```python
# backend/app/routers/review.py
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import ReviewCreate, ReviewOut
from app.services import plan_service, review_service

router = APIRouter(tags=["review"])


@router.post("/plans/{plan_id}/reviews", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def create_review(plan_id: uuid.UUID, payload: ReviewCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    plan = plan_service.get_plan(db, plan_id, user.id)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    try:
        return review_service.create_review(db, plan_id, payload.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/plans/{plan_id}/reviews", response_model=list[ReviewOut])
def list_reviews(plan_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    plan = plan_service.get_plan(db, plan_id, user.id)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    return review_service.list_reviews(db, plan_id)


@router.get("/plans/{plan_id}/reviews/analysis")
def analyze(plan_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    plan = plan_service.get_plan(db, plan_id, user.id)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    return review_service.analyze(db, plan_id)
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /workspace/backend && python -m pytest tests/test_review.py -v`

Expected: `PASSED`

- [ ] **Step 5: 提交**

```bash
cd /workspace
git add backend/
git commit -m "feat(backend): add review layer API and basic analysis"
```

---

## Task 8: 规则引擎（三档模式配置）

**Files:**
- Create: `backend/app/rules/strict.json`
- Create: `backend/app/rules/moderate.json`
- Create: `backend/app/rules/coach.json`
- Create: `backend/app/services/rule_engine.py`
- Create: `backend/tests/test_rule_engine.py`

- [ ] **Step 1: 编写失败测试**

```python
# backend/tests/test_rule_engine.py
from app.services.rule_engine import RuleEngine


def test_strict_mode_message_contains_variables():
    engine = RuleEngine()
    msg = engine.render_reminder("strict", title="Run", deadline="2026-07-10 08:00")
    assert "Run" in msg
    assert "军令状" in msg or "必须" in msg


def test_analyze_recommends_switch_mode():
    engine = RuleEngine()
    result = engine.analyze(mode="moderate", consecutive_missed=4)
    assert result["advice"] == "建议切换至'时刻提醒型'强化执行"
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /workspace/backend && python -m pytest tests/test_rule_engine.py -v`

Expected: `FAILED ... ImportError / AttributeError`

- [ ] **Step 3: 编写最小实现**

```json
// backend/app/rules/strict.json
{
  "mode": "strict",
  "reminder_template": "【严师】你的军令状「{title}」将在 {deadline} 到期，立即执行，不要找理由！",
  "followup_escalation": [60, 180, 360],
  "review_suggestion": "连续 {consecutive_missed} 次未完成，建议切换至'时刻提醒型'强化执行"
}
```

```json
// backend/app/rules/moderate.json
{
  "mode": "moderate",
  "reminder_template": "【严师】别忘了「{title}」，截止时间 {deadline}，合理分配时间。",
  "followup_escalation": [120, 240],
  "review_suggestion": "连续 {consecutive_missed} 次未完成，建议切换至'时刻提醒型'强化执行"
}
```

```json
// backend/app/rules/coach.json
{
  "mode": "coach",
  "reminder_template": "【严师】关于「{title}」，试试番茄工作法或拆分任务？",
  "followup_escalation": [],
  "review_suggestion": "连续 {consecutive_missed} 次未完成，可以尝试更主动的方法交流型策略"
}
```

```python
# backend/app/services/rule_engine.py
import json
import os
from typing import Any


class RuleEngine:
    def __init__(self, rules_dir: str | None = None):
        self.rules_dir = rules_dir or os.path.join(os.path.dirname(__file__), "..", "rules")
        self._configs: dict[str, dict] = {}
        for fname in os.listdir(self.rules_dir):
            if fname.endswith(".json"):
                with open(os.path.join(self.rules_dir, fname), encoding="utf-8") as f:
                    cfg = json.load(f)
                    self._configs[cfg["mode"]] = cfg

    def _config(self, mode: str) -> dict:
        if mode not in self._configs:
            raise ValueError(f"Unknown mode: {mode}")
        return self._configs[mode]

    def render_reminder(self, mode: str, **kwargs: Any) -> str:
        return self._config(mode)["reminder_template"].format(**kwargs)

    def escalation_intervals(self, mode: str) -> list[int]:
        return self._config(mode)["followup_escalation"]

    def analyze(self, mode: str, consecutive_missed: int, **kwargs: Any) -> dict:
        config = self._config(mode)
        threshold = 3
        advice = ""
        if consecutive_missed >= threshold:
            advice = config["review_suggestion"].format(consecutive_missed=consecutive_missed)
        elif consecutive_missed > 0:
            advice = "注意完成节奏，避免连续中断"
        else:
            advice = "表现不错，继续保持"
        return {"mode": mode, "consecutive_missed": consecutive_missed, "advice": advice}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /workspace/backend && python -m pytest tests/test_rule_engine.py -v`

Expected: `PASSED`

- [ ] **Step 5: 提交**

```bash
cd /workspace
git add backend/
git commit -m "feat(backend): add configurable rule engine for three modes"
```

---

## Task 9: 提醒调度系统（基于 Redis Sorted Set）

**Files:**
- Create: `backend/app/services/reminder_scheduler.py`
- Modify: `backend/app/redis_client.py`（添加队列操作）
- Create: `backend/tests/test_reminder_scheduler.py`

- [ ] **Step 1: 编写失败测试**

```python
# backend/tests/test_reminder_scheduler.py
import time
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
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /workspace/backend && python -m pytest tests/test_reminder_scheduler.py -v`

Expected: `FAILED ... AttributeError: from_fake`

- [ ] **Step 3: 编写最小实现**

```python
# backend/app/redis_client.py 添加
import json
import fakeredis


class RedisClient:
    def __init__(self, redis: Redis | None = None):
        self._redis = redis or Redis.from_url(settings.redis_url, decode_responses=True)

    @classmethod
    def from_fake(cls):
        return cls(fakeredis.FakeRedis())

    def zadd_reminder(self, due_at_ts: float, payload: dict) -> None:
        self._redis.zadd(ReminderKey.due_queue(), {json.dumps(payload, ensure_ascii=False): due_at_ts})

    def zrange_due(self, before_ts: float, limit: int = 100) -> list[tuple[dict, float]]:
        items = self._redis.zrangebyscore(ReminderKey.due_queue(), 0, before_ts, withscores=True, start=0, num=limit)
        return [(json.loads(raw), score) for raw, score in items]

    def zrem_reminder(self, payload: dict) -> None:
        self._redis.zrem(ReminderKey.due_queue(), json.dumps(payload, ensure_ascii=False))
```

```python
# backend/app/services/reminder_scheduler.py
import json
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
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /workspace/backend && python -m pytest tests/test_reminder_scheduler.py -v`

Expected: `PASSED`

- [ ] **Step 5: 提交**

```bash
cd /workspace
git add backend/
git commit -m "feat(backend): add Redis-backed reminder scheduler using sorted sets"
```

---

## Task 10: Docker Compose 与 Nginx 生产配置

**Files:**
- Create: `backend/Dockerfile`
- Create: `docker-compose.yml`
- Create: `nginx.conf`
- Create: `backend/.env.example`
- Create: `backend/tests/test_integration.py`

- [ ] **Step 1: 编写失败测试**

```python
# backend/tests/test_integration.py
from fastapi.testclient import TestClient
from app.main import app


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
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd /workspace/backend && python -m pytest tests/test_integration.py -v`

Expected: `FAILED ... if any route returns 422/401`

- [ ] **Step 3: 编写最小实现**

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app/ ./app/
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: yanshi
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql+psycopg2://postgres:postgres@db:5432/yanshi
      REDIS_URL: redis://redis:6379/0
      SECRET_KEY: change-me-in-production
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  pgdata:
```

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# backend/.env.example
DATABASE_URL=postgresql+psycopg2://postgres:postgres@db:5432/yanshi
REDIS_URL=redis://redis:6379/0
SECRET_KEY=change-me-in-production
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd /workspace/backend && python -m pytest tests/test_integration.py -v`

Expected: `PASSED`

- [ ] **Step 5: 提交**

```bash
cd /workspace
git add backend/ docker-compose.yml nginx.conf
git commit -m "chore(backend): add Docker Compose and Nginx production config"
```

---

## 附录：Redis 最佳实践速查

- `data-choose-structure`：提醒队列使用 Redis Sorted Set（score = 到期时间戳），便于按时间范围原子弹出。
- `data-key-naming`：统一前缀 `yanshi:{domain}:{id}`，如 `yanshi:session:{user_id}`、`yanshi:reminders:due`。
- `ram-ttl`：会话缓存 key 设置 TTL（默认 86400 秒）。
- `conn-pooling`：`RedisClient` 内部使用 `Redis.from_url` 创建的连接池，避免每次请求新建连接。
- `conn-blocking`：使用 `ZRANGEBYSCORE` 时始终带 `limit` 参数，避免一次性返回大量数据。
- `rqe-*`：本阶段暂不启用 Redis Query Engine；向量检索 Phase 2 使用 Qdrant。
