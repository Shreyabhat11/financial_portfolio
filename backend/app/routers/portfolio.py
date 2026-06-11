from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.holding import Holding
from app.schemas.portfolio import HoldingCreate, PortfolioResponse
from app.services.portfolio_service import (
    get_user_portfolio, create_portfolio, add_holding, calculate_portfolio_metrics
)
from app.services.sync_service import sync_all_brokers_for_user, refresh_prices

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


@router.get("/", response_model=PortfolioResponse)
def get_portfolio(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    portfolio = get_user_portfolio(db, current_user.id)
    if not portfolio:
        portfolio = create_portfolio(db, current_user.id)
    portfolio = calculate_portfolio_metrics(portfolio)
    db.commit()
    return portfolio


@router.get("/holdings")
def get_holdings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns all holdings (broker-synced + manually added).
    Each row shows its source so the UI can display broker badges.
    """
    portfolio = get_user_portfolio(db, current_user.id)
    if not portfolio:
        return []

    portfolio = calculate_portfolio_metrics(portfolio)
    db.commit()

    from app.models.broker_account import BrokerAccount
    # Build a quick lookup of broker_account_id → broker_name
    broker_names: dict[int, str] = {}
    accounts = db.query(BrokerAccount).filter(BrokerAccount.user_id == current_user.id).all()
    for a in accounts:
        broker_names[a.id] = a.broker_name

    return [
        {
            "id": h.id,
            "symbol": h.stock_symbol,
            "name": h.stock_symbol,
            "qty": h.quantity,
            "avgCost": h.average_price,
            "cmp": h.current_price,
            "dayPnl": round((h.day_change or 0) * h.quantity, 2),
            "yearPnl": h.profit_loss,
            "dayChangePct": h.day_change_pct or 0,
            "source": h.source or "manual",
            "broker": broker_names.get(h.broker_account_id, "") if h.broker_account_id else "",
            "lastSynced": h.last_synced_at.isoformat() if h.last_synced_at else None,
            "aiSignal": "BUY" if h.profit_loss > 0 else "HOLD" if h.profit_loss == 0 else "SELL",
        }
        for h in portfolio.holdings
    ]


@router.get("/performance")
def get_performance(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    portfolio = get_user_portfolio(db, current_user.id)
    if not portfolio:
        return {"data": []}
    portfolio = calculate_portfolio_metrics(portfolio)
    db.commit()
    base = portfolio.total_value or 0
    months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    data = [{"date": m, "value": round(base * (0.85 + i * 0.015))} for i, m in enumerate(months)]
    return {"data": data, "totalValue": portfolio.total_value, "totalProfit": portfolio.total_profit}


@router.post("/sync")
def sync_portfolio(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Manually trigger a full sync from all connected brokers.
    Also called automatically by the background scheduler.
    """
    result = sync_all_brokers_for_user(db, current_user.id)
    return result


@router.post("/sync/prices")
def sync_prices_only(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Refresh live prices without hitting broker APIs (faster)."""
    portfolio = get_user_portfolio(db, current_user.id)
    if not portfolio:
        return {"message": "No portfolio"}
    portfolio = refresh_prices(db, portfolio)
    return {
        "totalValue": portfolio.total_value,
        "totalProfit": portfolio.total_profit,
        "holdingsCount": len(portfolio.holdings),
    }


@router.post("/add-holding")
def create_holding(request: HoldingCreate, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    """Add a manual holding (for brokers not yet integrated)."""
    portfolio = get_user_portfolio(db, current_user.id)
    if not portfolio:
        portfolio = create_portfolio(db, current_user.id)
    holding = add_holding(
        db=db,
        portfolio_id=portfolio.id,
        stock_symbol=request.stock_symbol,
        quantity=request.quantity,
        average_price=request.average_price,
    )
    return holding


@router.delete("/holding/{holding_id}")
def delete_holding(holding_id: int, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    """Remove a manually-added holding. Broker holdings are removed via sync."""
    portfolio = get_user_portfolio(db, current_user.id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    holding = db.query(Holding).filter(
        Holding.id == holding_id,
        Holding.portfolio_id == portfolio.id,
    ).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")
    if holding.source == "broker":
        raise HTTPException(status_code=400,
            detail="Cannot delete broker-synced holding. It will be removed automatically when you sell the stock.")
    db.delete(holding)
    db.commit()
    return {"message": "Holding removed"}
