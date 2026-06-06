import { useState } from 'react'
import { motion } from 'framer-motion'
import { MdSearch, MdTrendingUp, MdTrendingDown, MdArticle, MdRefresh } from 'react-icons/md'
import { useApi } from '../../hooks/useApi'
import { marketService } from '../../services/apiServices'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import EmptyState from '../../components/ui/EmptyState'

const MOCK_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2650, change: 1.2, volume: '2.4M', mktCap: '17.9L Cr' },
  { symbol: 'TCS', name: 'Tata Consultancy', price: 4100, change: 0.8, volume: '1.1M', mktCap: '14.9L Cr' },
  { symbol: 'INFY', name: 'Infosys Ltd', price: 1380, change: -1.4, volume: '3.2M', mktCap: '5.7L Cr' },
  { symbol: 'HDFC', name: 'HDFC Bank', price: 1720, change: 0.5, volume: '1.8M', mktCap: '13.1L Cr' },
  { symbol: 'WIPRO', name: 'Wipro Ltd', price: 520, change: 2.1, volume: '4.5M', mktCap: '2.7L Cr' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance', price: 7120, change: 1.9, volume: '0.9M', mktCap: '4.3L Cr' },
  { symbol: 'TECHM', name: 'Tech Mahindra', price: 1290, change: -0.9, volume: '2.1M', mktCap: '1.2L Cr' },
  { symbol: 'TITAN', name: 'Titan Company', price: 3480, change: 0.3, volume: '0.7M', mktCap: '3.1L Cr' },
]
const MOCK_NEWS = [
  { id: 1, headline: 'RBI maintains status quo on repo rate amid inflation concerns', source: 'Economic Times', time: '1h ago', sentiment: 'neutral' },
  { id: 2, headline: 'Infosys Q3 results beat estimates, guides for strong FY25', source: 'Mint', time: '2h ago', sentiment: 'positive' },
  { id: 3, headline: 'FII outflows continue as US dollar strengthens globally', source: 'Business Standard', time: '3h ago', sentiment: 'negative' },
  { id: 4, headline: 'Nifty50 index rebalancing to include 3 new companies', source: 'CNBC', time: '5h ago', sentiment: 'neutral' },
]
const MOCK_TRENDING = ['RELIANCE', 'TCS', 'INFY', 'BAJFINANCE', 'TITAN', 'WIPRO']

const miniData = () => Array.from({ length: 10 }, (_, i) => ({ v: 50 + Math.random() * 50 }))

const SentimentBadge = ({ s }) => ({
  positive: <span className="text-success text-xs">↑ Bullish</span>,
  negative: <span className="text-danger text-xs">↓ Bearish</span>,
  neutral: <span className="text-warning text-xs">→ Neutral</span>,
}[s])

const Market = () => {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const { data: stocks, loading, execute: refresh } = useApi(marketService.getStocks, [], { defaultData: MOCK_STOCKS })

  const list = (stocks || MOCK_STOCKS).filter(s =>
    s.symbol.toLowerCase().includes(search.toLowerCase()) ||
    s.name.toLowerCase().includes(search.toLowerCase())
  )
  const filtered = tab === 'gainers' ? list.filter(s => s.change > 0)
    : tab === 'losers' ? list.filter(s => s.change < 0)
    : list

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-lg" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search stocks, indices..." className="input-field pl-10 text-sm" />
        </div>
        <button onClick={refresh} className="p-2.5 bg-card border border-border-subtle rounded-xl text-text-secondary hover:text-accent hover:border-accent/50 transition-all">
          <MdRefresh className="text-xl" />
        </button>
      </div>

      {/* Trending */}
      <div className="bg-card border border-border-subtle rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <MdTrendingUp className="text-accent" />
          <span className="text-white text-sm font-semibold">Trending</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {MOCK_TRENDING.map(sym => (
            <button key={sym} onClick={() => setSearch(sym)}
              className="px-3 py-1.5 bg-card-dark border border-border-subtle rounded-lg text-text-secondary text-xs font-mono hover:border-accent/50 hover:text-accent transition-all">
              {sym}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs + Table */}
      <div className="bg-card border border-border-subtle rounded-2xl overflow-hidden">
        <div className="flex items-center gap-1 p-4 border-b border-border-subtle">
          {[['all', 'All Stocks'], ['gainers', 'Gainers'], ['losers', 'Losers']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-accent text-black' : 'text-text-secondary hover:text-white'}`}>
              {label}
            </button>
          ))}
          <span className="ml-auto text-text-secondary text-xs">{filtered.length} stocks</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                {['Symbol', 'Price', 'Change', '7D Trend', 'Volume', 'Mkt Cap'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-text-secondary text-xs font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6}><EmptyState title="No stocks found" description="Try a different search query" /></td></tr>
              ) : filtered.map((stock, i) => {
                const pos = stock.change >= 0
                const data = miniData()
                return (
                  <motion.tr key={stock.symbol}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border-subtle/40 hover:bg-card-dark transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{stock.symbol}</div>
                      <div className="text-text-secondary text-xs">{stock.name}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-white">₹{stock.price.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-1 font-mono font-medium text-sm ${pos ? 'text-success' : 'text-danger'}`}>
                        {pos ? <MdTrendingUp /> : <MdTrendingDown />}
                        {pos ? '+' : ''}{stock.change}%
                      </div>
                    </td>
                    <td className="px-4 py-3 w-24">
                      <ResponsiveContainer width="100%" height={36}>
                        <LineChart data={data}>
                          <Line type="monotone" dataKey="v" stroke={pos ? '#00c853' : '#ff5252'}
                            strokeWidth={1.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </td>
                    <td className="px-4 py-3 text-text-secondary font-mono">{stock.volume}</td>
                    <td className="px-4 py-3 text-text-secondary">{stock.mktCap}</td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Market News */}
      <div className="bg-card border border-border-subtle rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <MdArticle className="text-accent text-lg" />
          <h3 className="font-display font-bold text-white text-base">Market News</h3>
        </div>
        <div className="space-y-1">
          {MOCK_NEWS.map((item, i) => (
            <motion.div key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-start gap-4 py-3 border-b border-border-subtle/50 last:border-0 hover:bg-card-dark rounded-xl px-2 transition-colors cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm leading-snug mb-1">{item.headline}</p>
                <div className="flex items-center gap-3">
                  <span className="text-text-secondary text-xs">{item.source}</span>
                  <span className="text-text-secondary text-xs">·</span>
                  <span className="text-text-secondary text-xs">{item.time}</span>
                </div>
              </div>
              <SentimentBadge s={item.sentiment} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Market
