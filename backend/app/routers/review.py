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
