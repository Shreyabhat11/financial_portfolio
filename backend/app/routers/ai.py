from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.rate_limit import limiter
from app.models.user import User
from app.services.market_service import get_stock_price
from app.services.ai_service import analyze_stock, portfolio_health_analysis
from app.services.portfolio_service import get_user_portfolio, calculate_portfolio_metrics

router = APIRouter(prefix="/ai", tags=["AI"])


def _parse_signal(text: str) -> str:
    t = text.lower()
    # Look for explicit "signal: buy/sell/hold" pattern first
    import re
    m = re.search(r'signal[:\s]+(\w+)', t)
    if m:
        w = m.group(1).upper()
        if w in ("BUY", "SELL", "HOLD"):
            return w
    if "buy" in t[:200]:  return "BUY"
    if "sell" in t[:200]: return "SELL"
    return "HOLD"


@router.get("/analyze/{symbol}")
@limiter.limit("10/minute")
def analyze_stock_api(
    request: Request,   
    symbol: str,
    current_user: User = Depends(get_current_user)
):
    """Full AI analysis for any NSE symbol — used by stock detail modal."""
    sym = symbol.upper()
    market_data = get_stock_price(sym)
    price = market_data["price"] if market_data else 0
    analysis = analyze_stock(sym, price, "Mixed")
    signal = _parse_signal(analysis)
    return {
        "symbol": sym,
        "price": price,
        "signal": signal,
        "analysis": analysis,
    }


@router.get("/recommendations")
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    portfolio = get_user_portfolio(db, current_user.id)
    symbols = []

    if portfolio and portfolio.holdings:
        portfolio = calculate_portfolio_metrics(portfolio)
        symbols = [h.stock_symbol for h in portfolio.holdings]

    if not symbols:
        symbols = ["RELIANCE", "TCS", "INFY", "BAJFINANCE", "TITAN"]

    recommendations = []
    for sym in symbols[:5]:
        data = get_stock_price(sym)
        price = data["price"] if data else 0
        change_pct = data["change_pct"] if data else 0
        try:
            analysis_text = analyze_stock(sym, price, "Mixed")
            signal = _parse_signal(analysis_text)
        except Exception:
            analysis_text = "Analysis temporarily unavailable."
            signal = "HOLD"

        # Extract first meaningful sentence as reason
        sentences = [s.strip() for s in analysis_text.split('\n') if len(s.strip()) > 20]
        reason = sentences[0] if sentences else analysis_text[:120]

        recommendations.append({
            "symbol": sym,
            "name": sym,
            "signal": signal,
            "confidence": 75 if signal == "HOLD" else 82,
            "reason": reason,
            "fullAnalysis": analysis_text,
            "target": round(price * 1.1, 2),
            "current": price,
            "change": change_pct,
            "upside": 10.0 if signal == "BUY" else (-5.0 if signal == "SELL" else 2.0),
        })

    return recommendations


@router.get("/risk-analysis")
def get_risk_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    portfolio = get_user_portfolio(db, current_user.id)
    summary = "Empty portfolio — no holdings yet."
    if portfolio and portfolio.holdings:
        portfolio = calculate_portfolio_metrics(portfolio)
        holdings_str = ", ".join(
            f"{h.stock_symbol}({h.quantity}@{h.average_price})"
            for h in portfolio.holdings
        )
        summary = (
            f"Total value: ₹{portfolio.total_value}, "
            f"Total profit: ₹{portfolio.total_profit}, "
            f"Holdings: {holdings_str}"
        )
    try:
        analysis = portfolio_health_analysis(summary)
    except Exception:
        analysis = "Risk analysis temporarily unavailable."

    return {
        "analysis": analysis,
        "riskMetrics": [
            {"subject": "Diversification", "A": 78},
            {"subject": "Liquidity", "A": 85},
            {"subject": "Volatility", "A": 62},
            {"subject": "Sector Exp.", "A": 55},
            {"subject": "Quality", "A": 88},
            {"subject": "Momentum", "A": 74},
        ],
    }


@router.get("/sentiment")
def get_sentiment(current_user: User = Depends(get_current_user)):
    return [
        {"sector": "IT",      "sentiment": "bearish", "score": -0.3},
        {"sector": "Banking", "sentiment": "bullish", "score": 0.65},
        {"sector": "Energy",  "sentiment": "bullish", "score": 0.48},
        {"sector": "FMCG",   "sentiment": "neutral",  "score": 0.05},
        {"sector": "Pharma",  "sentiment": "neutral",  "score": 0.12},
        {"sector": "Auto",    "sentiment": "bullish",  "score": 0.55},
    ]
