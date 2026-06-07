from kiteconnect import KiteConnect

from app.core.config import settings

from app.brokers.base import BrokerBase


class ZerodhaBroker(BrokerBase):

    def __init__(self):
        self.kite = KiteConnect(
            api_key=settings.ZERODHA_API_KEY
        )

    def get_login_url(self):
        return self.kite.login_url()

    def generate_session(
        self,
        request_token: str
    ):
        data = self.kite.generate_session(
            request_token,
            api_secret=settings.ZERODHA_API_SECRET
        )

        self.kite.set_access_token(
            data["access_token"]
        )

        return data

    def set_access_token(
        self,
        access_token: str
    ):
        self.kite.set_access_token(
            access_token
        )

    def get_holdings(self):
        return self.kite.holdings()