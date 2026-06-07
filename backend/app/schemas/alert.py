from pydantic import BaseModel


class AlertCreate(BaseModel):
    stock_symbol: str
    condition_type: str
    condition_value: float


class AlertResponse(BaseModel):
    id: int
    stock_symbol: str
    condition_type: str
    condition_value: float
    is_active: bool

    class Config:
        from_attributes = True