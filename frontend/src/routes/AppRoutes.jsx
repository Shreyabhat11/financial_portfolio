import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import DashboardLayout from '../layouts/DashboardLayout'

// Landing
import Landing from '../pages/landing/Landing'

// Auth pages
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import ForgotPassword from '../pages/auth/ForgotPassword'
import ResetPassword from '../pages/auth/ResetPassword'

// App pages
import Dashboard from '../pages/dashboard/Dashboard'
import Portfolio from '../pages/portfolio/Portfolio'
import Market from '../pages/market/Market'
import Watchlist from '../pages/watchlist/Watchlist'
import AIInsights from '../pages/ai/AIInsights'
import Alerts from '../pages/alerts/Alerts'
import Brokers from '../pages/brokers/Brokers'
import Settings from '../pages/settings/Settings'

const AppRoutes = () => (
  <Routes>
    {/* Public landing */}
    <Route path="/" element={<Landing />} />

    {/* Auth routes */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />

    {/* Protected dashboard routes */}
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    }>
      <Route index element={<Dashboard />} />
    </Route>

    <Route path="/" element={
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    }>
      <Route path="portfolio" element={<Portfolio />} />
      <Route path="market" element={<Market />} />
      <Route path="watchlist" element={<Watchlist />} />
      <Route path="ai-insights" element={<AIInsights />} />
      <Route path="alerts" element={<Alerts />} />
      <Route path="brokers" element={<Brokers />} />
      <Route path="settings" element={<Settings />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

export default AppRoutes
