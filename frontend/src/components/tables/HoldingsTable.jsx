import { motion } from 'framer-motion'
import { TableRowSkeleton } from '../ui/Skeleton'
import EmptyState from '../ui/EmptyState'
import { MdTableChart } from 'react-icons/md'

const AISignalBadge = ({ signal }) => {
  const map = {
    BUY: 'tag-buy', SELL: 'tag-sell', HOLD: 'tag-hold',
  }
  return <span className={map[signal] || 'tag-hold'}>{signal || 'HOLD'}</span>
}

const HoldingsTable = ({ holdings = [], loading = false }) => {
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              {['Stock', 'Qty', 'Avg', 'CMP', 'P&L (D)', 'P&L (Y)', 'AI Signal'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-text-secondary font-medium text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)}
          </tbody>
        </table>
      </div>
    )
  }

  if (!holdings.length) {
    return <EmptyState icon={MdTableChart} title="No holdings yet" description="Add stocks to your portfolio to see them here." />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-subtle">
            {['Stock', 'Qty', 'Avg Cost', 'CMP', 'P&L (D)', 'P&L (Y)', 'AI Signal'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-text-secondary font-medium text-xs uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {holdings.map((row, i) => {
            const dayPnl = row.dayPnl || 0
            const yearPnl = row.yearPnl || 0
            return (
              <motion.tr
                key={row.symbol || i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-border-subtle/50 hover:bg-card-dark transition-colors duration-150 group"
              >
                <td className="px-4 py-3">
                  <div className="font-semibold text-white">{row.symbol}</div>
                  <div className="text-text-secondary text-xs">{row.name}</div>
                </td>
                <td className="px-4 py-3 font-mono text-white">{row.qty}</td>
                <td className="px-4 py-3 font-mono text-white">₹{row.avgCost?.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 font-mono text-white">₹{row.cmp?.toLocaleString('en-IN')}</td>
                <td className={`px-4 py-3 font-mono font-medium ${dayPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                  {dayPnl >= 0 ? '+' : ''}₹{Math.abs(dayPnl).toLocaleString('en-IN')}
                </td>
                <td className={`px-4 py-3 font-mono font-medium ${yearPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                  {yearPnl >= 0 ? '+' : ''}₹{Math.abs(yearPnl).toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3">
                  <AISignalBadge signal={row.aiSignal} />
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default HoldingsTable
