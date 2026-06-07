# AI Investment Platform — Backend

FastAPI backend with PostgreSQL, yFinance market data, and Google Gemini AI.

## Setup

```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install fastapi uvicorn sqlalchemy psycopg2-binary alembic \
    python-jose passlib bcrypt python-multipart pydantic pydantic-settings \
    pydantic[email] yfinance google-generativeai kiteconnect

# 3. Configure environment
# Edit .env with your DB credentials, Google API key, Zerodha keys

# 4. Run database migrations
alembic upgrade head

# 5. Start server
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

### Auth
- `POST /auth/register` — `{name, email, password}` → UserResponse
- `POST /auth/login` — `{email, password}` → `{accessToken, token_type, user}`
- `POST /auth/logout` → message
- `GET  /auth/me` — requires Bearer token

### Dashboard
- `GET /dashboard/summary` — portfolio summary stats
- `GET /dashboard/market-overview` — NIFTY50, BANKNIFTY, SENSEX
- `GET /dashboard/top-movers` — gainers/losers

### Portfolio
- `GET  /portfolio/` — full portfolio with metrics
- `GET  /portfolio/holdings` — holdings list (mapped for frontend)
- `GET  /portfolio/performance` — 12-month chart data
- `POST /portfolio/add-holding` — `{stock_symbol, quantity, average_price}`

### Market
- `GET /market/stocks` — all NSE stocks
- `GET /market/stock/{symbol}` — single stock price
- `GET /market/trending` — trending symbols
- `GET /market/news` — market news
- `GET /market/search?q=` — search stocks
- `GET /market/nifty50` / `/banknifty`

### Watchlist
- `GET    /watchlist/` — user watchlist with prices
- `POST   /watchlist/add` — `{stock_symbol}`
- `DELETE /watchlist/remove/{id}` or `/watchlist/{id}`

### Alerts
- `GET    /alerts/` — user alerts
- `POST   /alerts/create` — `{stock_symbol, condition_type, condition_value}`
- `DELETE /alerts/{id}`
- `PUT    /alerts/{id}`

### AI (requires Bearer token)
- `GET /ai/analyze/{symbol}` — Gemini analysis for a stock
- `GET /ai/recommendations` — portfolio buy/sell recs
- `GET /ai/risk-analysis` — portfolio risk metrics
- `GET /ai/sentiment` — sector sentiment

### Brokers
- `GET    /brokers/` — connected brokers
- `POST   /brokers/connect` — `{broker_name, api_key, api_secret}`
- `DELETE /brokers/{id}`
- `GET    /broker/zerodha/login` — OAuth URL
- `GET    /broker/zerodha/callback?request_token=`

### Settings
- `GET /settings/profile`
- `PUT /settings/profile` — `{name, email}`
- `PUT /settings/password` — `{current_password, new_password}`
- `GET /settings/notifications`

## Notes
- Login returns `accessToken` (camelCase) — frontend stores this in localStorage
- All protected routes require `Authorization: Bearer <accessToken>`
- yFinance appends `.NS` for NSE stocks automatically
- Gemini AI key is in `.env` as `GOOGLE_API_KEY`
