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
