import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Market from "./pages/Market";
import Watchlist from "./pages/Watchlist";
import AIInsights from "./pages/AIInsights";
import Alerts from "./pages/Alerts";
import Brokers from "./pages/Brokers";
import Settings from "./pages/Settings";
import MainLayout from "./layouts/MainLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="market" element={<Market />} />
          <Route path="watchlist" element={<Watchlist />} />
          <Route path="ai-insights" element={<AIInsights />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="brokers" element={<Brokers />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}