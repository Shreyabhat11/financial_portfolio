from fastapi import APIRouter
from app.services.market_service import (
    get_stock_price, get_index_data, get_stock_history,
    get_top_movers, get_market_news
)

router = APIRouter(prefix="/market", tags=["Market"])

NSE_SYMBOLS = [
    "RELIANCE", "TCS", "INFY", "HDFCBANK", "WIPRO",
    "BAJFINANCE", "TECHM", "TITAN", "HCLTECH", "ITC",
    "LT", "SBIN", "MARUTI", "ADANIENT", "KOTAKBANK",
    "SUNPHARMA", "AXISBANK", "ICICIBANK", "NESTLEIND", "HINDUNILVR"
]

STOCK_NAMES = {
    "RELIANCE": "Reliance Industries", "TCS": "Tata Consultancy Services",
    "INFY": "Infosys Ltd", "HDFCBANK": "HDFC Bank", "WIPRO": "Wipro Ltd",
    "BAJFINANCE": "Bajaj Finance", "TECHM": "Tech Mahindra",
    "TITAN": "Titan Company", "HCLTECH": "HCL Technologies", "ITC": "ITC Ltd",
    "LT": "Larsen & Toubro", "SBIN": "State Bank of India",
    "MARUTI": "Maruti Suzuki", "ADANIENT": "Adani Enterprises",
    "KOTAKBANK": "Kotak Mahindra Bank", "SUNPHARMA": "Sun Pharmaceutical",
    "AXISBANK": "Axis Bank", "ICICIBANK": "ICICI Bank",
    "NESTLEIND": "Nestle India", "HINDUNILVR": "Hindustan Unilever",
}


@router.get("/stock/{symbol}")
def stock_detail(symbol: str):
    data = get_stock_price(symbol.upper())
    if not data:
        return {"symbol": symbol, "price": 0, "error": "Data unavailable"}
    data["name"] = STOCK_NAMES.get(symbol.upper(), symbol.upper())
    return data


@router.get("/stock/{symbol}/history")
def stock_history(symbol: str, period: str = "1mo"):
    """Chart history — period: 1d 5d 1mo 3mo 6mo 1y 2y 5y"""
    valid = {"1d","5d","1mo","3mo","6mo","1y","2y","5y"}
    if period not in valid:
        period = "1mo"
    history = get_stock_history(symbol.upper(), period)
    return {"symbol": symbol.upper(), "period": period, "data": history}


@router.get("/stocks")
def get_all_stocks():
    results = []
    for sym in NSE_SYMBOLS:
        data = get_stock_price(sym)
        if data:
            results.append({
                "symbol": sym,
                "name": STOCK_NAMES.get(sym, sym),
                "price": data["price"],
                "change": data["change_pct"],
                "prevClose": data["prev_close"],
                "volume": data["volume"],
            })
        else:
            results.append({"symbol": sym, "name": STOCK_NAMES.get(sym, sym),
                            "price": 0, "change": 0, "prevClose": 0, "volume": 0})
    return results


@router.get("/trending")
def trending():
    """Return top 8 by volume from live data."""
    stocks = []
    for sym in NSE_SYMBOLS[:12]:
        d = get_stock_price(sym)
        if d:
            stocks.append({"symbol": sym, "name": STOCK_NAMES.get(sym, sym),
                           "price": d["price"], "change": d["change_pct"],
                           "volume": d["volume"]})
    stocks.sort(key=lambda x: abs(x["change"]), reverse=True)
    return {"trending": stocks[:8]}


@router.get("/news")
def market_news():
    return {"news": get_market_news()}


@router.get("/search")
def search_stocks(q: str = ""):
    if not q:
        return []
    q_up = q.upper()
    matches = [
        {"symbol": s, "name": STOCK_NAMES.get(s, s)}
        for s in NSE_SYMBOLS
        if q_up in s or q_up in STOCK_NAMES.get(s, "").upper()
    ]
    return matches


@router.get("/top-movers")
def top_movers():
    return get_top_movers()


@router.get("/indices")
def indices():
    results = {}
    for name, sym in [("nifty50","^NSEI"),("banknifty","^NSEBANK"),("sensex","^BSESN")]:
        d = get_index_data(sym)
        results[name] = d
    return results
