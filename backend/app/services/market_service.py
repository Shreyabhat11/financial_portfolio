import yfinance as yf
from datetime import datetime, timedelta


# ── Stock price ───────────────────────────────────────────────────────────────
def get_stock_price(symbol: str):
    try:
        ticker = yf.Ticker(f"{symbol}.NS")
        data = ticker.history(period="2d")
        if data.empty:
            return None
        current = float(data["Close"].iloc[-1])
        prev = float(data["Close"].iloc[-2]) if len(data) >= 2 else current
        change = round(current - prev, 2)
        change_pct = round((change / prev) * 100, 2) if prev else 0
        volume = int(data["Volume"].iloc[-1]) if "Volume" in data.columns else 0
        return {
            "symbol": symbol,
            "price": round(current, 2),
            "prev_close": round(prev, 2),
            "change": change,
            "change_pct": change_pct,
            "volume": volume,
        }
    except Exception:
        return None


# ── Stock history ─────────────────────────────────────────────────────────────
def get_stock_history(symbol: str, period: str = "1mo"):
    try:
        ticker = yf.Ticker(f"{symbol}.NS")
        data = ticker.history(period=period)
        if data.empty:
            return []
        return [
            {
                "date": str(idx.date()),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"]),
            }
            for idx, row in data.iterrows()
        ]
    except Exception:
        return []


# ── Index data ────────────────────────────────────────────────────────────────
def get_index_data(symbol: str):
    try:
        ticker = yf.Ticker(symbol)
        data = ticker.history(period="2d")
        if data.empty:
            return None
        current = float(data["Close"].iloc[-1])
        prev = float(data["Close"].iloc[-2]) if len(data) >= 2 else current
        change = round(current - prev, 2)
        change_pct = round((change / prev) * 100, 2) if prev else 0
        return {
            "symbol": symbol,
            "price": round(current, 2),
            "prev_close": round(prev, 2),
            "change": change,
            "change_pct": change_pct,
        }
    except Exception:
        return None


# ── Top movers ────────────────────────────────────────────────────────────────
def get_top_movers():
    UNIVERSE = [
        "RELIANCE", "TCS", "INFY", "HDFCBANK", "WIPRO",
        "BAJFINANCE", "TECHM", "TITAN", "HCLTECH", "ITC",
        "LT", "SBIN", "MARUTI", "ADANIENT", "KOTAKBANK",
        "SUNPHARMA", "AXISBANK", "ICICIBANK", "NESTLEIND", "HINDUNILVR",
    ]
    results = [d for sym in UNIVERSE if (d := get_stock_price(sym))]
    results.sort(key=lambda x: x["change_pct"], reverse=True)
    gainers = [{"symbol": r["symbol"], "price": r["price"], "change": r["change_pct"]} for r in results[:5]]
    losers  = [{"symbol": r["symbol"], "price": r["price"], "change": r["change_pct"]} for r in results[-5:]]
    return {"gainers": gainers, "losers": losers}


# ── News parsing ──────────────────────────────────────────────────────────────
def _time_ago(ts_or_str):
    """Convert a unix timestamp or ISO string to '2h ago' format."""
    try:
        if isinstance(ts_or_str, (int, float)):
            delta = datetime.now() - datetime.fromtimestamp(ts_or_str)
        else:
            dt = datetime.fromisoformat(str(ts_or_str).replace("Z", "+00:00"))
            if dt.tzinfo:
                from datetime import timezone
                delta = datetime.now(timezone.utc) - dt
            else:
                delta = datetime.now() - dt
        total_seconds = int(delta.total_seconds())
        if total_seconds < 60:
            return "just now"
        if total_seconds < 3600:
            return f"{total_seconds // 60}m ago"
        if total_seconds < 86400:
            return f"{total_seconds // 3600}h ago"
        return f"{delta.days}d ago"
    except Exception:
        return "recently"


def _sentiment(text: str) -> str:
    t = text.lower()
    pos = ["surge", "gain", "rise", "rally", "up", "high", "bull", "positive",
           "record", "jump", "climb", "strong", "beat", "profit", "growth"]
    neg = ["fall", "drop", "decline", "loss", "down", "bear", "low", "concern",
           "weak", "miss", "loss", "crash", "plunge", "fear", "risk", "cut"]
    if any(w in t for w in pos):
        return "positive"
    if any(w in t for w in neg):
        return "negative"
    return "neutral"


def _parse_news_item(item: dict):
    """
    Handles BOTH yfinance news formats:

    NEW format (tickerStream):
        item = {"content": {"title": "...", "pubDate": "...",
                            "provider": {"displayName": "..."},
                            "clickThroughUrl": {"url": "..."}}}

    OLD format (flat):
        item = {"title": "...", "publisher": "...",
                "providerPublishTime": 1234567890, "link": "..."}
    """
    content = item.get("content") or {}

    if content:
        # ── NEW format ────────────────────────────────────────────
        title   = (content.get("title") or content.get("headline") or "").strip()
        # source
        provider = content.get("provider") or {}
        source  = provider.get("displayName") or provider.get("name") or "Market News"
        # url
        ctu = content.get("clickThroughUrl") or {}
        url = (ctu.get("url") if isinstance(ctu, dict) else "") or ""
        if not url:
            cu = content.get("canonicalUrl") or {}
            url = (cu.get("url") if isinstance(cu, dict) else "") or ""
        # time
        pub = content.get("pubDate") or content.get("displayTime") or ""
        time_str = _time_ago(pub) if pub else "recently"
    else:
        # ── OLD format ────────────────────────────────────────────
        title    = (item.get("title") or "").strip()
        source   = item.get("publisher") or "Market News"
        url      = item.get("link") or ""
        ts       = item.get("providerPublishTime")
        time_str = _time_ago(ts) if ts else "recently"

    return title, source, time_str, url


def get_market_news():
    """
    Fetch real Indian market news via yfinance's new tickerStream API.
    Falls back gracefully through multiple tickers.
    """
    seen_titles = set()
    news = []

    # Try NSE index + top stocks so we get diverse news
    tickers_to_try = ["^NSEI", "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS"]

    for sym in tickers_to_try:
        if len(news) >= 10:
            break
        try:
            t = yf.Ticker(sym)
            # Use the new get_news() method
            raw_items = t.get_news(count=8, tab="news") or []

            for item in raw_items:
                if len(news) >= 10:
                    break

                title, source, time_str, url = _parse_news_item(item)

                # Skip empty or duplicate headlines
                if not title or title in seen_titles:
                    continue
                seen_titles.add(title)

                news.append({
                    "id": len(news) + 1,
                    "headline": title,
                    "source": source,
                    "time": time_str,
                    "sentiment": _sentiment(title),
                    "url": url,
                })
        except Exception:
            continue

    return news if news else _fallback_news()


def _fallback_news():
    """Static fallback when all live sources fail."""
    return [
        {"id": 1, "headline": "Markets open higher; Nifty approaches key resistance level",
         "source": "Market Desk", "time": "1h ago", "sentiment": "positive", "url": ""},
        {"id": 2, "headline": "FII activity closely watched amid global dollar strength",
         "source": "Market Desk", "time": "2h ago", "sentiment": "neutral", "url": ""},
        {"id": 3, "headline": "IT stocks under pressure on weak demand outlook from US clients",
         "source": "Market Desk", "time": "3h ago", "sentiment": "negative", "url": ""},
        {"id": 4, "headline": "RBI policy decision awaited; rates expected to remain unchanged",
         "source": "Market Desk", "time": "4h ago", "sentiment": "neutral", "url": ""},
        {"id": 5, "headline": "Banking sector outperforms; HDFC Bank leads gains",
         "source": "Market Desk", "time": "5h ago", "sentiment": "positive", "url": ""},
    ]