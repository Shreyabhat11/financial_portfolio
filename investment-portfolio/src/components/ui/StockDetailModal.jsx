import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdClose, MdTrendingUp, MdTrendingDown, MdOpenInNew,
  MdPsychology, MdRefresh, MdShowChart
} from 'react-icons/md'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { marketService, aiService } from '../../services/apiServices'

const PERIODS = [
  { label: '1D', value: '1d' },
  { label: '5D', value: '5d' },
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
  { label: '6M', value: '6mo' },
  { label: '1Y', value: '1y' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border-subtle rounded-xl p-3 text-xs shadow-card">
      <div className="text-text-secondary mb-1">{label}</div>
      <div className="text-accent font-semibold">₹{payload[0]?.value?.toLocaleString('en-IN')}</div>
    </div>
  )
}

const StockDetailModal = ({ symbol, onClose }) => {
  const [stockData, setStockData] = useState(null)
  const [history, setHistory] = useState([])
  const [aiData, setAiData] = useState(null)
  const [period, setPeriod] = useState('1mo')
  const [loadingStock, setLoadingStock] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [loadingAi, setLoadingAi] = useState(false)
  const [aiRequested, setAiRequested] = useState(false)

  // Fetch stock price + history on mount / period change
  useEffect(() => {
    if (!symbol) return
    setLoadingStock(true)
    marketService.getStock(symbol)
      .then(r => setStockData(r.data))
      .catch(() => {})
      .finally(() => setLoadingStock(false))
  }, [symbol])

  useEffect(() => {
    if (!symbol) return
    setLoadingHistory(true)
    marketService.getStockHistory(symbol, period)
      .then(r => {
        const raw = r.data?.data || []
        setHistory(raw.map(d => ({ date: d.date, value: d.close })))
      })
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false))
  }, [symbol, period])

  const fetchAI = () => {
    if (loadingAi) return
    setLoadingAi(true)
    setAiRequested(true)
    aiService.analyzeStock(symbol)
      .then(r => setAiData(r.data))
      .catch(() => setAiData({ analysis: 'AI analysis temporarily unavailable.', signal: 'HOLD' }))
      .finally(() => setLoadingAi(false))
  }

  const pos = (stockData?.change_pct || 0) >= 0
  const color = pos ? '#00c853' : '#ff5252'

  const tradingViewUrl = `https://www.tradingview.com/chart/?symbol=NSE:${symbol}`

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative bg-card border border-border-subtle rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-border-subtle sticky top-0 bg-card z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center">
                <span className="font-display font-bold text-accent text-sm">{symbol?.slice(0, 3)}</span>
              </div>
              <div>
                {loadingStock ? (
                  <div className="space-y-1">
                    <div className="skeleton h-5 w-32" />
                    <div className="skeleton h-4 w-20" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display font-bold text-white text-xl">{symbol}</h2>
                      <span className="text-text-secondary text-sm">NSE</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold text-2xl text-white">
                        ₹{stockData?.price?.toLocaleString('en-IN') || '—'}
                      </span>
                      <span className={`flex items-center gap-0.5 text-sm font-semibold ${pos ? 'text-success' : 'text-danger'}`}>
                        {pos ? <MdTrendingUp /> : <MdTrendingDown />}
                        {pos ? '+' : ''}{stockData?.change?.toFixed(2)} ({pos ? '+' : ''}{stockData?.change_pct?.toFixed(2)}%)
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={tradingViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border-subtle text-text-secondary hover:text-accent hover:border-accent/50 text-xs font-medium transition-all"
              >
                <MdOpenInNew className="text-sm" /> TradingView
              </a>
              <button onClick={onClose}
                className="p-2 rounded-xl text-text-secondary hover:text-white hover:bg-border-subtle transition-all">
                <MdClose className="text-xl" />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Quick stats */}
            {!loadingStock && stockData && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Prev Close', value: `₹${stockData.prev_close?.toLocaleString('en-IN') || '—'}` },
                  { label: 'Change', value: `${pos ? '+' : ''}₹${stockData.change?.toFixed(2)}`, color: pos ? 'text-success' : 'text-danger' },
                  { label: 'Volume', value: stockData.volume ? `${(stockData.volume / 1_000_000).toFixed(2)}M` : '—' },
                ].map(({ label, value, color: c }) => (
                  <div key={label} className="bg-card-dark border border-border-subtle rounded-xl p-3 text-center">
                    <div className="text-text-secondary text-xs mb-1">{label}</div>
                    <div className={`font-semibold font-mono text-sm ${c || 'text-white'}`}>{value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Chart */}
            <div className="bg-card-dark border border-border-subtle rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MdShowChart className="text-accent" />
                  <span className="text-white text-sm font-semibold">Price Chart</span>
                </div>
                <div className="flex gap-1">
                  {PERIODS.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setPeriod(p.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        period === p.value
                          ? 'bg-accent text-black'
                          : 'text-text-secondary hover:text-white hover:bg-border-subtle'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {loadingHistory ? (
                <div className="skeleton w-full h-48 rounded-xl" />
              ) : history.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-text-secondary text-sm">
                  Chart data unavailable
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`grad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#232b38" />
                    <XAxis dataKey="date" tick={{ fill: '#8892a4', fontSize: 10 }}
                      axisLine={false} tickLine={false}
                      tickFormatter={d => {
                        if (period === '1d' || period === '5d') return d
                        const dt = new Date(d)
                        return `${dt.getDate()}/${dt.getMonth()+1}`
                      }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fill: '#8892a4', fontSize: 10 }} axisLine={false} tickLine={false}
                      tickFormatter={v => `₹${(v/1000).toFixed(0)}k`}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2}
                      fill={`url(#grad-${symbol})`} dot={false}
                      activeDot={{ r: 4, fill: color }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* AI Analysis */}
            <div className="bg-card-dark border border-border-subtle rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MdPsychology className="text-accent text-lg" />
                  <span className="text-white text-sm font-semibold">AI Analysis</span>
                </div>
                {!aiRequested ? (
                  <button onClick={fetchAI}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/30 text-accent text-xs font-medium rounded-xl hover:bg-accent/20 transition-all">
                    <MdPsychology className="text-sm" /> Get Analysis
                  </button>
                ) : (
                  <button onClick={fetchAI} disabled={loadingAi}
                    className="p-1.5 rounded-lg text-text-secondary hover:text-accent transition-colors disabled:opacity-50">
                    <MdRefresh className={`text-lg ${loadingAi ? 'animate-spin' : ''}`} />
                  </button>
                )}
              </div>

              {!aiRequested ? (
                <p className="text-text-secondary text-sm">Click "Get Analysis" to receive an AI assessment of this stock.</p>
              ) : loadingAi ? (
                <div className="space-y-2">
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-5/6" />
                  <div className="skeleton h-4 w-4/5" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-3/4" />
                </div>
              ) : aiData ? (
                <div>
                  {aiData.signal && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        aiData.signal === 'BUY' ? 'bg-success/10 text-success border border-success/20' :
                        aiData.signal === 'SELL' ? 'bg-danger/10 text-danger border border-danger/20' :
                        'bg-warning/10 text-warning border border-warning/20'
                      }`}>
                        {aiData.signal}
                      </span>
                      <span className="text-text-secondary text-xs">AI Recommendation</span>
                    </div>
                  )}
                  <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
                    {aiData.analysis}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default StockDetailModal
