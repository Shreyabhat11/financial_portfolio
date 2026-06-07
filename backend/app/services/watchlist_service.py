from sqlalchemy.orm import Session

from app.models.watchlist import Watchlist


def add_to_watchlist(
    db: Session,
    user_id: int,
    stock_symbol: str
):
    item = Watchlist(
        user_id=user_id,
        stock_symbol=stock_symbol.upper()
    )

    db.add(item)

    db.commit()

    db.refresh(item)

    return item


def get_watchlist(
    db: Session,
    user_id: int
):
    return db.query(Watchlist).filter(
        Watchlist.user_id == user_id
    ).all()


def remove_from_watchlist(
    db: Session,
    item_id: int,
    user_id: int
):
    item = db.query(Watchlist).filter(
        Watchlist.id == item_id,
        Watchlist.user_id == user_id
    ).first()

    if item:
        db.delete(item)
        db.commit()

    return item