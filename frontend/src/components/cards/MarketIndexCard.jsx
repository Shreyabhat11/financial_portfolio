import { motion } from 'framer-motion'
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md'

const MarketIndexCard = ({ name, value, change, changePercent, index = 0 }) => {
  const isPositive = parseFloat(changePercent) >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      className="bg-card border border-border-subtle rounded-2xl p-5 flex items-center justify-between
                 hover:border-accent/30 transition-all duration-300 group"
    >
      <div>
        <div className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-1">{name}</div>
        <div className="font-display font-bold text-white text-2xl">{value?.toLocaleString('en-IN')}</div>
      </div>

      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold
        ${isPositive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
        {isPositive
          ? <MdArrowUpward className="text-base" />
          : <MdArrowDownward className="text-base" />}
        {changePercent !== undefined ? `(+${Math.abs(changePercent)})` : ''}
      </div>
    </motion.div>
  )
}

export default MarketIndexCard
