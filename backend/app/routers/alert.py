from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.alert import Alert
from app.schemas.alert import AlertCreate, AlertResponse
from app.services.alert_service import create_alert, get_alerts

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


@router.post("/create", response_model=AlertResponse)
def create_user_alert(
    request: AlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_alert(
        db=db,
        user_id=current_user.id,
        stock_symbol=request.stock_symbol,
        condition_type=request.condition_type,
        condition_value=request.condition_value
    )


@router.get("/", response_model=list[AlertResponse])
def get_user_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_alerts(db, current_user.id)


@router.delete("/{alert_id}")
def delete_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = db.query(Alert).filter(
        Alert.id == alert_id,
        Alert.user_id == current_user.id
    ).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    db.delete(alert)
    db.commit()
    return {"message": "Alert deleted"}


@router.put("/{alert_id}")
def update_alert(
    alert_id: int,
    request: AlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = db.query(Alert).filter(
        Alert.id == alert_id,
        Alert.user_id == current_user.id
    ).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.stock_symbol = request.stock_symbol
    alert.condition_type = request.condition_type
    alert.condition_value = request.condition_value
    db.commit()
    db.refresh(alert)
    return alert
