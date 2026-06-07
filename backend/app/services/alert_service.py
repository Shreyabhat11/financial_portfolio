from sqlalchemy.orm import Session

from app.models.alert import Alert


def create_alert(
    db: Session,
    user_id: int,
    stock_symbol: str,
    condition_type: str,
    condition_value: float
):
    alert = Alert(
        user_id=user_id,
        stock_symbol=stock_symbol.upper(),
        condition_type=condition_type,
        condition_value=condition_value
    )

    db.add(alert)

    db.commit()

    db.refresh(alert)

    return alert


def get_alerts(
    db: Session,
    user_id: int
):
    return db.query(Alert).filter(
        Alert.user_id == user_id
    ).all()