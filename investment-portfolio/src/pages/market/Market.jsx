import { useState } from 'react'
import { motion } from 'framer-motion'
import { MdSearch, MdTrendingUp, MdTrendingDown, MdArticle, MdRefresh, MdOpenInNew } from 'react-icons/md'
import { useApi } from '../../hooks/useApi'
import { marketService } from '../../services/apiServices'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import EmptyState from '../../components/ui/EmptyState'
import StockDetailModal from '../../components/ui/StockDetailModal'

const miniSparkData = (change) =>
  Array.from({ length: 10 }, (_, i) => ({
    v: 100 + i * (change > 0 ? 2 : -2) + (Math.random() - 0.5) * 4
  }))

const Market = () => {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [selectedStock, setSelectedStock] = useState(null)

  const { data: stocks, loading, execute: refresh } = useApi(
    marketService.getStocks, [], { defaultData: [] }
  )
  const { data: newsData, loading: newsLoading } = useApi(
    marketService.getNews, [], { defaultData: null }
  )
  const { data: trendingData } = useApi(
    marketService.getTrending, [], { defaultData: null }
  )

  const list = stocks || []
  const newsList = newsData?.news || []
  const trendingList = trendingData?.trending || []

  const filtered = list
    .filter(s =>
      s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      (s.name || '').toLowerCase().includes(search.toLowerCase())
    )
    .filter(s =>
      tab === 'gainers' ? s.change > 0 :
      tab === 'losers' ? s.change < 0 : true
    )

  return (
    <div className="space-y-6">
      {/* Search + refresh */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-lg" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search stocks by symbol or name..." className="input-field pl-10 text-sm" />
        </div>
        <button onClick={refresh}
          className="p-2.5 bg-card border border-border-subtle rounded-xl text-text-secondary hover:text-accent hover:border-accent/50 transition-all flex-shrink-0">
          <MdRefresh className={`text-xl ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Trending chips */}
      {trendingList.length > 0 && (
        <div className="bg-card border border-border-subtle rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <MdTrendingUp className="text-accent" />
            <span className="text-white text-sm font-semibold">Most Active Today</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingList.map(s => (
              <button key={s.symbol}
                onClick={() => setSelectedStock(s.symbol)}
                className="flex items-center gap-2 px-3 py-1.5 bg-card-dark border border-border-subtle rounded-lg text-xs hover:border-accent/50 hover:text-accent transition-all">
                <span className="text-white font-mono font-semibold">{s.symbol}</span>
                <span className={`font-mono ${s.change >= 0 ? 'text-success' : 'text-danger'}`}>
                  {s.change >= 0 ? '+' : ''}{s.change?.toFixed(2)}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs + table */}
      <div className="bg-card border border-border-subtle rounded-2xl overflow-hidden">
        <div className="flex items-center gap-1 p-4 border-b border-border-subtle flex-wrap gap-y-2">
          {[['all', 'All Stocks'], ['gainers', 'Gainers'], ['losers', 'Losers']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-accent text-black' : 'text-text-secondary hover:text-white'}`}>
              {label}
            </button>
          ))}
          <span className="ml-auto text-text-secondary text-xs">{filtered.length} stocks · Live NSE data</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                {['Symbol', 'Price', 'Change', '1M Trend', 'Volume', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-text-secondary text-xs font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && list.length === 0 ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border-subtle/40">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6}>
                  <EmptyState title="No stocks found" description="Try a different search query" />
                </td></tr>
              ) : (
                filtered.map((stock, i) => {
                  const pos = stock.change >= 0
                  const spark = miniSparkData(stock.change)
                  return (
                    <motion.tr key={stock.symbol}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.02, 0.3) }}
                      className="border-b border-border-subtle/40 hover:bg-card-dark transition-colors cursor-pointer group"
                      onClick={() => setSelectedStock(stock.symbol)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white group-hover:text-accent transition-colors">{stock.symbol}</div>
                        <div className="text-text-secondary text-xs truncate max-w-36">{stock.name}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-white font-semibold">
                        ₹{stock.price?.toLocaleString('en-IN') || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-1 font-mono font-medium text-sm ${pos ? 'text-success' : 'text-danger'}`}>
                          {pos ? <MdTrendingUp /> : <MdTrendingDown />}
                          {pos ? '+' : ''}{stock.change?.toFixed(2)}%
                        </div>
                        {stock.prevClose && (
                          <div className="text-text-secondary text-xs font-mono">PC: ₹{stock.prevClose?.toLocaleString('en-IN')}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 w-24">
                        <ResponsiveContainer width="100%" height={36}>
                          <LineChart data={spark}>
                            <Line type="monotone" dataKey="v" stroke={pos ? '#00c853' : '#ff5252'}
                              strokeWidth={1.5} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </td>
                      <td className="px-4 py-3 text-text-secondary font-mono text-xs">
                        {stock.volume ? `${(stock.volume / 1_000_000).toFixed(2)}M` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="opacity-0 group-hover:opacity-100 text-accent text-xs transition-opacity">
                          Details →
                        </span>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Market News */}
      <div className="bg-card border border-border-subtle rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <MdArticle className="text-accent text-lg" />
          <h3 className="font-display font-bold text-white text-base">Market News</h3>
          <span className="ml-auto text-text-secondary text-xs">Live</span>
        </div>
        {newsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="skeleton h-5 w-5 rounded flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {newsList.map((item, i) => {
              const colors = {
                positive: 'bg-success/10 text-success',
                negative: 'bg-danger/10 text-danger',
                neutral: 'bg-warning/10 text-warning',
              }
              return (
                <motion.div key={item.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-4 py-3 border-b border-border-subtle/50 last:border-0 hover:bg-card-dark rounded-xl px-2 transition-colors"
                >
                  <div className={`mt-0.5 px-1.5 py-0.5 rounded text-xs font-bold flex-shrink-0 ${colors[item.sentiment] || colors.neutral}`}>
                    {item.sentiment === 'positive' ? '↑' : item.sentiment === 'negative' ? '↓' : '→'}
                  </div>
                  <div className="flex-1 min-w-0">
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer"
                        className="text-white text-sm leading-snug hover:text-accent transition-colors flex items-start gap-1">
                        <span className="line-clamp-2">{item.headline}</span>
                        <MdOpenInNew className="text-xs flex-shrink-0 mt-0.5 opacity-60" />
                      </a>
                    ) : (
                      <p className="text-white text-sm leading-snug line-clamp-2">{item.headline}</p>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-text-secondary text-xs">{item.source}</span>
                      <span className="text-border-subtle text-xs">·</span>
                      <span className="text-text-secondary text-xs">{item.time}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {selectedStock && (
        <StockDetailModal symbol={selectedStock} onClose={() => setSelectedStock(null)} />
      )}
    </div>
  )
}

export default Market
