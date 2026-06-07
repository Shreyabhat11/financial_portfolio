from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.auth import router as auth_router
from app.routers.portfolio import router as portfolio_router
from app.routers.market import router as market_router
from app.routers.watchlist import router as watchlist_router
from app.routers.alert import router as alert_router
from app.routers.ai import router as ai_router
from app.routers.broker import router as broker_router
from app.routers.dashboard import router as dashboard_router
from app.routers.settings import router as settings_router
from app.websocket.market_ws import router as websocket_router

app = FastAPI(
    title="AI Investment Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Allow ALL localhost ports so the frontend works regardless of Vite port
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(portfolio_router)
app.include_router(market_router)
app.include_router(watchlist_router)
app.include_router(alert_router)
app.include_router(websocket_router)
app.include_router(ai_router)
app.include_router(broker_router)
app.include_router(dashboard_router)
app.include_router(settings_router)

@app.get("/")
def home():
    return {"message": "AI Investment Platform API Running", "version": "1.0.0"}
