from abc import ABC, abstractmethod


class BrokerBase(ABC):

    @abstractmethod
    def get_login_url(self):
        pass

    @abstractmethod
    def generate_session(
        self,
        request_token: str
    ):
        pass

    @abstractmethod
    def get_holdings(self):
        pass