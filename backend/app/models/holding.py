from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Holding(Base):
    __tablename__ = "holdings"

    id = Column(Integer, primary_key=True, index=True)

    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), nullable=False)

    # Which broker this holding came from (null = manually added)
    broker_account_id = Column(Integer, ForeignKey("broker_accounts.id"), nullable=True)

    stock_symbol = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    average_price = Column(Float, nullable=False)
    current_price = Column(Float, default=0)
    profit_loss = Column(Float, default=0)
    day_change = Column(Float, default=0)
    day_change_pct = Column(Float, default=0)

    # "broker" | "manual"
    source = Column(String, default="manual")

    # Raw broker data — product type, ISIN etc.
    product_type = Column(String, nullable=True)

    last_synced_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    portfolio = relationship("Portfolio", back_populates="holdings")
