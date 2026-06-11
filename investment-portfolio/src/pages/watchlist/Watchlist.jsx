import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdAdd, MdDelete, MdBookmarks, MdTrendingUp, MdTrendingDown, MdSearch, MdRefresh } from 'react-icons/md'
import { useApi } from '../../hooks/useApi'
import { watchlistService, marketService } from '../../services/apiServices'
import {
  AreaChart, Area, ResponsiveContainer, Tooltip
} from 'recharts'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import StockDetailModal from '../../components/ui/StockDetailModal'
import toast from 'react-hot-toast'

// Fetch real price + 1-month history for a symbol
const useStockWithHistory = (symbol) => {
  const [price, setPrice] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    if (!symbol) return
    setLoading(true)
    Promise.all([
      marketService.getStock(symbol).catch(() => null),
      marketService.getStockHistory(symbol, '1mo').catch(() => null),
    ]).then(([priceRes, histRes]) => {
      if (priceRes?.data) setPrice(priceRes.data)
      const raw = histRes?.data?.data || []
      setHistory(raw.map(d => ({ v: d.close })))
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [symbol])
  return { price, history, loading, refetch: fetch }
}

// ── Watchlist Card ────────────────────────────────────────────────────────────
const WatchlistCard = ({ item, onRemove, onView }) => {
  const symbol = item.stock_symbol || item.symbol || ''
  const { price, history, loading } = useStockWithHistory(symbol)

  const livePrice = price?.price || 0
  const changePct = price?.change_pct || 0
  const pos = changePct >= 0
  const color = pos ? '#00c853' : '#ff5252'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      className="bg-card border border-border-subtle rounded-2xl p-4 hover:border-accent/30 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <button onClick={() => onView(symbol)} className="text-left">
          <div className="font-semibold text-white text-sm group-hover:text-accent transition-colors">{symbol}</div>
          <div className="text-text-secondary text-xs">{price?.name || symbol}</div>
        </button>
        <button onClick={() => onRemove(item.id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-all">
          <MdDelete className="text-base" />
        </button>
      </div>

      <div className="flex items-end justify-between">
        <div>
          {loading ? (
            <div className="space-y-1">
              <div className="skeleton h-6 w-24" />
              <div className="skeleton h-4 w-16" />
            </div>
          ) : (
            <>
              <div className="font-display font-bold text-white text-xl">
                {livePrice ? `₹${livePrice.toLocaleString('en-IN')}` : '—'}
              </div>
              <div className={`flex items-center gap-0.5 text-sm font-medium ${pos ? 'text-success' : 'text-danger'}`}>
                {pos ? <MdTrendingUp className="text-sm" /> : <MdTrendingDown className="text-sm" />}
                {pos ? '+' : ''}{changePct.toFixed(2)}%
              </div>
            </>
          )}
        </div>

        {/* Mini chart */}
        <div className="w-28 h-14">
          {!loading && history.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id={`g-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2}
                  fill={`url(#g-${symbol})`} dot={false} />
                <Tooltip contentStyle={{ display: 'none' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : loading ? (
            <div className="skeleton w-full h-full rounded-lg" />
          ) : null}
        </div>
      </div>

      {/* Prev close */}
      {!loading && price?.prev_close && (
        <div className="mt-2 pt-2 border-t border-border-subtle/50 flex justify-between text-xs text-text-secondary">
          <span>Prev Close</span>
          <span className="font-mono">₹{price.prev_close.toLocaleString('en-IN')}</span>
        </div>
      )}
    </motion.div>
  )
}

// ── Watchlist Page ────────────────────────────────────────────────────────────
const Watchlist = () => {
  const { data: list, loading, execute: refetch, setData: setList } = useApi(
    watchlistService.getWatchlist, [], { defaultData: [] }
  )
  const [modal, setModal] = useState(false)
  const [newSymbol, setNewSymbol] = useState('')
  const [adding, setAdding] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedStock, setSelectedStock] = useState(null)

  const handleAdd = async () => {
    if (!newSymbol.trim()) return toast.error('Enter a stock symbol')
    setAdding(true)
    try {
      await watchlistService.addStock(newSymbol.trim().toUpperCase())
      await refetch()
      setModal(false)
      setNewSymbol('')
      toast.success(`${newSymbol.toUpperCase()} added to watchlist`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add stock')
    } finally { setAdding(false) }
  }

  const handleRemove = async (id) => {
    try {
      await watchlistService.removeStock(id)
      setList(p => (p || []).filter(s => s.id !== id))
      toast.success('Removed from watchlist')
    } catch { toast.error('Failed to remove') }
  }

  const items = list || []
  const filtered = items.filter(s =>
    (s.stock_symbol || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-72">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-lg" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Filter watchlist..." className="input-field pl-10 text-sm" />
        </div>
        <button onClick={refetch}
          className="p-2.5 bg-card border border-border-subtle rounded-xl text-text-secondary hover:text-accent hover:border-accent/50 transition-all">
          <MdRefresh className={`text-xl ${loading ? 'animate-spin' : ''}`} />
        </button>
        <Button onClick={() => setModal(true)} icon={<MdAdd />}>Add Stock</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Watching', value: items.length },
          { label: 'Up Today', value: '—' },
          { label: 'Down Today', value: '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card border border-border-subtle rounded-2xl p-4 text-center">
            <div className="font-display font-bold text-2xl text-white">{value}</div>
            <div className="text-text-secondary text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Cards */}
      {loading && items.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border-subtle rounded-2xl p-4 h-40 skeleton" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={MdBookmarks}
          title="Your watchlist is empty"
          description="Add NSE stocks to track live prices and charts."
          action={<Button onClick={() => setModal(true)} icon={<MdAdd />}>Add First Stock</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map(item => (
              <WatchlistCard
                key={item.id}
                item={item}
                onRemove={handleRemove}
                onView={setSelectedStock}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add to Watchlist">
        <div className="space-y-4">
          <div>
            <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">NSE Stock Symbol</label>
            <input value={newSymbol} onChange={e => setNewSymbol(e.target.value.toUpperCase())}
              placeholder="e.g. RELIANCE, TCS, INFY" className="input-field"
              onKeyDown={e => e.key === 'Enter' && handleAdd()} />
            <p className="text-text-secondary text-xs mt-2">
              Live price and 1-month chart will load automatically.
            </p>
          </div>
          <div className="flex gap-3 pt-1">
            <Button variant="ghost" onClick={() => setModal(false)} className="flex-1 justify-center">Cancel</Button>
            <Button onClick={handleAdd} loading={adding} className="flex-1 justify-center">Add to Watchlist</Button>
          </div>
        </div>
      </Modal>

      {/* Stock Detail Modal */}
      {selectedStock && (
        <StockDetailModal symbol={selectedStock} onClose={() => setSelectedStock(null)} />
      )}
    </div>
  )
}

export default Watchlist
