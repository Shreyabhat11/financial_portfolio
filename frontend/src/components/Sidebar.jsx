import { NavLink } from "react-router-dom";
import {
  FaChartPie,
  FaWallet,
  FaChartLine,
  FaEye,
  FaRobot,
  FaBell,
  FaBuilding,
  FaCog,
} from "react-icons/fa";

const menu = [
  { name: "Dashboard", path: "/", icon: <FaChartPie /> },
  { name: "Portfolio", path: "/portfolio", icon: <FaWallet /> },
  { name: "Market", path: "/market", icon: <FaChartLine /> },
  { name: "Watchlist", path: "/watchlist", icon: <FaEye /> },
  { name: "AI Insights", path: "/ai-insights", icon: <FaRobot /> },
  { name: "Alerts", path: "/alerts", icon: <FaBell /> },
  { name: "Brokers", path: "/brokers", icon: <FaBuilding /> },
  { name: "Settings", path: "/settings", icon: <FaCog /> },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-[#343b46] border-r-4 border-cyan-500 min-h-screen">
      <div className="text-center py-10">
        <h1 className="text-3xl text-cyan-400 font-bold">
          Investment Portfolio
        </h1>
      </div>

      <div className="space-y-2 px-3">
        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-4 rounded-lg transition ${
                isActive
                  ? "bg-[#1d5b63] text-white"
                  : "text-gray-200 hover:bg-[#425060]"
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
}