import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdDashboard, MdShowChart, MdTrendingUp, MdBookmarks,
  MdPsychology, MdNotifications, MdAccountBalance, MdSettings,
  MdLogout, MdChevronLeft, MdChevronRight
} from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { path: '/dashboard', icon: MdDashboard, label: 'Dashboard' },
  { path: '/portfolio', icon: MdShowChart, label: 'Portfolio' },
  { path: '/market', icon: MdTrendingUp, label: 'Market' },
  { path: '/watchlist', icon: MdBookmarks, label: 'Watchlist' },
  { path: '/ai-insights', icon: MdPsychology, label: 'AI Insights' },
  { path: '/alerts', icon: MdNotifications, label: 'Alerts' },
  { path: '/brokers', icon: MdAccountBalance, label: 'Brokers' },
  { path: '/settings', icon: MdSettings, label: 'Settings' },
]

const Sidebar = ({ collapsed, onToggle }) => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
      toast.success('Logged out successfully')
    } catch {
      toast.error('Logout failed')
    }
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-sidebar border-r border-border-subtle flex flex-col fixed left-0 top-0 z-50 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border-subtle min-h-[72px]">
        <div className="w-9 h-9 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center flex-shrink-0">
          <MdTrendingUp className="text-accent text-xl" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="font-display font-bold text-white text-sm leading-tight">Investment</div>
              <div className="font-display font-bold text-accent text-sm leading-tight">Portfolio</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
              ${isActive
                ? 'bg-accent/15 text-accent border border-accent/25'
                : 'text-text-secondary hover:bg-card hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`text-xl flex-shrink-0 ${isActive ? 'text-accent' : ''}`} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-border-subtle p-3">
        {!collapsed && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 px-2 py-2 mb-2"
          >
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-sm flex-shrink-0">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-white text-sm font-medium truncate">{user.name || 'User'}</div>
              <div className="text-text-secondary text-xs truncate">{user.email || ''}</div>
            </div>
          </motion.div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-text-secondary hover:bg-danger/10 hover:text-danger transition-all duration-200"
        >
          <MdLogout className="text-xl flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border-subtle rounded-full flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-all duration-200 z-10"
      >
        {collapsed ? <MdChevronRight className="text-sm" /> : <MdChevronLeft className="text-sm" />}
      </button>
    </motion.aside>
  )
}

export default Sidebar
