"""
Upstox V2 API broker implementation.
pip install upstox-python-sdk
"""
import requests
from app.brokers.base import BrokerBase
from app.core.config import settings


UPSTOX_BASE = "https://api.upstox.com/v2"


class UpstoxBroker(BrokerBase):

    def __init__(self, access_token: str = None):
        self.access_token = access_token

    def _headers(self):
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    def get_login_url(self) -> str:
        client_id = getattr(settings, "UPSTOX_API_KEY", "")
        redirect = getattr(settings, "UPSTOX_REDIRECT_URI", "http://localhost:8000/brokers/upstox/callback")
        return (
            f"https://api.upstox.com/v2/login/authorization/dialog"
            f"?response_type=code&client_id={client_id}&redirect_uri={redirect}"
        )

    def generate_session(self, code: str) -> dict:
        client_id     = getattr(settings, "UPSTOX_API_KEY", "")
        client_secret = getattr(settings, "UPSTOX_API_SECRET", "")
        redirect      = getattr(settings, "UPSTOX_REDIRECT_URI", "http://localhost:8000/brokers/upstox/callback")
        r = requests.post(f"{UPSTOX_BASE}/login/authorization/token", data={
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect,
            "grant_type": "authorization_code",
        })
        r.raise_for_status()
        data = r.json()
        self.access_token = data.get("access_token", "")
        return {"access_token": self.access_token, "user_id": data.get("user_id", "")}

    def get_holdings(self) -> list:
        r = requests.get(f"{UPSTOX_BASE}/portfolio/long-term-holdings", headers=self._headers())
        r.raise_for_status()
        items = r.json().get("data", [])
        return [
            {
                "symbol": h["tradingsymbol"],
                "qty": h["quantity"],
                "avg_price": h["average_price"],
                "current_price": h["last_price"],
                "pnl": h["pnl"],
            }
            for h in items
        ]

    def get_positions(self) -> list:
        r = requests.get(f"{UPSTOX_BASE}/portfolio/short-term-positions", headers=self._headers())
        r.raise_for_status()
        items = r.json().get("data", [])
        return [
            {
                "symbol": h["tradingsymbol"],
                "qty": h["quantity"],
                "avg_price": h["average_price"],
                "current_price": h["last_price"],
                "pnl": h["pnl"],
            }
            for h in items
        ]

    def place_order(self, symbol: str, qty: int, side: str,
                    order_type: str = "MARKET", price: float = 0) -> dict:
        payload = {
            "quantity": qty,
            "product": "D",          # Delivery
            "validity": "DAY",
            "price": price if order_type == "LIMIT" else 0,
            "tag": "InvestAI",
            "instrument_token": f"NSE_EQ|{symbol}",
            "order_type": order_type.upper(),
            "transaction_type": side.upper(),
            "disclosed_quantity": 0,
            "trigger_price": 0,
            "is_amo": False,
        }
        r = requests.post(f"{UPSTOX_BASE}/order/place", json=payload, headers=self._headers())
        r.raise_for_status()
        data = r.json().get("data", {})
        return {"order_id": data.get("order_id", ""), "broker": "upstox", "status": "placed"}

    def cancel_order(self, order_id: str) -> dict:
        r = requests.delete(f"{UPSTOX_BASE}/order/cancel?order_id={order_id}", headers=self._headers())
        r.raise_for_status()
        return {"order_id": order_id, "status": "cancelled"}

    def get_order_status(self, order_id: str) -> dict:
        r = requests.get(f"{UPSTOX_BASE}/order/details?order_id={order_id}", headers=self._headers())
        r.raise_for_status()
        d = r.json().get("data", {})
        return {
            "order_id": order_id,
            "status": d.get("status", "unknown"),
            "filled_qty": d.get("filled_quantity", 0),
            "price": d.get("average_price", 0),
        }

    def get_funds(self) -> dict:
        r = requests.get(f"{UPSTOX_BASE}/user/get-funds-and-margin?segment=SEC", headers=self._headers())
        r.raise_for_status()
        d = r.json().get("data", {})
        return {
            "available_cash": d.get("available_margin", 0),
            "used_margin": d.get("used_margin", 0),
            "total_balance": d.get("equity", {}).get("net_margin", 0),
        }
