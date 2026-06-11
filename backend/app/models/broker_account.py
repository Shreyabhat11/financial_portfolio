from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class BrokerAccount(Base):
    __tablename__ = "broker_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    broker_name = Column(String, nullable=False)
    access_token = Column(String, nullable=True)
    broker_user_id = Column(String, nullable=True)

    # Auto-sync settings
    auto_sync_enabled = Column(Boolean, default=True)
    last_synced_at = Column(DateTime(timezone=True), nullable=True)
    sync_error = Column(String, nullable=True)   # last error message if sync failed

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="broker_accounts")
