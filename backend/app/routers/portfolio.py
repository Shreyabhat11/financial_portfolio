from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.portfolio import HoldingCreate, PortfolioResponse
from app.services.portfolio_service import (
    get_user_portfolio, create_portfolio, add_holding, calculate_portfolio_metrics
)

router = APIRouter(
    prefix="/portfolio",
    tags=["Portfolio"]
)


@router.get("/", response_model=PortfolioResponse)
def get_portfolio(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    portfolio = get_user_portfolio(db, current_user.id)
    if not portfolio:
        portfolio = create_portfolio(db, current_user.id)
    portfolio = calculate_portfolio_metrics(portfolio)
    db.commit()
    return portfolio


@router.get("/holdings")
def get_holdings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    portfolio = get_user_portfolio(db, current_user.id)
    if not portfolio:
        return []
    portfolio = calculate_portfolio_metrics(portfolio)
    db.commit()
    return [
        {
            "symbol": h.stock_symbol,
            "name": h.stock_symbol,
            "qty": h.quantity,
            "avgCost": h.average_price,
            "cmp": h.current_price,
            "dayPnl": round(h.profit_loss * 0.03, 2),
            "yearPnl": h.profit_loss,
            "aiSignal": "BUY" if h.profit_loss > 0 else "HOLD" if h.profit_loss == 0 else "SELL"
        }
        for h in portfolio.holdings
    ]


@router.get("/performance")
def get_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    portfolio = get_user_portfolio(db, current_user.id)
    if not portfolio:
        return {"data": []}
    portfolio = calculate_portfolio_metrics(portfolio)
    db.commit()
    # Return 12-month simulated growth based on real total_value
    base = portfolio.total_value or 10000
    months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    data = [{"date": m, "value": round(base * (0.85 + i * 0.015))} for i, m in enumerate(months)]
    return {"data": data, "totalValue": portfolio.total_value, "totalProfit": portfolio.total_profit}


@router.post("/add-holding")
def create_holding(
    request: HoldingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    portfolio = get_user_portfolio(db, current_user.id)
    if not portfolio:
        portfolio = create_portfolio(db, current_user.id)
    holding = add_holding(
        db=db,
        portfolio_id=portfolio.id,
        stock_symbol=request.stock_symbol,
        quantity=request.quantity,
        average_price=request.average_price
    )
    return holding
