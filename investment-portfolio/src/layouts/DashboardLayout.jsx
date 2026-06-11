import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from '../components/layout/Sidebar'
import Navbar from '../components/layout/Navbar'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/portfolio': 'Portfolio',
  '/market': 'Market',
  '/watchlist': 'Watchlist',
  '/ai-insights': 'AI Insights',
  '/alerts': 'Alerts',
  '/brokers': 'Brokers',
  '/settings': 'Settings',
}

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'InvestAI'

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(p => !p)} />

      <motion.div
        animate={{ marginLeft: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <Navbar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </motion.div>
    </div>
  )
}

export default DashboardLayout
