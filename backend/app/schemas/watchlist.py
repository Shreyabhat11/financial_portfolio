from pydantic import BaseModel


class WatchlistCreate(BaseModel):
    stock_symbol: str


class WatchlistResponse(BaseModel):
    id: int
    stock_symbol: str

    class Config:
        from_attributes = True