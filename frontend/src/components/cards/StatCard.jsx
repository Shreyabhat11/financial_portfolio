import { motion } from 'framer-motion'
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md'

const StatCard = ({ title, value, change, changeLabel, icon: Icon, accent = false, index = 0 }) => {
  const isPositive = parseFloat(change) >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={`
        relative bg-card rounded-2xl p-5 border overflow-hidden
        ${accent ? 'border-accent/30 shadow-accent-glow' : 'border-border-subtle'}
        hover:border-accent/40 transition-all duration-300 group
      `}
    >
      {/* Subtle background glow */}
      {accent && (
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
      )}

      <div className="flex items-start justify-between mb-3">
        <span className="text-text-secondary text-xs font-medium uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-xl ${accent ? 'bg-accent/15' : 'bg-border-subtle'}`}>
            <Icon className={`text-lg ${accent ? 'text-accent' : 'text-text-secondary'}`} />
          </div>
        )}
      </div>

      <div className="font-display font-bold text-2xl text-white mb-2">{value}</div>

      {change !== undefined && (
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
          {isPositive ? <MdArrowUpward className="text-base" /> : <MdArrowDownward className="text-base" />}
          <span>{Math.abs(change)}%</span>
          {changeLabel && <span className="text-text-secondary font-normal ml-1">{changeLabel}</span>}
        </div>
      )}
    </motion.div>
  )
}

export default StatCard
