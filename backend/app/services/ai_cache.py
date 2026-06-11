import json
from app.core.redis import redis_client


def get_cached_ai_response(key: str):
    data = redis_client.get(key)
    if data:
        return json.loads(data)
    return None


def set_cached_ai_response(key: str, value: dict, ttl: int = 3600):
    redis_client.setex(
        key,
        ttl,
        json.dumps(value)
    )