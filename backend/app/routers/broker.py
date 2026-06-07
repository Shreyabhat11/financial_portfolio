from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.broker_account import BrokerAccount
from app.brokers.zerodha import ZerodhaBroker

router = APIRouter(
    prefix="/brokers",
    tags=["Broker"]
)


class BrokerConnectRequest(BaseModel):
    broker_name: str
    api_key: str
    api_secret: str = ""


@router.get("/")
def get_brokers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    accounts = db.query(BrokerAccount).filter(
        BrokerAccount.user_id == current_user.id
    ).all()
    return [
        {
            "id": a.id,
            "broker_name": a.broker_name,
            "broker_user_id": a.broker_user_id,
            "status": "connected",
        }
        for a in accounts
    ]


@router.post("/connect")
def connect_broker(
    request: BrokerConnectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    broker_account = BrokerAccount(
        user_id=current_user.id,
        broker_name=request.broker_name,
        access_token=request.api_key,
        broker_user_id=f"{request.broker_name}_{current_user.id}"
    )
    db.add(broker_account)
    db.commit()
    db.refresh(broker_account)
    return {"message": f"{request.broker_name} connected successfully", "id": broker_account.id}


@router.delete("/{broker_id}")
def disconnect_broker(
    broker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    account = db.query(BrokerAccount).filter(
        BrokerAccount.id == broker_id,
        BrokerAccount.user_id == current_user.id
    ).first()
    if account:
        db.delete(account)
        db.commit()
    return {"message": "Broker disconnected"}


# Keep Zerodha OAuth routes
@router.get("/zerodha/login")
def zerodha_login(current_user: User = Depends(get_current_user)):
    broker = ZerodhaBroker()
    return {"login_url": broker.get_login_url()}


@router.get("/zerodha/callback")
def zerodha_callback(
    request_token: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    broker = ZerodhaBroker()
    session_data = broker.generate_session(request_token)
    broker_account = BrokerAccount(
        user_id=current_user.id,
        broker_name="zerodha",
        access_token=session_data["access_token"],
        broker_user_id=session_data["user_id"]
    )
    db.add(broker_account)
    db.commit()
    return {"message": "Zerodha connected successfully"}
