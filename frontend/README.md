# InvestAI — Frontend

Premium dark finance dashboard for AI-powered Investment Portfolio Management.

## Tech Stack

- **React 18** + **Vite 5**
- **TailwindCSS 3** — custom dark finance theme
- **React Router DOM 6** — protected routing
- **Axios** — API client with JWT interceptors + refresh token
- **Recharts** — portfolio/market charts
- **Framer Motion** — smooth animations
- **React Icons** — icon set
- **React Hot Toast** — notifications

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit VITE_API_BASE_URL to point to your backend

# 3. Start development server
npm run dev
```

Open http://localhost:3000

## Project Structure

```
src/
├── api/
│   └── axios.js              # Axios instance + JWT interceptors
├── components/
│   ├── cards/                # MarketIndexCard, StatCard
│   ├── charts/               # PortfolioChart, AllocationPieChart, PnLBarChart
│   ├── layout/               # Sidebar, Navbar
│   ├── tables/               # HoldingsTable
│   └── ui/                   # Button, Modal, Skeleton, EmptyState
├── context/
│   └── AuthContext.jsx       # Auth state + login/logout
├── hooks/
│   └── useApi.js             # Generic API fetching hook
├── layouts/
│   └── DashboardLayout.jsx   # Collapsible sidebar layout
├── pages/
│   ├── auth/                 # Login, Register, Forgot/Reset Password
│   ├── dashboard/            # Main dashboard
│   ├── portfolio/            # Holdings, charts, metrics
│   ├── market/               # Live stocks, news
│   ├── watchlist/            # Add/remove/track stocks
│   ├── ai/                   # AI recommendations, risk, sentiment
│   ├── alerts/               # Price alerts CRUD
│   ├── brokers/              # Connect brokers
│   └── settings/             # Profile, security, notifications
├── routes/
│   ├── AppRoutes.jsx         # Route definitions
│   └── ProtectedRoute.jsx    # JWT guard
├── services/
│   ├── authService.js        # Login, register, logout, refresh
│   └── apiServices.js        # All other API endpoints
└── utils/
    └── helpers.js            # Format currency, dates, colors
```

## Authentication Flow

1. User submits login → `authService.login()` → stores `accessToken` + `refreshToken` in localStorage
2. All requests attach token via Axios request interceptor
3. On 401, response interceptor auto-refreshes token
4. On refresh failure → redirect to `/login`
5. `ProtectedRoute` guards all dashboard routes

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## API Integration

All pages use the `useApi` hook for data fetching:

```js
const { data, loading, error, execute } = useApi(portfolioService.getHoldings)
```

Pages fall back to mock data automatically if the backend is unavailable, making development easy without a running backend.

## Build for Production

```bash
npm run build
npm run preview
```
