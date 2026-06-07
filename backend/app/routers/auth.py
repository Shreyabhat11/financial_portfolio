from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import RegisterRequest, UserResponse, LoginRequest
from app.services.auth_service import get_user_by_email, create_user
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


def _user_response(user: User):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
    }


@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    if get_user_by_email(db, request.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(request.password)
    user = create_user(
        db=db,
        name=request.name,
        email=request.email,
        hashed_password=hashed_pw
    )

    # Return token immediately so frontend doesn't need a second login call
    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "accessToken": access_token,
        "token_type": "bearer",
        "user": _user_response(user),
    }


@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, request.email)
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "accessToken": access_token,
        "token_type": "bearer",
        "user": _user_response(user),
    }


@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}


@router.post("/refresh-token")
def refresh_token():
    raise HTTPException(status_code=401, detail="Please log in again")


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
