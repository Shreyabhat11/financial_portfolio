from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.broker_account import BrokerAccount
from app.brokers.registry import get_broker_instance, get_fastest_broker
from app.core.config import settings

router = APIRouter(prefix="/brokers", tags=["Broker"])

FRONTEND_URL = "http://localhost:3000"


# ── Schemas ───────────────────────────────────────────────────────────────────
class PlaceOrderRequest(BaseModel):
    symbol: str
    qty: int
    side: str          # BUY | SELL
    order_type: str = "MARKET"
    price: float = 0
    broker_id: int = None   # None = use fastest available


# ── List connected brokers ────────────────────────────────────────────────────
@router.get("/")
def get_brokers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    accounts = db.query(BrokerAccount).filter(BrokerAccount.user_id == current_user.id).all()
    result = []
    for a in accounts:
        # Try to get live funds — show as "active" if token works
        try:
            broker = get_broker_instance(a.broker_name, a.access_token)
            funds = broker.get_funds()
            status = "active"
            available_cash = funds.get("available_cash", 0)
        except Exception:
            status = "token_expired"
            available_cash = None

        result.append({
            "id": a.id,
            "broker_name": a.broker_name,
            "broker_user_id": a.broker_user_id,
            "status": status,
            "available_cash": available_cash,
        })
    return result


# ── Disconnect ────────────────────────────────────────────────────────────────
@router.delete("/{broker_id}")
def disconnect_broker(broker_id: int, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    acct = db.query(BrokerAccount).filter(
        BrokerAccount.id == broker_id, BrokerAccount.user_id == current_user.id
    ).first()
    if acct:
        db.delete(acct)
        db.commit()
    return {"message": "Broker disconnected"}


# ── Holdings sync ─────────────────────────────────────────────────────────────
@router.get("/{broker_id}/holdings")
def get_broker_holdings(broker_id: int, db: Session = Depends(get_db),
                        current_user: User = Depends(get_current_user)):
    acct = db.query(BrokerAccount).filter(
        BrokerAccount.id == broker_id, BrokerAccount.user_id == current_user.id
    ).first()
    if not acct:
        raise HTTPException(status_code=404, detail="Broker not found")
    try:
        broker = get_broker_instance(acct.broker_name, acct.access_token)
        return {"holdings": broker.get_holdings()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch holdings: {str(e)}")


# ── Funds ─────────────────────────────────────────────────────────────────────
@router.get("/{broker_id}/funds")
def get_broker_funds(broker_id: int, db: Session = Depends(get_db),
                     current_user: User = Depends(get_current_user)):
    acct = db.query(BrokerAccount).filter(
        BrokerAccount.id == broker_id, BrokerAccount.user_id == current_user.id
    ).first()
    if not acct:
        raise HTTPException(status_code=404, detail="Broker not found")
    try:
        broker = get_broker_instance(acct.broker_name, acct.access_token)
        return broker.get_funds()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch funds: {str(e)}")


# ── Place order (auto-selects fastest broker) ─────────────────────────────────
@router.post("/order/place")
def place_order(req: PlaceOrderRequest, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    if req.broker_id:
        acct = db.query(BrokerAccount).filter(
            BrokerAccount.id == req.broker_id, BrokerAccount.user_id == current_user.id
        ).first()
        if not acct:
            raise HTTPException(status_code=404, detail="Broker not found")
        broker = get_broker_instance(acct.broker_name, acct.access_token)
        broker_name = acct.broker_name
    else:
        broker, acct = get_fastest_broker(db, current_user.id)
        if not broker:
            raise HTTPException(status_code=400, detail="No active broker connected")
        broker_name = acct.broker_name

    try:
        result = broker.place_order(
            symbol=req.symbol.upper(),
            qty=req.qty,
            side=req.side,
            order_type=req.order_type,
            price=req.price,
        )
        result["broker_used"] = broker_name
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Order failed: {str(e)}")


# ── Cancel order ──────────────────────────────────────────────────────────────
@router.post("/{broker_id}/order/{order_id}/cancel")
def cancel_order(broker_id: int, order_id: str,
                 db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    acct = db.query(BrokerAccount).filter(
        BrokerAccount.id == broker_id, BrokerAccount.user_id == current_user.id
    ).first()
    if not acct:
        raise HTTPException(status_code=404, detail="Broker not found")
    try:
        broker = get_broker_instance(acct.broker_name, acct.access_token)
        return broker.cancel_order(order_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Cancel failed: {str(e)}")


# ─────────────────────────────────────────────────────────────────────────────
# ZERODHA OAuth  (only broker with official OAuth in India currently)
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/zerodha/login-url")
def zerodha_login_url(current_user: User = Depends(get_current_user)):
    from app.brokers.zerodha import ZerodhaBroker
    return {"login_url": ZerodhaBroker().get_login_url()}


@router.get("/zerodha/callback")
def zerodha_callback(request_token: str, db: Session = Depends(get_db)):
    """
    Zerodha redirects here after login.
    We store the token then redirect back to the frontend Brokers page.
    NOTE: In production pass user_id via state param. For now we update
    the most recently created account or create a new one for user_id=1.
    """
    from app.brokers.zerodha import ZerodhaBroker
    try:
        broker = ZerodhaBroker()
        session_data = broker.generate_session(request_token)
        access_token = session_data["access_token"]
        kite_user_id = session_data["user_id"]

        # Upsert broker account — find by kite user_id or create
        acct = db.query(BrokerAccount).filter(
            BrokerAccount.broker_name == "zerodha",
            BrokerAccount.broker_user_id == kite_user_id,
        ).first()
        if acct:
            acct.access_token = access_token
        else:
            acct = BrokerAccount(
                user_id=1,            # TODO: pass real user_id via OAuth state
                broker_name="zerodha",
                access_token=access_token,
                broker_user_id=kite_user_id,
            )
            db.add(acct)
        db.commit()
    except Exception as e:
        return RedirectResponse(f"{FRONTEND_URL}/brokers?error=zerodha_failed&msg={str(e)}")

    return RedirectResponse(f"{FRONTEND_URL}/brokers?connected=zerodha")


# ─────────────────────────────────────────────────────────────────────────────
# UPSTOX OAuth
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/upstox/login-url")
def upstox_login_url(current_user: User = Depends(get_current_user)):
    from app.brokers.upstox import UpstoxBroker
    return {"login_url": UpstoxBroker().get_login_url()}


@router.get("/upstox/callback")
def upstox_callback(code: str, db: Session = Depends(get_db)):
    from app.brokers.upstox import UpstoxBroker
    try:
        broker = UpstoxBroker()
        session_data = broker.generate_session(code)
        access_token = session_data["access_token"]
        upstox_user_id = session_data.get("user_id", "upstox_user")

        acct = db.query(BrokerAccount).filter(
            BrokerAccount.broker_name == "upstox",
            BrokerAccount.broker_user_id == upstox_user_id,
        ).first()
        if acct:
            acct.access_token = access_token
        else:
            acct = BrokerAccount(
                user_id=1,
                broker_name="upstox",
                access_token=access_token,
                broker_user_id=upstox_user_id,
            )
            db.add(acct)
        db.commit()
    except Exception as e:
        return RedirectResponse(f"{FRONTEND_URL}/brokers?error=upstox_failed&msg={str(e)}")

    return RedirectResponse(f"{FRONTEND_URL}/brokers?connected=upstox")
