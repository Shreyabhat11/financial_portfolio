from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import hash_password, verify_password
from app.models.user import User

router = APIRouter(
    prefix="/settings",
    tags=["Settings"]
)


class ProfileUpdate(BaseModel):
    name: str
    email: EmailStr


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str


@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
    }


@router.put("/profile")
def update_profile(
    data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(User).filter(
        User.email == data.email,
        User.id != current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use")

    current_user.name = data.name
    current_user.email = data.email
    db.commit()
    db.refresh(current_user)
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email}


@router.put("/password")
def update_password(
    data: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


@router.get("/notifications")
def get_notification_prefs(current_user: User = Depends(get_current_user)):
    return {
        "priceAlerts": True,
        "aiSignals": True,
        "newsDigest": False,
        "weeklyReport": True,
        "emailAlerts": True,
        "pushAlerts": False,
    }
