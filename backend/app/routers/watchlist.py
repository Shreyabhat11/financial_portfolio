from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.watchlist import WatchlistCreate, WatchlistResponse
from app.services.watchlist_service import add_to_watchlist, get_watchlist, remove_from_watchlist
from app.services.market_service import get_stock_price

router = APIRouter(
    prefix="/watchlist",
    tags=["Watchlist"]
)


@router.post("/add", response_model=WatchlistResponse)
def add_stock(
    request: WatchlistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return add_to_watchlist(db, current_user.id, request.stock_symbol)


@router.get("/", response_model=list[WatchlistResponse])
def get_user_watchlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items = get_watchlist(db, current_user.id)
    result = []
    for item in items:
        data = get_stock_price(item.stock_symbol)
        result.append({
            "id": item.id,
            "stock_symbol": item.stock_symbol,
            "price": data["price"] if data else 0,
            "change": round((hash(item.stock_symbol) % 50 - 20) / 10, 2),
        })
    return result


@router.delete("/remove/{item_id}")
def delete_watchlist_item_v2(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = remove_from_watchlist(db, item_id, current_user.id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Removed from watchlist"}


@router.delete("/{item_id}")
def delete_watchlist_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = remove_from_watchlist(db, item_id, current_user.id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Removed from watchlist"}
