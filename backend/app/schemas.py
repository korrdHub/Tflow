from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field
from app.models import PlanStatus


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None


class Token(BaseModel):
    access_token: str
    token_type: str


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
