import { useState } from 'react'
import { MdSearch, MdNotifications, MdRefresh } from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'

const Navbar = ({ title, onRefresh }) => {
  const { user } = useAuth()
  const [search, setSearch] = useState('')

  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <header className="h-16 border-b border-border-subtle bg-bg/80 backdrop-blur-md flex items-center px-6 gap-4 sticky top-0 z-30">
      <div className="flex-1">
        <h1 className="font-display font-bold text-white text-lg">{title}</h1>
        <p className="text-text-secondary text-xs">{dateStr} · {timeStr}</p>
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-lg" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search stocks..."
          className="bg-card border border-border-subtle text-sm text-white placeholder-text-secondary pl-9 pr-4 py-2 rounded-xl w-56 focus:outline-none focus:border-accent focus:w-72 transition-all duration-300"
        />
      </div>

      {/* Refresh */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="p-2 rounded-xl text-text-secondary hover:text-accent hover:bg-accent/10 transition-all duration-200"
          title="Refresh data"
        >
          <MdRefresh className="text-xl" />
        </button>
      )}

      {/* Notifications */}
      <button className="relative p-2 rounded-xl text-text-secondary hover:text-accent hover:bg-accent/10 transition-all duration-200">
        <MdNotifications className="text-xl" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
      </button>

      {/* Avatar */}
      <div className="w-9 h-9 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-semibold text-sm cursor-pointer hover:bg-accent/30 transition-all duration-200">
        {user?.name?.[0]?.toUpperCase() || 'U'}
      </div>
    </header>
  )
}

export default Navbar
