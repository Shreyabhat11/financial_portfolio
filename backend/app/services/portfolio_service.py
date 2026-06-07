from sqlalchemy.orm import Session

from app.models.portfolio import Portfolio
from app.models.holding import Holding
from app.services.market_service import (
    get_stock_price
)


def get_user_portfolio(
    db: Session,
    user_id: int
):
    return db.query(Portfolio).filter(
        Portfolio.user_id == user_id
    ).first()


def create_portfolio(
    db: Session,
    user_id: int
):
    portfolio = Portfolio(
        user_id=user_id
    )

    db.add(portfolio)

    db.commit()

    db.refresh(portfolio)

    return portfolio


def add_holding(
    db: Session,
    portfolio_id: int,
    stock_symbol: str,
    quantity: float,
    average_price: float
):
    holding = Holding(
        portfolio_id=portfolio_id,
        stock_symbol=stock_symbol.upper(),
        quantity=quantity,
        average_price=average_price,
        current_price=average_price,
        profit_loss=0
    )

    db.add(holding)

    db.commit()

    db.refresh(holding)

    return holding

def calculate_portfolio_metrics(portfolio):
    total_value = 0
    total_profit = 0

    for holding in portfolio.holdings:
        market_data = get_stock_price(
            holding.stock_symbol
        )

        if market_data:
            current_price = market_data["price"]

            holding.current_price = current_price

            invested = (
                holding.quantity *
                holding.average_price
            )

            current_value = (
                holding.quantity *
                current_price
            )

            profit = current_value - invested

            holding.profit_loss = round(profit, 2)

            total_value += current_value

            total_profit += profit

    portfolio.total_value = round(total_value, 2)

    portfolio.total_profit = round(total_profit, 2)

    return portfolio

