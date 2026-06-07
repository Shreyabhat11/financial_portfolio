from pydantic import BaseModel
from typing import List


class HoldingCreate(BaseModel):
    stock_symbol: str
    quantity: float
    average_price: float


class HoldingResponse(BaseModel):
    id: int
    stock_symbol: str
    quantity: float
    average_price: float
    current_price: float
    profit_loss: float

    class Config:
        from_attributes = True


class PortfolioResponse(BaseModel):
    id: int
    total_value: float
    total_profit: float
    holdings: List[HoldingResponse]

    class Config:
        from_attributes = True