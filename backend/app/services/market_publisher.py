from app.core.redis import redis_client
import json

def publish_market_update(data: dict):
    redis_client.publish("market_channel", json.dumps(data))