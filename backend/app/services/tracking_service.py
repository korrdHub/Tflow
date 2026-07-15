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
