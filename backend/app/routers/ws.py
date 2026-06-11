from fastapi import APIRouter, WebSocket
from app.core.redis import redis_client
import json

router = APIRouter()

@router.websocket("/ws/market")
async def market_ws(websocket: WebSocket):
    await websocket.accept()

    pubsub = redis_client.pubsub()
    pubsub.subscribe("market_channel")

    try:
        for message in pubsub.listen():
            if message["type"] == "message":
                await websocket.send_text(message["data"])
    except Exception as e:
        print("WS error:", e)