from sqlalchemy.orm import Session
from app.models.portfolio import Portfolio
from app.models.holding import Holding
from app.services.market_service import get_stock_price


def get_user_portfolio(db: Session, user_id: int):
    return db.query(Portfolio).filter(Portfolio.user_id == user_id).first()


def create_portfolio(db: Session, user_id: int):
    portfolio = Portfolio(user_id=user_id)
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    return portfolio


def add_holding(db: Session, portfolio_id: int, stock_symbol: str,
                quantity: float, average_price: float):
    holding = Holding(
        portfolio_id  = portfolio_id,
        stock_symbol  = stock_symbol.upper(),
        quantity      = quantity,
        average_price = average_price,
        current_price = average_price,
        profit_loss   = 0,
        source        = "manual",
    )
    db.add(holding)
    db.commit()
    db.refresh(holding)
    return holding


def calculate_portfolio_metrics(portfolio: Portfolio) -> Portfolio:
    total_value = 0.0
    total_profit = 0.0

    for h in portfolio.holdings:
        market = get_stock_price(h.stock_symbol)
        if market:
            cmp = market["price"]
            h.current_price  = cmp
            h.day_change     = market.get("change", 0)
            h.day_change_pct = market.get("change_pct", 0)
            invested = h.quantity * h.average_price
            pnl = h.quantity * cmp - invested
            h.profit_loss = round(pnl, 2)
            total_value  += h.quantity * cmp
            total_profit += pnl

    portfolio.total_value  = round(total_value, 2)
    portfolio.total_profit = round(total_profit, 2)
    return portfolio
