from abc import ABC, abstractmethod


class BrokerBase(ABC):

    @abstractmethod
    def get_login_url(self) -> str:
        pass

    @abstractmethod
    def generate_session(self, request_token: str) -> dict:
        pass

    @abstractmethod
    def get_holdings(self) -> list:
        pass

    @abstractmethod
    def get_positions(self) -> list:
        pass

    @abstractmethod
    def place_order(self, symbol: str, qty: int, side: str,
                    order_type: str = "MARKET", price: float = 0) -> dict:
        pass

    @abstractmethod
    def cancel_order(self, order_id: str) -> dict:
        pass

    @abstractmethod
    def get_order_status(self, order_id: str) -> dict:
        pass

    @abstractmethod
    def get_funds(self) -> dict:
        pass
