import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { MdShowChart, MdPieChart, MdAdd, MdSync, MdAccountBalance, MdInfo } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { useAutoSync } from '../../hooks/useAutoSync'
import { portfolioService } from '../../services/apiServices'
import AllocationPieChart from '../../components/charts/AllocationPieChart'
import PortfolioChart from '../../components/charts/PortfolioChart'
import PnLBarChart from '../../components/charts/PnLBarChart'
import HoldingsTable from '../../components/tables/HoldingsTable'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import StockDetailModal from '../../components/ui/StockDetailModal'
import { CardSkeleton } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

// ── Add manual holding modal (only for non-integrated brokers) ────────────────
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
      toast.success(`${form.stock_symbol.toUpperCase()} added`)
      setForm({ stock_symbol: '', quantity: '', average_price: '' })
      onAdded()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add holding')
    } finally { setSaving(false) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Manual Holding">
      <div className="space-y-4">
        <div className="flex items-start gap-3 bg-warning/5 border border-warning/20 rounded-xl p-3 text-xs text-text-secondary">
          <MdInfo className="text-warning flex-shrink-0 mt-0.5 text-base" />
          <span>
            For connected brokers (Zerodha, Upstox), holdings sync automatically.
            Use this only for brokers not yet integrated.
          </span>
        </div>
        <div>
          <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">NSE Symbol</label>
          <input value={form.stock_symbol}
            onChange={e => setForm(p => ({ ...p, stock_symbol: e.target.value.toUpperCase() }))}
            placeholder="e.g. RELIANCE, TCS" className="input-field" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">Quantity</label>
            <input type="number" value={form.quantity}
              onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
              placeholder="10" className="input-field" />
          </div>
          <div>
            <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">Buy Price (₹)</label>
            <input type="number" value={form.average_price}
              onChange={e => setForm(p => ({ ...p, average_price: e.target.value }))}
              placeholder="2400" className="input-field" />
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <Button variant="ghost" onClick={onClose} className="flex-1 justify-center">Cancel</Button>
          <Button onClick={handleAdd} loading={saving} className="flex-1 justify-center">Add Holding</Button>
        </div>
      </div>
    </Modal>
  )
}

const StatRow = ({ label, value, positive }) => (
  <div className="flex items-center justify-between py-3 border-b border-border-subtle/50 last:border-0">
    <span className="text-text-secondary text-sm">{label}</span>
    <div className={`font-semibold font-mono text-sm ${positive === true ? 'text-success' : positive === false ? 'text-danger' : 'text-white'}`}>
      {value}
    </div>
  </div>
)

// ── Portfolio Page ────────────────────────────────────────────────────────────
const Portfolio = () => {
  const [addModal, setAddModal] = useState(false)
  const [selectedStock, setSelectedStock] = useState(null)

  const { data: holdings, loading: hLoading, execute: refetch } = useApi(
    portfolioService.getHoldings, [], { defaultData: [] }
  )
  const { data: perfData, loading: pLoading } = useApi(
    portfolioService.getPerformance, [], { defaultData: null }
  )

  const handlePriceUpdate = useCallback(() => refetch(), [refetch])
  const { syncing, lastSyncStr, syncBrokers } = useAutoSync(handlePriceUpdate, 60_000)

  const list = holdings || []
  const brokerHoldings = list.filter(h => h.source === 'broker')
  const manualHoldings = list.filter(h => h.source !== 'broker')

  const totalInvestment = list.reduce((s, h) => s + (h.avgCost || 0) * (h.qty || 0), 0)
  const currentValue    = list.reduce((s, h) => s + (h.cmp || h.avgCost || 0) * (h.qty || 0), 0)
  const totalPnl        = currentValue - totalInvestment
  const totalPnlPct     = totalInvestment ? (totalPnl / totalInvestment * 100) : 0
  const dayPnl          = list.reduce((s, h) => s + (h.dayPnl || 0), 0)

  const chartData = perfData?.data || []

  // Build allocation from actual holdings
  const allocation = list.length > 0 && currentValue > 0
    ? list.map(h => ({
        name: h.symbol,
        value: Math.round(((h.cmp || h.avgCost) * h.qty / currentValue) * 100),
      })).filter(a => a.value > 0)
    : []

  const monthlyPnl = chartData.length >= 2
    ? chartData.map((d, i) => ({
        month: d.date,
        pnl: i === 0 ? 0 : Math.round(d.value - chartData[i - 1].value),
      })).slice(1)
    : []

  const handleDeleteHolding = async (id) => {
    try {
      await portfolioService.deleteHolding(id)
      toast.success('Holding removed')
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to remove')
    }
  }

  const handleSync = async () => {
    toast.promise(syncBrokers(), {
      loading: 'Syncing from brokers...',
      success: 'Holdings synced!',
      error: 'Sync failed',
    })
    setTimeout(() => refetch(), 1500)
  }

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {hLoading ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />) : (
          <>
            {[
              { label: 'Invested', value: `₹${totalInvestment.toLocaleString('en-IN')}` },
              { label: 'Current Value', value: `₹${currentValue.toLocaleString('en-IN')}`,
                sub: `${totalPnlPct >= 0 ? '+' : ''}${totalPnlPct.toFixed(2)}%`,
                positive: totalPnlPct >= 0 },
              { label: 'Total P&L', value: `${totalPnl >= 0 ? '+' : ''}₹${Math.abs(totalPnl).toLocaleString('en-IN')}`,
                positive: totalPnl >= 0 },
              { label: 'Day P&L', value: `${dayPnl >= 0 ? '+' : ''}₹${Math.abs(dayPnl).toLocaleString('en-IN')}`,
                positive: dayPnl >= 0 },
            ].map(({ label, value, sub, positive }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-card border border-border-subtle rounded-2xl p-5 hover:border-accent/30 transition-all">
                <div className="text-text-secondary text-xs uppercase tracking-wider mb-2">{label}</div>
                <div className={`font-display font-bold text-xl ${positive === true ? 'text-success' : positive === false ? 'text-danger' : 'text-white'}`}>
                  {value}
                </div>
                {sub && <div className={`text-xs mt-1 ${positive === true ? 'text-success' : 'text-danger'}`}>{sub}</div>}
              </motion.div>
            ))}
          </>
        )}
      </div>

      {/* Broker sync status */}
      <div className="flex items-center justify-between bg-card border border-border-subtle rounded-2xl px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${syncing ? 'bg-warning animate-pulse' : 'bg-success'}`} />
          <div>
            <div className="text-white text-sm font-medium">
              {brokerHoldings.length > 0
                ? `${brokerHoldings.length} holdings from broker${brokerHoldings.length !== 1 ? 's' : ''}`
                : 'No broker holdings yet'}
              {manualHoldings.length > 0 && ` · ${manualHoldings.length} manual`}
            </div>
            <div className="text-text-secondary text-xs">
              {syncing ? 'Syncing...' : lastSyncStr ? `Last updated ${lastSyncStr}` : 'Auto-syncs every minute'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {list.length === 0 && (
            <Link to="/brokers">
              <Button size="sm" icon={<MdAccountBalance />} variant="ghost">Connect Broker</Button>
            </Link>
          )}
          <Button
            size="sm"
            variant="ghost"
            icon={<MdSync className={syncing ? 'animate-spin' : ''} />}
            onClick={handleSync}
            loading={syncing}
          >
            Sync Now
          </Button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border-subtle rounded-2xl p-5">
          <h3 className="font-display font-bold text-white text-base mb-4 flex items-center gap-2">
            <MdShowChart className="text-accent" /> Portfolio Growth
          </h3>
          {pLoading ? (
            <div className="skeleton w-full h-52 rounded-xl" />
          ) : chartData.length > 0 ? (
            <PortfolioChart data={chartData} />
          ) : (
            <div className="h-52 flex items-center justify-center text-text-secondary text-sm">
              Connect a broker or add holdings to see performance
            </div>
          )}
        </div>

        <div className="bg-card border border-border-subtle rounded-2xl p-5">
          <h3 className="font-display font-bold text-white text-base mb-2 flex items-center gap-2">
            <MdPieChart className="text-accent" /> Portfolio Allocation
          </h3>
          {allocation.length > 0 ? (
            <AllocationPieChart data={allocation} />
          ) : (
            <div className="h-48 flex items-center justify-center text-text-secondary text-sm">
              Holdings required
            </div>
          )}
        </div>
      </div>

      {monthlyPnl.length > 0 && (
        <div className="bg-card border border-border-subtle rounded-2xl p-5">
          <h3 className="font-display font-bold text-white text-base mb-4">Monthly P&L</h3>
          <PnLBarChart data={monthlyPnl} />
        </div>
      )}

      {/* Holdings table */}
      <div className="bg-card border border-border-subtle rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 p-5 border-b border-border-subtle">
          <h3 className="font-display font-bold text-white text-base flex-1">Holdings</h3>
          <span className="text-text-secondary text-xs">{list.length} stocks</span>
          <Button onClick={() => setAddModal(true)} icon={<MdAdd />} size="sm" variant="ghost">
            Add Manual
          </Button>
        </div>
        <HoldingsTable
          holdings={list}
          loading={hLoading}
          onRowClick={setSelectedStock}
          onDelete={handleDeleteHolding}
        />
      </div>

      {/* Metrics */}
      {list.length > 0 && (
        <div className="bg-card border border-border-subtle rounded-2xl p-5">
          <h3 className="font-display font-bold text-white text-base mb-2">Portfolio Metrics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <StatRow label="Total Holdings" value={list.length} />
            <StatRow label="Broker Synced" value={brokerHoldings.length} />
            <StatRow label="Total Invested" value={`₹${totalInvestment.toLocaleString('en-IN')}`} />
            <StatRow label="Current Value" value={`₹${currentValue.toLocaleString('en-IN')}`} />
            <StatRow label="Overall P&L"
              value={`${totalPnl >= 0 ? '+' : ''}₹${Math.abs(totalPnl).toLocaleString('en-IN')}`}
              positive={totalPnl >= 0} />
            <StatRow label="Overall Return"
              value={`${totalPnlPct >= 0 ? '+' : ''}${totalPnlPct.toFixed(2)}%`}
              positive={totalPnlPct >= 0} />
          </div>
        </div>
      )}

      <AddHoldingModal isOpen={addModal} onClose={() => setAddModal(false)} onAdded={refetch} />
      {selectedStock && <StockDetailModal symbol={selectedStock} onClose={() => setSelectedStock(null)} />}
    </div>
  )
}

export default Portfolio
