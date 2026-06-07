import asyncio

from fastapi import APIRouter, WebSocket

from app.websocket.manager import manager

from app.services.market_service import (
    get_stock_price
)


router = APIRouter()


@router.websocket("/ws/market")
async def market_websocket(
    websocket: WebSocket
):
    await manager.connect(websocket)

    try:
        while True:
            reliance = get_stock_price("RELIANCE")

            tcs = get_stock_price("TCS")

            data = {
                "RELIANCE": reliance,
                "TCS": tcs
            }

            await manager.send_personal_message(
                data,
                websocket
            )

            await asyncio.sleep(5)

    except Exception:
        manager.disconnect(websocket)