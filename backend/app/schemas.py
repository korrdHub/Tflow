from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, model_validator
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
