from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    DateTime
)

from sqlalchemy.orm import relationship

from sqlalchemy.sql import func

from app.core.database import Base


class Holding(Base):
    __tablename__ = "holdings"

    id = Column(Integer, primary_key=True, index=True)

    portfolio_id = Column(
        Integer,
        ForeignKey("portfolios.id"),
        nullable=False
    )

    stock_symbol = Column(String, nullable=False)

    quantity = Column(Float, nullable=False)

    average_price = Column(Float, nullable=False)

    current_price = Column(Float, default=0)

    profit_loss = Column(Float, default=0)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    portfolio = relationship(
        "Portfolio",
        back_populates="holdings"
    )