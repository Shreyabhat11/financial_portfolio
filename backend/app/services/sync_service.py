"""
Broker sync service.

Responsibilities:
  - Pull live holdings from every connected broker for a user
  - Upsert them into the holdings table (broker-sourced rows)
  - Refresh current prices on all holdings (broker + manual)
  - Recompute portfolio totals

Called:
  - On demand  : POST /portfolio/sync
  - Background : APScheduler every 5 minutes during market hours
  - On login   : triggered from auth flow
"""
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.portfolio import Portfolio
from app.models.holding import Holding
from app.models.broker_account import BrokerAccount
from app.services.market_service import get_stock_price
from app.brokers.registry import get_broker_instance


# ── helpers ───────────────────────────────────────────────────────────────────

def _is_market_open() -> bool:
    """True during NSE trading hours Mon–Fri 09:15–15:30 IST (UTC+5:30)."""
    from datetime import timedelta
    now_ist = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
    if now_ist.weekday() >= 5:          # Saturday / Sunday
        return False
    market_open  = now_ist.replace(hour=9,  minute=15, second=0, microsecond=0)
    market_close = now_ist.replace(hour=15, minute=30, second=0, microsecond=0)
    return market_open <= now_ist <= market_close


def _get_or_create_portfolio(db: Session, user_id: int) -> Portfolio:
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == user_id).first()
    if not portfolio:
        portfolio = Portfolio(user_id=user_id)
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)
    return portfolio


# ── price refresh ─────────────────────────────────────────────────────────────

def refresh_prices(db: Session, portfolio: Portfolio) -> Portfolio:
    """Update current_price, profit_loss, day_change for every holding."""
    total_value = 0.0
    total_profit = 0.0

    for holding in portfolio.holdings:
        market = get_stock_price(holding.stock_symbol)
        if market:
            cmp = market["price"]
            holding.current_price  = cmp
            holding.day_change     = market.get("change", 0)
            holding.day_change_pct = market.get("change_pct", 0)
            invested = holding.quantity * holding.average_price
            pnl      = holding.quantity * cmp - invested
            holding.profit_loss = round(pnl, 2)
            total_value  += holding.quantity * cmp
            total_profit += pnl

    portfolio.total_value  = round(total_value, 2)
    portfolio.total_profit = round(total_profit, 2)
    db.commit()
    return portfolio


# ── broker holdings sync ──────────────────────────────────────────────────────

def sync_broker_holdings(db: Session, broker_account: BrokerAccount, portfolio: Portfolio) -> dict:
    """
    Pull live holdings from one broker and upsert into DB.
    Returns {"synced": N, "removed": M, "error": None|str}
    """
    try:
        broker = get_broker_instance(broker_account.broker_name, broker_account.access_token)
        live_holdings = broker.get_holdings()   # list of dicts
    except Exception as e:
        err = str(e)
        broker_account.sync_error = err
        broker_account.last_synced_at = datetime.now(timezone.utc)
        db.commit()
        return {"synced": 0, "removed": 0, "error": err}

    # Index existing broker-sourced holdings for this account
    existing: dict[str, Holding] = {
        h.stock_symbol: h
        for h in portfolio.holdings
        if h.broker_account_id == broker_account.id
    }

    live_symbols = set()
    synced = 0

    for item in live_holdings:
        symbol  = item["symbol"].upper()
        qty     = float(item.get("qty", item.get("quantity", 0)))
        avg     = float(item.get("avg_price", item.get("average_price", 0)))
        cmp     = float(item.get("current_price", item.get("last_price", avg)))
        pnl     = float(item.get("pnl", 0))
        day_chg = float(item.get("day_change", 0))
        day_pct = float(item.get("day_change_pct", 0))

        if qty <= 0:
            continue   # skip fully exited positions

        live_symbols.add(symbol)

        if symbol in existing:
            # Update existing
            h = existing[symbol]
            h.quantity      = qty
            h.average_price = avg
            h.current_price = cmp
            h.profit_loss   = pnl
            h.day_change    = day_chg
            h.day_change_pct= day_pct
            h.last_synced_at= datetime.now(timezone.utc)
        else:
            # Insert new
            h = Holding(
                portfolio_id      = portfolio.id,
                broker_account_id = broker_account.id,
                stock_symbol      = symbol,
                quantity          = qty,
                average_price     = avg,
                current_price     = cmp,
                profit_loss       = pnl,
                day_change        = day_chg,
                day_change_pct    = day_pct,
                source            = "broker",
                last_synced_at    = datetime.now(timezone.utc),
            )
            db.add(h)
        synced += 1

    # Remove broker holdings that no longer exist at the broker
    # (stock was sold completely)
    removed = 0
    for sym, h in existing.items():
        if sym not in live_symbols:
            db.delete(h)
            removed += 1

    # Mark broker as synced
    broker_account.sync_error    = None
    broker_account.last_synced_at = datetime.now(timezone.utc)

    db.commit()
    return {"synced": synced, "removed": removed, "error": None}


# ── full user sync ────────────────────────────────────────────────────────────

def sync_all_brokers_for_user(db: Session, user_id: int) -> dict:
    """
    Sync holdings from ALL connected brokers for a user,
    then refresh live prices on everything.
    Returns summary dict.
    """
    portfolio = _get_or_create_portfolio(db, user_id)

    accounts = db.query(BrokerAccount).filter(
        BrokerAccount.user_id == user_id,
        BrokerAccount.auto_sync_enabled == True,
        BrokerAccount.access_token.isnot(None),
    ).all()

    results = []
    for acct in accounts:
        result = sync_broker_holdings(db, acct, portfolio)
        result["broker"] = acct.broker_name
        results.append(result)

    # Refresh live prices for all holdings (broker + manual)
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == user_id).first()
    refresh_prices(db, portfolio)

    return {
        "user_id": user_id,
        "brokers_synced": len(accounts),
        "results": results,
        "last_sync": datetime.now(timezone.utc).isoformat(),
    }


# ── background scheduler ──────────────────────────────────────────────────────

def start_background_sync(app):
    """
    Attach APScheduler to the FastAPI app.
    Syncs all users every 5 min during market hours,
    and does a price refresh every 1 min during market hours.
    """
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        from apscheduler.triggers.interval import IntervalTrigger
        from app.core.database import SessionLocal
    except ImportError:
        print("⚠️  apscheduler not installed — background sync disabled. Run: pip install apscheduler")
        return

    scheduler = BackgroundScheduler(timezone="Asia/Kolkata")

    def _sync_job():
        if not _is_market_open():
            return
        db = SessionLocal()
        try:
            from app.models.broker_account import BrokerAccount as BA
            # Get distinct user_ids that have connected brokers
            user_ids = [row[0] for row in db.query(BA.user_id).distinct().all()]
            for uid in user_ids:
                try:
                    sync_all_brokers_for_user(db, uid)
                except Exception as e:
                    print(f"Sync error for user {uid}: {e}")
        finally:
            db.close()

    def _price_refresh_job():
        if not _is_market_open():
            return
        db = SessionLocal()
        try:
            portfolios = db.query(Portfolio).all()
            for p in portfolios:
                try:
                    refresh_prices(db, p)
                except Exception:
                    pass
        finally:
            db.close()

    # Full broker sync every 5 minutes
    scheduler.add_job(_sync_job, IntervalTrigger(minutes=5), id="broker_sync",
                      replace_existing=True, max_instances=1)

    # Price refresh every 1 minute
    scheduler.add_job(_price_refresh_job, IntervalTrigger(minutes=1), id="price_refresh",
                      replace_existing=True, max_instances=1)

    scheduler.start()
    print("✅ Background sync scheduler started (broker sync: 5min, price refresh: 1min)")

    # Graceful shutdown
    import atexit
    atexit.register(scheduler.shutdown)
