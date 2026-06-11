import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MdTrendingUp, MdShowChart, MdHealthAndSafety, MdAutoAwesome,
  MdAdd, MdRefresh, MdArrowUpward, MdArrowDownward, MdOpenInNew
} from 'react-icons/md'
import { useApi } from '../../hooks/useApi'
import { dashboardService, portfolioService } from '../../services/apiServices'
import MarketIndexCard from '../../components/cards/MarketIndexCard'
import HoldingsTable from '../../components/tables/HoldingsTable'
import PortfolioChart from '../../components/charts/PortfolioChart'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import StockDetailModal from '../../components/ui/StockDetailModal'
import { CardSkeleton } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

const MOCK_CHART = Array.from({ length: 12 }, (_, i) => ({
  date: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
  value: 12000 + i * 300,
}))

// ── Add Holding Modal ────────────────────────────────────────────────────────
const AddHoldingModal = ({ isOpen, onClose, onAdded }) => {
  const [form, setForm] = useState({ stock_symbol: '', quantity: '', average_price: '' })
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    if (!form.stock_symbol || !form.quantity || !form.average_price)
      return toast.error('Fill all fields')
    setSaving(true)
    try {
      await portfolioService.addHolding({
        stock_symbol: form.stock_symbol.toUpperCase(),
        quantity: parseFloat(form.quantity),
        average_price: parseFloat(form.average_price),
      })
      toast.success(`${form.stock_symbol.toUpperCase()} added to portfolio`)
      setForm({ stock_symbol: '', quantity: '', average_price: '' })
      onAdded()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add holding')
    } finally { setSaving(false) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Holding">
      <div className="space-y-4">
        <div>
          <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">
            NSE Symbol
          </label>
          <input value={form.stock_symbol}
            onChange={e => setForm(p => ({ ...p, stock_symbol: e.target.value.toUpperCase() }))}
            placeholder="e.g. RELIANCE, TCS, INFY" className="input-field" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">Quantity</label>
            <input type="number" value={form.quantity}
              onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
              placeholder="e.g. 10" className="input-field" />
          </div>
          <div>
            <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">Avg Buy Price (₹)</label>
            <input type="number" value={form.average_price}
              onChange={e => setForm(p => ({ ...p, average_price: e.target.value }))}
              placeholder="e.g. 2400" className="input-field" />
          </div>
        </div>
        <div className="bg-card-dark border border-border-subtle rounded-xl p-3 text-xs text-text-secondary">
          Current market price will be fetched automatically from NSE.
        </div>
        <div className="flex gap-3 pt-1">
          <Button variant="ghost" onClick={onClose} className="flex-1 justify-center">Cancel</Button>
          <Button onClick={handleAdd} loading={saving} className="flex-1 justify-center">Add Holding</Button>
        </div>
      </div>
    </Modal>
  )
}

// ── Health Score ─────────────────────────────────────────────────────────────
const HealthScore = ({ score }) => {
  const color = score >= 75 ? '#00c853' : score >= 50 ? '#ffab00' : score > 0 ? '#ff5252' : '#8892a4'
  const radius = 52
  const circ = 2 * Math.PI * radius
  const offset = circ - (score / 100) * circ
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <svg width="140" height="140" className="mb-2">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#232b38" strokeWidth="10" />
        <circle cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 70 70)" style={{ transition: 'stroke-dashoffset 1.5s ease' }} />
        <text x="70" y="65" textAnchor="middle" fill={color} fontSize="28" fontWeight="700" fontFamily="Syne">
          {score}
        </text>
        <text x="70" y="83" textAnchor="middle" fill="#8892a4" fontSize="11">/100</text>
      </svg>
      <div className="text-xs text-text-secondary">Portfolio Health</div>
    </div>
  )
}

// ── Top Movers ───────────────────────────────────────────────────────────────
const TopMovers = ({ movers, loading, onStockClick }) => {
  if (loading) return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex justify-between">
          <div className="skeleton h-4 w-20" /><div className="skeleton h-4 w-12" />
        </div>
      ))}
    </div>
  )
  const gainers = movers?.gainers || []
  const losers = movers?.losers || []
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="text-success text-xs font-semibold uppercase tracking-wider mb-2">Gainers</div>
        <div className="space-y-2">
          {gainers.map(s => (
            <button key={s.symbol} onClick={() => onStockClick(s.symbol)}
              className="flex items-center justify-between w-full hover:bg-card-dark rounded-lg px-1 py-0.5 transition-colors">
              <span className="text-white text-sm font-medium">{s.symbol}</span>
              <div className="flex items-center gap-0.5 text-success text-sm font-mono">
                <MdArrowUpward className="text-xs" />+{Math.abs(s.change)}%
              </div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-danger text-xs font-semibold uppercase tracking-wider mb-2">Losers</div>
        <div className="space-y-2">
          {losers.map(s => (
            <button key={s.symbol} onClick={() => onStockClick(s.symbol)}
              className="flex items-center justify-between w-full hover:bg-card-dark rounded-lg px-1 py-0.5 transition-colors">
              <span className="text-white text-sm font-medium">{s.symbol}</span>
              <div className="flex items-center gap-0.5 text-danger text-sm font-mono">
                <MdArrowDownward className="text-xs" />{s.change}%
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── News Item ────────────────────────────────────────────────────────────────
const NewsItem = ({ item, index }) => {
  const colors = {
    positive: 'bg-success/10 text-success',
    negative: 'bg-danger/10 text-danger',
    neutral: 'bg-warning/10 text-warning',
  }
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex gap-3 py-3 border-b border-border-subtle/50 last:border-0"
    >
      <div className={`mt-0.5 px-1.5 py-0.5 rounded text-xs font-bold flex-shrink-0 ${colors[item.sentiment] || colors.neutral}`}>
        {item.sentiment === 'positive' ? '↑' : item.sentiment === 'negative' ? '↓' : '→'}
      </div>
      <div className="flex-1 min-w-0">
        {item.url ? (
          <a href={item.url} target="_blank" rel="noopener noreferrer"
            className="text-white text-sm leading-snug hover:text-accent transition-colors line-clamp-2 flex items-start gap-1">
            {item.headline}
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
}

// ── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [addModal, setAddModal] = useState(false)
  const [selectedStock, setSelectedStock] = useState(null)

  const { data: summary, loading: sumLoading } = useApi(dashboardService.getSummary, [], { defaultData: null })
  const { data: market, loading: mktLoading } = useApi(dashboardService.getMarketOverview, [], { defaultData: null })
  const { data: movers, loading: movLoading } = useApi(dashboardService.getTopMovers, [], { defaultData: null })
  const { data: newsData, loading: newsLoading, execute: refreshNews } = useApi(dashboardService.getNews, [], { defaultData: null })
  const { data: holdings, loading: hLoading, execute: refetchHoldings } = useApi(portfolioService.getHoldings, [], { defaultData: [] })
  const { data: perfData } = useApi(portfolioService.getPerformance, [], { defaultData: null })

  const sum = summary || { totalInvestment: 0, currentValue: 0, dayPnl: 0, totalPnl: 0, totalPnlPct: 0, healthScore: 0 }
  const indices = market?.indices || []
  const chartData = perfData?.data || MOCK_CHART
  const holdingsList = holdings || []
  const newsList = newsData?.news || []

  return (
    <div className="space-y-6">
      {/* Market Indices */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {mktLoading
          ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          : indices.map((idx, i) => <MarketIndexCard key={idx.name} {...idx} index={i} />)
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Portfolio Summary */}
          <section>
            <h2 className="font-display font-bold text-white text-lg mb-4">Portfolio Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {sumLoading ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />) : (
                <>
                  {[
                    { label: 'Total Investment', value: `₹${sum.totalInvestment?.toLocaleString('en-IN')}` },
                    {
                      label: 'Current Value',
                      value: `₹${sum.currentValue?.toLocaleString('en-IN')}`,
                      sub: sum.totalPnl ? `${sum.totalPnl >= 0 ? '+' : ''}₹${Math.abs(sum.totalPnl).toLocaleString('en-IN')}` : null,
                      subColor: sum.totalPnl >= 0 ? 'text-success' : 'text-danger',
                    },
                    {
                      label: 'Day P&L',
                      value: `${sum.dayPnl >= 0 ? '+' : ''}₹${Math.abs(sum.dayPnl || 0).toLocaleString('en-IN')}`,
                      valueColor: sum.dayPnl >= 0 ? 'text-success' : 'text-danger',
                    },
                  ].map(({ label, value, sub, subColor, valueColor }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-card border border-border-subtle rounded-2xl p-5 hover:border-accent/30 transition-all">
                      <div className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">{label}</div>
                      <div className={`font-display font-bold text-2xl ${valueColor || 'text-white'}`}>{value}</div>
                      {sub && <div className={`text-sm font-medium mt-1 ${subColor}`}>{sub}</div>}
                    </motion.div>
                  ))}
                </>
              )}
            </div>
          </section>

          {/* Holdings */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-white text-lg">Current Holdings</h2>
              <Button onClick={() => setAddModal(true)} icon={<MdAdd />} size="sm">Add Holding</Button>
            </div>
            <div className="bg-card border border-border-subtle rounded-2xl overflow-hidden">
              <HoldingsTable
                holdings={holdingsList}
                loading={hLoading}
                onRowClick={(sym) => setSelectedStock(sym)}
              />
            </div>
          </section>

          {/* Performance chart */}
          <section>
            <div className="bg-card border border-border-subtle rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display font-bold text-white text-base">Portfolio Performance</h2>
                  <p className="text-text-secondary text-xs mt-0.5">12-month growth</p>
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${sum.totalPnlPct >= 0 ? 'text-success' : 'text-danger'}`}>
                  <MdShowChart />{sum.totalPnlPct >= 0 ? '+' : ''}{sum.totalPnlPct}%
                </div>
              </div>
              <PortfolioChart data={chartData} />
            </div>
          </section>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-6">
          {/* AI Health */}
          <div className="bg-card border border-accent/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <MdHealthAndSafety className="text-accent text-lg" />
              <h3 className="font-display font-bold text-white text-sm">AI Portfolio Health Score</h3>
            </div>
            <HealthScore score={sum.healthScore || 0} />
          </div>

          {/* Top Movers */}
          <div className="bg-card border border-border-subtle rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <MdTrendingUp className="text-accent text-lg" />
              <h3 className="font-display font-bold text-white text-sm uppercase tracking-wide">Top Gainers / Losers</h3>
            </div>
            <TopMovers movers={movers} loading={movLoading} onStockClick={setSelectedStock} />
          </div>

          {/* News Feed */}
          <div className="bg-card border border-border-subtle rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <MdAutoAwesome className="text-accent text-lg" />
              <h3 className="font-display font-bold text-white text-sm uppercase tracking-wide flex-1">AI News Feed</h3>
              <button onClick={refreshNews}
                className="p-1.5 rounded-lg text-text-secondary hover:text-accent transition-colors"
                title="Refresh news">
                <MdRefresh className={`text-base ${newsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            {newsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="skeleton h-5 w-5 rounded flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="skeleton h-3 w-full" />
                      <div className="skeleton h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : newsList.length > 0 ? (
              newsList.slice(0, 6).map((item, i) => <NewsItem key={item.id} item={item} index={i} />)
            ) : (
              <p className="text-text-secondary text-sm">No news available right now.</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Holding Modal */}
      <AddHoldingModal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        onAdded={refetchHoldings}
      />

      {/* Stock Detail Modal */}
      {selectedStock && (
        <StockDetailModal
          symbol={selectedStock}
          onClose={() => setSelectedStock(null)}
        />
      )}
    </div>
  )
}

export default Dashboard
