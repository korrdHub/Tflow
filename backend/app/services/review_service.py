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
