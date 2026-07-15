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
    hashed_password = Column(String, nullable=True)
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
