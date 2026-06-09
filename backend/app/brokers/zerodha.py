from kiteconnect import KiteConnect

from app.core.config import settings
from app.brokers.base import BrokerBase


class ZerodhaBroker(BrokerBase):

    EXCHANGE = "NSE"
    PRODUCT  = "CNC"   # Cash and Carry (delivery)

    def __init__(self, access_token: str = None):
        self.kite = KiteConnect(api_key=settings.ZERODHA_API_KEY)
        if access_token:
            self.kite.set_access_token(access_token)

    def get_login_url(self) -> str:
        return self.kite.login_url()

    def generate_session(self, request_token: str) -> dict:
        data = self.kite.generate_session(
            request_token,
            api_secret=settings.ZERODHA_API_SECRET
        )
        self.kite.set_access_token(data["access_token"])
        return data

    def set_access_token(self, access_token: str):
        self.kite.set_access_token(access_token)

    def get_holdings(self) -> list:
        raw = self.kite.holdings()
        return [
            {
                "symbol": h["tradingsymbol"],
                "qty": h["quantity"],
                "avg_price": h["average_price"],
                "current_price": h["last_price"],
                "pnl": h["pnl"],
                "day_change": h.get("day_change", 0),
                "day_change_pct": h.get("day_change_percentage", 0),
            }
            for h in raw
        ]

    def get_positions(self) -> list:
        raw = self.kite.positions()
        day = raw.get("day", [])
        return [
            {
                "symbol": p["tradingsymbol"],
                "qty": p["quantity"],
                "avg_price": p["average_price"],
                "current_price": p["last_price"],
                "pnl": p["pnl"],
                "product": p["product"],
            }
            for p in day
        ]

    def place_order(self, symbol: str, qty: int, side: str,
                    order_type: str = "MARKET", price: float = 0) -> dict:
        """
        side: BUY or SELL
        order_type: MARKET or LIMIT
        """
        transaction = (
            self.kite.TRANSACTION_TYPE_BUY
            if side.upper() == "BUY"
            else self.kite.TRANSACTION_TYPE_SELL
        )
        kite_order_type = (
            self.kite.ORDER_TYPE_MARKET
            if order_type.upper() == "MARKET"
            else self.kite.ORDER_TYPE_LIMIT
        )
        kwargs = dict(
            tradingsymbol=symbol,
            exchange=self.EXCHANGE,
            transaction_type=transaction,
            quantity=qty,
            order_type=kite_order_type,
            product=self.PRODUCT,
            variety=self.kite.VARIETY_REGULAR,
        )
        if order_type.upper() == "LIMIT" and price:
            kwargs["price"] = price

        order_id = self.kite.place_order(**kwargs)
        return {"order_id": str(order_id), "broker": "zerodha", "status": "placed"}

    def cancel_order(self, order_id: str) -> dict:
        self.kite.cancel_order(
            variety=self.kite.VARIETY_REGULAR,
            order_id=order_id
        )
        return {"order_id": order_id, "status": "cancelled"}

    def get_order_status(self, order_id: str) -> dict:
        orders = self.kite.orders()
        for o in orders:
            if str(o["order_id"]) == str(order_id):
                return {
                    "order_id": order_id,
                    "status": o["status"],
                    "filled_qty": o.get("filled_quantity", 0),
                    "price": o.get("average_price", 0),
                }
        return {"order_id": order_id, "status": "not_found"}

    def get_funds(self) -> dict:
        margins = self.kite.margins()
        equity = margins.get("equity", {})
        return {
            "available_cash": equity.get("available", {}).get("live_balance", 0),
            "used_margin": equity.get("utilised", {}).get("debits", 0),
            "total_balance": equity.get("net", 0),
        }
