import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdAdd, MdDelete, MdBookmarks, MdTrendingUp, MdTrendingDown, MdSearch } from 'react-icons/md'
import { useApi } from '../../hooks/useApi'
import { watchlistService } from '../../services/apiServices'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

const miniData = (positive) =>
  Array.from({ length: 12 }, (_, i) => ({ v: positive ? 40 + i * 4 + Math.random() * 10 : 80 - i * 3 + Math.random() * 10 }))

const WatchlistCard = ({ item, onRemove }) => {
  const pos = (item.change || 0) >= 0
  const data = miniData(pos)
  const price = item.price || 0
  const symbol = item.stock_symbol || item.symbol || ''
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
      className="bg-card border border-border-subtle rounded-2xl p-4 hover:border-accent/30 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-semibold text-white text-sm">{symbol}</div>
          <div className="text-text-secondary text-xs">{item.name || symbol}</div>
        </div>
        <button onClick={() => onRemove(item.id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-all">
          <MdDelete className="text-base" />
        </button>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="font-display font-bold text-white text-lg">
            {price ? `₹${price.toLocaleString('en-IN')}` : '—'}
          </div>
          <div className={`flex items-center gap-0.5 text-sm font-medium ${pos ? 'text-success' : 'text-danger'}`}>
            {pos ? <MdTrendingUp /> : <MdTrendingDown />}
            {pos ? '+' : ''}{(item.change || 0).toFixed(2)}%
          </div>
        </div>
        <div className="w-28 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}><Line type="monotone" dataKey="v" stroke={pos ? '#00c853' : '#ff5252'} strokeWidth={2} dot={false} /></LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}

const Watchlist = () => {
  const { data: list, loading, execute: refetch, setData: setList } = useApi(watchlistService.getWatchlist, [], { defaultData: [] })
  const [modal, setModal] = useState(false)
  const [newSymbol, setNewSymbol] = useState('')
  const [adding, setAdding] = useState(false)
  const [search, setSearch] = useState('')

  const handleAdd = async () => {
    if (!newSymbol.trim()) return toast.error('Enter a stock symbol')
    setAdding(true)
    try {
      await watchlistService.addStock(newSymbol.trim())
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
    } catch { toast.error('Failed to remove stock') }
  }

  const items = list || []
  const filtered = items.filter(s =>
    (s.stock_symbol || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-72">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-lg" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter watchlist..." className="input-field pl-10 text-sm" />
        </div>
        <Button onClick={() => setModal(true)} icon={<MdAdd />}>Add Stock</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Stocks', value: items.length },
          { label: 'Gainers', value: items.filter(s => (s.change || 0) > 0).length },
          { label: 'Losers', value: items.filter(s => (s.change || 0) < 0).length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card border border-border-subtle rounded-2xl p-4 text-center">
            <div className="font-display font-bold text-2xl text-white">{value}</div>
            <div className="text-text-secondary text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({length:4}).map((_,i)=><div key={i} className="bg-card border border-border-subtle rounded-2xl p-4 h-36 skeleton"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={MdBookmarks} title="Your watchlist is empty"
          description="Add stocks to track their performance."
          action={<Button onClick={() => setModal(true)} icon={<MdAdd />}>Add First Stock</Button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map(item => <WatchlistCard key={item.id} item={item} onRemove={handleRemove} />)}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add to Watchlist">
        <div className="space-y-4">
          <div>
            <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">Stock Symbol (NSE)</label>
            <input value={newSymbol} onChange={e => setNewSymbol(e.target.value.toUpperCase())}
              placeholder="e.g. RELIANCE, TCS, INFY" className="input-field"
              onKeyDown={e => e.key === 'Enter' && handleAdd()} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModal(false)} className="flex-1 justify-center">Cancel</Button>
            <Button onClick={handleAdd} loading={adding} className="flex-1 justify-center">Add to Watchlist</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Watchlist
