from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey
)

from app.core.database import Base


class BrokerAccount(Base):
    __tablename__ = "broker_accounts"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    broker_name = Column(String)

    access_token = Column(String)

    broker_user_id = Column(String)