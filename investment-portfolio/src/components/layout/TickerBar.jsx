import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { marketService } from '../../services/apiServices'

const FALLBACK = [
  { sym: 'NIFTY 50', val: '22,145', chg: '+0.76%', up: true },
  { sym: 'BANKNIFTY', val: '47,810', chg: '+0.43%', up: true },
  { sym: 'SENSEX', val: '75,893', chg: '+0.48%', up: true },
  { sym: 'RELIANCE', val: '₹2,650', chg: '+1.2%', up: true },
  { sym: 'TCS', val: '₹4,100', chg: '+0.8%', up: true },
  { sym: 'INFY', val: '₹1,380', chg: '-1.4%', up: false },
  { sym: 'HDFCBANK', val: '₹1,720', chg: '+0.5%', up: true },
  { sym: 'WIPRO', val: '₹520', chg: '+2.1%', up: true },
]

const TickerBar = () => {
  const [items, setItems] = useState(FALLBACK)

  useEffect(() => {
    // Fetch indices + trending stocks for real ticker data
    Promise.all([
      marketService.getIndices().catch(() => null),
      marketService.getTrending().catch(() => null),
    ]).then(([indicesRes, trendingRes]) => {
      const ticker = []

      // Add real indices
      const idx = indicesRes?.data
      if (idx?.nifty50) ticker.push({
        sym: 'NIFTY 50',
        val: idx.nifty50.price?.toLocaleString('en-IN'),
        chg: `${idx.nifty50.change_pct >= 0 ? '+' : ''}${idx.nifty50.change_pct?.toFixed(2)}%`,
        up: idx.nifty50.change_pct >= 0,
      })
      if (idx?.banknifty) ticker.push({
        sym: 'BANKNIFTY',
        val: idx.banknifty.price?.toLocaleString('en-IN'),
        chg: `${idx.banknifty.change_pct >= 0 ? '+' : ''}${idx.banknifty.change_pct?.toFixed(2)}%`,
        up: idx.banknifty.change_pct >= 0,
      })
      if (idx?.sensex) ticker.push({
        sym: 'SENSEX',
        val: idx.sensex.price?.toLocaleString('en-IN'),
        chg: `${idx.sensex.change_pct >= 0 ? '+' : ''}${idx.sensex.change_pct?.toFixed(2)}%`,
        up: idx.sensex.change_pct >= 0,
      })

      // Add trending stocks
      const trending = trendingRes?.data?.trending || []
      trending.slice(0, 6).forEach(s => {
        ticker.push({
          sym: s.symbol,
          val: `₹${s.price?.toLocaleString('en-IN')}`,
          chg: `${s.change >= 0 ? '+' : ''}${s.change?.toFixed(2)}%`,
          up: s.change >= 0,
        })
      })

      if (ticker.length > 0) setItems(ticker)
    })
  }, [])

  const doubled = [...items, ...items]

  return (
    <div className="bg-card/60 border-b border-border-subtle overflow-hidden py-2.5">
      <motion.div
        className="flex gap-10 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
      >
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-2 flex-shrink-0">
            <span className="text-text-secondary text-xs font-medium">{item.sym}</span>
            <span className="text-white text-xs font-mono font-semibold">{item.val}</span>
            <span className={`text-xs font-mono font-semibold ${item.up ? 'text-success' : 'text-danger'}`}>
              {item.chg}
            </span>
            <span className="text-border-subtle">·</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default TickerBar
