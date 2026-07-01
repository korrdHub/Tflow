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
