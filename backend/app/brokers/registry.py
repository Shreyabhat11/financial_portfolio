"""
Broker registry — maps broker_name → broker class.
Add new brokers here; everything else auto-discovers them.
"""
from sqlalchemy.orm import Session
from app.models.broker_account import BrokerAccount


def get_broker_instance(broker_name: str, access_token: str):
    """Return an initialised broker instance for the given name."""
    name = broker_name.lower()
    if name == "zerodha":
        from app.brokers.zerodha import ZerodhaBroker
        return ZerodhaBroker(access_token=access_token)
    if name == "upstox":
        from app.brokers.upstox import UpstoxBroker
        return UpstoxBroker(access_token=access_token)
    raise ValueError(f"Unknown broker: {broker_name}")


def get_fastest_broker(db: Session, user_id: int):
    """
    Return the broker instance most likely to execute fastest.
    Priority order (latency-based, empirical): Zerodha > Upstox > others.
    Returns (broker_instance, broker_account) or (None, None).
    """
    PRIORITY = ["zerodha", "upstox", "angel", "groww", "icici", "hdfc"]

    accounts = db.query(BrokerAccount).filter(
        BrokerAccount.user_id == user_id,
        BrokerAccount.access_token.isnot(None),
    ).all()

    account_map = {a.broker_name.lower(): a for a in accounts}

    for name in PRIORITY:
        if name in account_map:
            acct = account_map[name]
            try:
                broker = get_broker_instance(acct.broker_name, acct.access_token)
                return broker, acct
            except Exception:
                continue

    return None, None
