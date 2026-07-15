from datetime import datetime
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
    plan = Plan(user_id=user.id, title="Run 5km", completion_standard="GPS >= 5km", deadline=datetime(2026, 7, 10, 8, 0, 0))
    db.add(plan)
    db.commit()
    assert db.query(Plan).filter(Plan.user_id == user.id).count() == 1
