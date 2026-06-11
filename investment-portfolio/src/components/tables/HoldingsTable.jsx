import { motion } from 'framer-motion'
import { MdTableChart, MdSync, MdEdit, MdArrowUpward, MdArrowDownward } from 'react-icons/md'
import { TableRowSkeleton } from '../ui/Skeleton'
import EmptyState from '../ui/EmptyState'

const BROKER_COLORS = {
  zerodha: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  upstox:  'bg-purple-500/15 text-purple-400 border-purple-500/25',
  groww:   'bg-green-500/15 text-green-400 border-green-500/25',
  angel:   'bg-orange-500/15 text-orange-400 border-orange-500/25',
  manual:  'bg-border-subtle text-text-secondary border-border-subtle',
}

const AISignalBadge = ({ signal }) => {
  const map = { BUY: 'tag-buy', SELL: 'tag-sell', HOLD: 'tag-hold' }
  return <span className={map[signal] || 'tag-hold'}>{signal || 'HOLD'}</span>
}

const SourceBadge = ({ source, broker }) => {
  const label  = source === 'broker' ? (broker || 'broker') : 'manual'
  const colors = BROKER_COLORS[label] || BROKER_COLORS.manual
  const icon   = source === 'broker' ? <MdSync className="text-xs" /> : <MdEdit className="text-xs" />
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border capitalize ${colors}`}>
      {icon}{label}
    </span>
  )
}

const HoldingsTable = ({ holdings = [], loading = false, onRowClick, onDelete }) => {
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              {['Stock', 'Source', 'Qty', 'Avg Cost', 'CMP', 'Day P&L', 'Total P&L', 'Signal'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-text-secondary font-medium text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>{Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />)}</tbody>
        </table>
      </div>
    )
  }

  if (!holdings.length) {
    return (
      <EmptyState
        icon={MdTableChart}
        title="No holdings yet"
        description="Connect a broker to auto-sync your holdings, or add one manually."
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-subtle">
            {['Stock', 'Source', 'Qty', 'Avg Cost', 'CMP', 'Day P&L', 'Total P&L', 'Signal'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-text-secondary font-medium text-xs uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {holdings.map((row, i) => {
            const dayPnl   = row.dayPnl   || 0
            const yearPnl  = row.yearPnl  || 0
            const dayPct   = row.dayChangePct || 0
            const isManual = (row.source || 'manual') === 'manual'
            return (
              <motion.tr
                key={row.id || row.symbol || i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => onRowClick && onRowClick(row.symbol)}
                className={`border-b border-border-subtle/50 transition-colors duration-150 group
                  ${onRowClick ? 'cursor-pointer hover:bg-accent/5' : 'hover:bg-card-dark'}`}
              >
                {/* Stock name */}
                <td className="px-4 py-3">
                  <div className="font-semibold text-white group-hover:text-accent transition-colors">{row.symbol}</div>
                  <div className="text-text-secondary text-xs">{row.name !== row.symbol ? row.name : ''}</div>
                </td>

                {/* Source badge */}
                <td className="px-4 py-3">
                  <SourceBadge source={row.source || 'manual'} broker={row.broker} />
                </td>

                {/* Qty */}
                <td className="px-4 py-3 font-mono text-white">{row.qty}</td>

                {/* Avg cost */}
                <td className="px-4 py-3 font-mono text-white">
                  ₹{row.avgCost?.toLocaleString('en-IN') || '—'}
                </td>

                {/* CMP */}
                <td className="px-4 py-3">
                  <div className="font-mono text-white font-semibold">
                    {row.cmp ? `₹${row.cmp?.toLocaleString('en-IN')}` : '—'}
                  </div>
                  {dayPct !== 0 && (
                    <div className={`flex items-center gap-0.5 text-xs font-mono ${dayPct >= 0 ? 'text-success' : 'text-danger'}`}>
                      {dayPct >= 0 ? <MdArrowUpward className="text-xs"/> : <MdArrowDownward className="text-xs"/>}
                      {Math.abs(dayPct).toFixed(2)}%
                    </div>
                  )}
                </td>

                {/* Day P&L */}
                <td className={`px-4 py-3 font-mono font-medium ${dayPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                  {dayPnl >= 0 ? '+' : ''}₹{Math.abs(dayPnl).toLocaleString('en-IN')}
                </td>

                {/* Total P&L */}
                <td className={`px-4 py-3 font-mono font-medium ${yearPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                  {yearPnl >= 0 ? '+' : ''}₹{Math.abs(yearPnl).toLocaleString('en-IN')}
                </td>

                {/* AI Signal */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <AISignalBadge signal={row.aiSignal} />
                    {isManual && onDelete && (
                      <button
                        onClick={e => { e.stopPropagation(); onDelete(row.id) }}
                        className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-danger text-xs transition-all"
                        title="Remove manual holding"
                      >✕</button>
                    )}
                  </div>
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
