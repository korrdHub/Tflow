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
