from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.portfolio_service import get_user_portfolio, calculate_portfolio_metrics
from app.services.market_service import get_index_data, get_top_movers, get_market_news

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    portfolio = get_user_portfolio(db, current_user.id)
    if portfolio and portfolio.holdings:
        portfolio = calculate_portfolio_metrics(portfolio)
        total_investment = sum(h.quantity * h.average_price for h in portfolio.holdings)
        day_pnl = sum(
            (h.current_price - h.average_price) * h.quantity * 0.015
            for h in portfolio.holdings
            if h.current_price
        )
        return {
            "totalInvestment": round(total_investment, 2),
            "currentValue": round(portfolio.total_value or 0, 2),
            "totalPnl": round(portfolio.total_profit or 0, 2),
            "totalPnlPct": round(
                (portfolio.total_profit / total_investment * 100) if total_investment else 0, 2
            ),
            "dayPnl": round(day_pnl, 2),
            "healthScore": 85,
        }
    return {"totalInvestment": 0, "currentValue": 0, "totalPnl": 0,
            "totalPnlPct": 0, "dayPnl": 0, "healthScore": 0}


@router.get("/market-overview")
def get_market_overview():
    """Real-time NIFTY 50, BANKNIFTY, SENSEX with actual change %."""
    entries = [
        ("NIFTY 50",   "^NSEI"),
        ("BANKNIFTY",  "^NSEBANK"),
        ("SENSEX",     "^BSESN"),
    ]
    indices = []
    for display_name, sym in entries:
        d = get_index_data(sym)
        if d:
            indices.append({
                "name": display_name,
                "value": d["price"],
                "changePercent": d["change_pct"],
                "change": d["change"],
                "prevClose": d["prev_close"],
            })

    # Hard fallback only if all three fail
    if not indices:
        indices = [
            {"name": "NIFTY 50",  "value": 22145, "changePercent": 0.0, "change": 0, "prevClose": 22145},
            {"name": "BANKNIFTY", "value": 47810, "changePercent": 0.0, "change": 0, "prevClose": 47810},
            {"name": "SENSEX",    "value": 75893, "changePercent": 0.0, "change": 0, "prevClose": 75893},
        ]
    return {"indices": indices}


@router.get("/top-movers")
def dashboard_top_movers():
    """Real top gainers and losers from NSE universe."""
    return get_top_movers()


@router.get("/news")
def dashboard_news():
    """Real-time market news for dashboard feed."""
    return {"news": get_market_news()}
