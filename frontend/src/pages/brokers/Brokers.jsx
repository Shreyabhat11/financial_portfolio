import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdCheck, MdLinkOff, MdShield, MdFlashOn, MdAccountBalance,
  MdTrendingUp, MdTrendingDown, MdRefresh, MdOpenInNew,
  MdClose, MdSwapHoriz, MdInfoOutline
} from 'react-icons/md'
import { useApi } from '../../hooks/useApi'
import { brokersService } from '../../services/apiServices'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import StockDetailModal from '../../components/ui/StockDetailModal'
import toast from 'react-hot-toast'
import { useLocation } from 'react-router-dom'

// ─── Broker catalogue ─────────────────────────────────────────────────────────
const BROKER_INFO = {
  zerodha: {
    name: 'Zerodha',
    tagline: "India's #1 discount broker",
    color: 'from-blue-600/20 to-blue-800/10',
    borderColor: 'border-blue-500/30',
    accentColor: 'text-blue-400',
    logo: (
      <svg viewBox="0 0 40 40" className="w-10 h-10">
        <rect width="40" height="40" rx="10" fill="#387ED1"/>
        <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle"
          fill="white" fontSize="14" fontWeight="bold">Z</text>
      </svg>
    ),
    authType: 'oauth',
    features: ['Instant order execution', 'Kite Connect API', 'Auto holdings sync', 'Options & F&O support'],
    note: 'Official OAuth — most secure connection method',
  },
  upstox: {
    name: 'Upstox',
    tagline: 'Next-gen trading platform',
    color: 'from-purple-600/20 to-purple-800/10',
    borderColor: 'border-purple-500/30',
    accentColor: 'text-purple-400',
    logo: (
      <svg viewBox="0 0 40 40" className="w-10 h-10">
        <rect width="40" height="40" rx="10" fill="#6C3FC5"/>
        <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle"
          fill="white" fontSize="14" fontWeight="bold">U</text>
      </svg>
    ),
    authType: 'oauth',
    features: ['Fast API execution', 'V2 REST API', 'Real-time data', 'Delivery & intraday'],
    note: 'Official OAuth — secure connection',
  },
  groww: {
    name: 'Groww',
    tagline: 'Commission-free investing',
    color: 'from-green-600/20 to-green-800/10',
    borderColor: 'border-green-500/30',
    accentColor: 'text-green-400',
    logo: (
      <svg viewBox="0 0 40 40" className="w-10 h-10">
        <rect width="40" height="40" rx="10" fill="#00D09C"/>
        <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle"
          fill="white" fontSize="14" fontWeight="bold">G</text>
      </svg>
    ),
    authType: 'manual',
    features: ['Zero brokerage on equity', 'Mutual funds & ETFs', 'SIP automation'],
    note: 'API access via manual token — coming soon',
    comingSoon: true,
  },
  angel: {
    name: 'Angel One',
    tagline: 'Full-service with AI tools',
    color: 'from-orange-600/20 to-orange-800/10',
    borderColor: 'border-orange-500/30',
    accentColor: 'text-orange-400',
    logo: (
      <svg viewBox="0 0 40 40" className="w-10 h-10">
        <rect width="40" height="40" rx="10" fill="#F26522"/>
        <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle"
          fill="white" fontSize="14" fontWeight="bold">A</text>
      </svg>
    ),
    authType: 'manual',
    features: ['SmartAPI access', 'Options analytics', 'Advisory services'],
    note: 'SmartAPI token connection — coming soon',
    comingSoon: true,
  },
}

// ─── Connected broker card ────────────────────────────────────────────────────
const ConnectedBrokerCard = ({ broker, onDisconnect, onTrade }) => {
  const info = BROKER_INFO[broker.broker_name] || {
    name: broker.broker_name, color: 'from-gray-600/20 to-gray-800/10',
    borderColor: 'border-gray-500/30', accentColor: 'text-gray-400',
    logo: <div className="w-10 h-10 rounded-xl bg-card-dark flex items-center justify-center text-white font-bold">{broker.broker_name[0].toUpperCase()}</div>,
  }
  const [funds, setFunds] = useState(null)
  const [holdings, setHoldings] = useState([])
  const [showHoldings, setShowHoldings] = useState(false)
  const [loadingFunds, setLoadingFunds] = useState(true)

  useEffect(() => {
    if (broker.status === 'active') {
      setLoadingFunds(true)
      brokersService.getBrokerFunds(broker.id)
        .then(r => setFunds(r.data))
        .catch(() => {})
        .finally(() => setLoadingFunds(false))
    } else {
      setLoadingFunds(false)
    }
  }, [broker.id, broker.status])

  const loadHoldings = async () => {
    if (holdings.length > 0) { setShowHoldings(p => !p); return }
    try {
      const r = await brokersService.getBrokerHoldings(broker.id)
      setHoldings(r.data?.holdings || [])
      setShowHoldings(true)
    } catch {
      toast.error('Failed to fetch holdings')
    }
  }

  const isExpired = broker.status === 'token_expired'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${info.color} border ${isExpired ? 'border-warning/30' : info.borderColor} rounded-2xl p-5 transition-all`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {info.logo}
          <div>
            <div className="font-semibold text-white text-base">{info.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isExpired ? (
                <span className="text-warning text-xs flex items-center gap-1">
                  <MdInfoOutline className="text-sm" /> Session expired — reconnect
                </span>
              ) : (
                <span className="text-success text-xs flex items-center gap-1">
                  <MdCheck className="text-sm" /> Connected
                </span>
              )}
              {!isExpired && (
                <span className="text-border-subtle text-xs">·</span>
              )}
              {!isExpired && (
                <span className="text-text-secondary text-xs">{broker.broker_user_id}</span>
              )}
            </div>
          </div>
        </div>
        <button onClick={() => onDisconnect(broker.id, info.name)}
          className="p-2 rounded-xl text-text-secondary hover:text-danger hover:bg-danger/10 transition-all"
          title="Disconnect">
          <MdLinkOff className="text-lg" />
        </button>
      </div>

      {/* Funds */}
      {!isExpired && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {loadingFunds ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-black/20 rounded-xl p-3 text-center">
                <div className="skeleton h-5 w-16 mx-auto mb-1" />
                <div className="skeleton h-3 w-12 mx-auto" />
              </div>
            ))
          ) : funds ? (
            <>
              {[
                { label: 'Available', value: `₹${Math.round(funds.available_cash || 0).toLocaleString('en-IN')}` },
                { label: 'Used', value: `₹${Math.round(funds.used_margin || 0).toLocaleString('en-IN')}` },
                { label: 'Total', value: `₹${Math.round(funds.total_balance || 0).toLocaleString('en-IN')}` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-black/20 rounded-xl p-3 text-center">
                  <div className="text-white font-mono font-semibold text-sm">{value}</div>
                  <div className="text-text-secondary text-xs mt-0.5">{label}</div>
                </div>
              ))}
            </>
          ) : (
            <div className="col-span-3 text-text-secondary text-xs text-center py-2">Fund data unavailable</div>
          )}
        </div>
      )}

      {/* Actions */}
      {!isExpired && (
        <div className="flex gap-2">
          <button
            onClick={loadHoldings}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-black/20 hover:bg-black/30 text-text-secondary hover:text-white text-xs font-medium transition-all">
            <MdRefresh className="text-sm" /> {showHoldings ? 'Hide' : 'View'} Holdings
          </button>
          <button
            onClick={() => onTrade(broker)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all
              bg-accent/15 hover:bg-accent/25 ${info.accentColor}`}>
            <MdSwapHoriz className="text-sm" /> Trade
          </button>
        </div>
      )}

      {/* Holdings list */}
      <AnimatePresence>
        {showHoldings && holdings.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">
                Live Holdings ({holdings.length})
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {holdings.map(h => (
                  <div key={h.symbol} className="flex items-center justify-between text-sm">
                    <span className="text-white font-medium">{h.symbol}</span>
                    <div className="flex items-center gap-3 text-right">
                      <span className="text-text-secondary text-xs">{h.qty} × ₹{h.avg_price?.toFixed(0)}</span>
                      <span className={`font-mono text-xs font-semibold ${h.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                        {h.pnl >= 0 ? '+' : ''}₹{Math.abs(h.pnl || 0).toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Trade Modal ──────────────────────────────────────────────────────────────
const TradeModal = ({ isOpen, onClose, broker, connectedBrokers }) => {
  const [symbol, setSymbol] = useState('')
  const [qty, setQty] = useState('')
  const [side, setSide] = useState('BUY')
  const [orderType, setOrderType] = useState('MARKET')
  const [price, setPrice] = useState('')
  const [useFastest, setUseFastest] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [stockModal, setStockModal] = useState(null)

  const handlePlace = async () => {
    if (!symbol || !qty) return toast.error('Enter symbol and quantity')
    if (orderType === 'LIMIT' && !price) return toast.error('Enter limit price')
    setPlacing(true)
    try {
      const payload = {
        symbol: symbol.toUpperCase(),
        qty: parseInt(qty),
        side,
        order_type: orderType,
        price: orderType === 'LIMIT' ? parseFloat(price) : 0,
        broker_id: useFastest ? null : broker?.id,
      }
      const res = await brokersService.placeOrder(payload)
      toast.success(
        `${side} order placed via ${res.data.broker_used}! Order ID: ${res.data.order_id}`,
        { duration: 5000 }
      )
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Order placement failed')
    } finally { setPlacing(false) }
  }

  const estimatedValue = qty && price ? parseFloat(qty) * parseFloat(price) : null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Place Order" size="md">
      <div className="space-y-4">
        {/* Auto-route info */}
        <div className="flex items-start gap-3 bg-accent/5 border border-accent/20 rounded-xl p-3">
          <MdFlashOn className="text-accent text-lg flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-white text-sm font-medium">Smart Order Routing</div>
            <div className="text-text-secondary text-xs mt-0.5">
              Your order is automatically sent to the fastest available broker (Zerodha &rarr; Upstox &rarr; others).
            </div>
          </div>
        </div>

        {/* Symbol */}
        <div>
          <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">NSE Symbol</label>
          <div className="flex gap-2">
            <input value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g. RELIANCE" className="input-field flex-1" />
            {symbol.length >= 2 && (
              <button onClick={() => setStockModal(symbol)}
                className="px-3 rounded-xl border border-border-subtle text-text-secondary hover:text-accent hover:border-accent/50 text-xs transition-all">
                Chart
              </button>
            )}
          </div>
        </div>

        {/* Side */}
        <div>
          <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">Action</label>
          <div className="grid grid-cols-2 gap-2">
            {['BUY', 'SELL'].map(s => (
              <button key={s} onClick={() => setSide(s)}
                className={`py-3 rounded-xl font-bold text-sm border transition-all flex items-center justify-center gap-2 ${
                  side === s
                    ? s === 'BUY'
                      ? 'bg-success/15 border-success/40 text-success'
                      : 'bg-danger/15 border-danger/40 text-danger'
                    : 'border-border-subtle text-text-secondary hover:border-accent/30'
                }`}>
                {s === 'BUY' ? <MdTrendingUp /> : <MdTrendingDown />} {s}
              </button>
            ))}
          </div>
        </div>

        {/* Order type + qty */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">Order Type</label>
            <div className="flex gap-1">
              {['MARKET', 'LIMIT'].map(t => (
                <button key={t} onClick={() => setOrderType(t)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    orderType === t ? 'bg-accent text-black border-accent' : 'border-border-subtle text-text-secondary hover:border-accent/30'
                  }`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">Quantity</label>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)}
              placeholder="0" className="input-field text-center font-mono" />
          </div>
        </div>

        {/* Limit price */}
        {orderType === 'LIMIT' && (
          <div>
            <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">Limit Price (₹)</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)}
              placeholder="Enter price" className="input-field font-mono" />
          </div>
        )}

        {/* Estimated value */}
        {estimatedValue && (
          <div className="bg-card-dark border border-border-subtle rounded-xl px-4 py-2.5 flex justify-between text-sm">
            <span className="text-text-secondary">Estimated Value</span>
            <span className="text-white font-mono font-semibold">₹{estimatedValue.toLocaleString('en-IN')}</span>
          </div>
        )}

        {/* Broker selection */}
        {connectedBrokers.length > 1 && (
          <div>
            <label className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2 block">Execution Broker</label>
            <div className="space-y-2">
              <button onClick={() => setUseFastest(true)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-sm ${
                  useFastest ? 'border-accent/40 bg-accent/5 text-accent' : 'border-border-subtle text-text-secondary hover:border-accent/20'
                }`}>
                <MdFlashOn className={useFastest ? 'text-accent' : 'text-text-secondary'} />
                <div className="text-left">
                  <div className={`font-medium ${useFastest ? 'text-accent' : 'text-white'}`}>Automatic — Fastest Available</div>
                  <div className="text-text-secondary text-xs">System selects best broker for speed</div>
                </div>
                {useFastest && <MdCheck className="ml-auto text-accent" />}
              </button>
              {connectedBrokers.filter(b => b.status === 'active').map(b => {
                const info = BROKER_INFO[b.broker_name] || { name: b.broker_name }
                return (
                  <button key={b.id} onClick={() => { setUseFastest(false) }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-sm ${
                      !useFastest && broker?.id === b.id ? 'border-accent/40 bg-accent/5' : 'border-border-subtle text-text-secondary hover:border-accent/20'
                    }`}>
                    <span className={info.accentColor || 'text-text-secondary'}>{info.name}</span>
                    {!useFastest && broker?.id === b.id && <MdCheck className="ml-auto text-accent" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="flex items-start gap-2 text-xs text-text-secondary bg-card-dark border border-border-subtle rounded-xl p-3">
          <MdShield className="text-warning flex-shrink-0 mt-0.5" />
          <span>Orders execute at live market prices. Delivery orders are held in your Demat account. Verify details before confirming.</span>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1 justify-center">Cancel</Button>
          <Button
            onClick={handlePlace}
            loading={placing}
            className={`flex-1 justify-center font-bold ${
              side === 'SELL' ? 'bg-danger hover:bg-danger/80 text-white' : ''
            }`}>
            Confirm {side}
          </Button>
        </div>
      </div>

      {stockModal && <StockDetailModal symbol={stockModal} onClose={() => setStockModal(null)} />}
    </Modal>
  )
}

// ─── Brokers Page ─────────────────────────────────────────────────────────────
const Brokers = () => {
  const location = useLocation()
  const { data: connectedRaw, loading, execute: refetch } = useApi(
    brokersService.getBrokers, [], { defaultData: [] }
  )
  const [tradeModal, setTradeModal] = useState(false)
  const [tradeBroker, setTradeBroker] = useState(null)
  const [connecting, setConnecting] = useState(null)

  const connected = connectedRaw || []
  const connectedNames = connected.map(c => c.broker_name)
  const availableBrokers = Object.entries(BROKER_INFO).filter(([key]) => !connectedNames.includes(key))

  // Handle OAuth callback redirects
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const justConnected = params.get('connected')
    const error = params.get('error')
    if (justConnected) {
      toast.success(`${justConnected} connected successfully!`)
      refetch()
      window.history.replaceState({}, '', '/brokers')
    }
    if (error) {
      toast.error(`Connection failed: ${params.get('msg') || error}`)
      window.history.replaceState({}, '', '/brokers')
    }
  }, [location.search])

  const handleConnect = async (brokerKey) => {
    const info = BROKER_INFO[brokerKey]
    if (info.comingSoon) {
      toast('Coming soon! We are working on ' + info.name + ' integration.', { icon: '🔧' })
      return
    }
    setConnecting(brokerKey)
    try {
      let res
      if (brokerKey === 'zerodha') {
        res = await brokersService.getZerodhaLoginUrl()
      } else if (brokerKey === 'upstox') {
        res = await brokersService.getUpstoxLoginUrl()
      } else {
        toast('This broker uses manual token setup.', { icon: 'ℹ️' })
        return
      }
      // Open OAuth in same tab — broker will redirect back
      window.location.href = res.data.login_url
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not start connection')
    } finally { setConnecting(null) }
  }

  const handleDisconnect = async (id, name) => {
    if (!window.confirm(`Disconnect ${name}? You will need to reconnect to trade.`)) return
    try {
      await brokersService.disconnectBroker(id)
      refetch()
      toast.success(`${name} disconnected`)
    } catch { toast.error('Failed to disconnect') }
  }

  const handleTrade = (broker) => {
    setTradeBroker(broker)
    setTradeModal(true)
  }

  const activeBrokers = connected.filter(b => b.status === 'active')

  return (
    <div className="space-y-8">

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Connected', value: connected.length, color: 'text-accent' },
          { label: 'Active', value: activeBrokers.length, color: 'text-success' },
          { label: 'Trade Ready', value: activeBrokers.length > 0 ? 'Yes' : 'No', color: activeBrokers.length > 0 ? 'text-success' : 'text-danger' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border-subtle rounded-2xl p-5 text-center">
            <div className={`font-display font-bold text-3xl ${color}`}>{value}</div>
            <div className="text-text-secondary text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick Trade button */}
      {activeBrokers.length > 0 && (
        <motion.button
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          onClick={() => { setTradeBroker(null); setTradeModal(true) }}
          className="w-full flex items-center justify-between bg-gradient-to-r from-accent/10 to-success/10 border border-accent/25 rounded-2xl p-5 hover:border-accent/40 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <MdSwapHoriz className="text-accent text-2xl" />
            </div>
            <div className="text-left">
              <div className="font-display font-bold text-white text-base">Place a Trade</div>
              <div className="text-text-secondary text-sm">
                Smart routing via {activeBrokers.map(b => BROKER_INFO[b.broker_name]?.name || b.broker_name).join(' · ')}
              </div>
            </div>
          </div>
          <MdFlashOn className="text-accent text-2xl group-hover:scale-110 transition-transform" />
        </motion.button>
      )}

      {/* Connected brokers */}
      {connected.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-white text-base">Your Brokers</h2>
            <button onClick={refetch} className="p-2 rounded-lg text-text-secondary hover:text-accent transition-colors">
              <MdRefresh className={`text-lg ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connected.map(broker => (
              <ConnectedBrokerCard
                key={broker.id}
                broker={broker}
                onDisconnect={handleDisconnect}
                onTrade={handleTrade}
              />
            ))}
          </div>
        </section>
      )}

      {/* Available to connect */}
      <section>
        <h2 className="font-display font-bold text-white text-base mb-4">
          {connected.length > 0 ? 'Add Another Broker' : 'Connect Your Broker'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {availableBrokers.map(([key, info]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className={`bg-gradient-to-br ${info.color} border ${info.borderColor} rounded-2xl p-5 transition-all
                ${info.comingSoon ? 'opacity-60' : 'hover:scale-[1.01] cursor-pointer'}`}
              onClick={() => !info.comingSoon && handleConnect(key)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {info.logo}
                  <div>
                    <div className="font-semibold text-white">{info.name}</div>
                    <div className="text-text-secondary text-xs">{info.tagline}</div>
                  </div>
                </div>
                {info.comingSoon ? (
                  <span className="text-xs bg-warning/10 text-warning border border-warning/20 px-2 py-1 rounded-lg">
                    Soon
                  </span>
                ) : (
                  <span className={`text-xs ${info.accentColor} border border-current/20 bg-current/5 px-2 py-1 rounded-lg`}>
                    OAuth
                  </span>
                )}
              </div>

              <ul className="space-y-1 mb-4">
                {info.features.map(f => (
                  <li key={f} className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <MdCheck className={`text-sm flex-shrink-0 ${info.accentColor}`} /> {f}
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-xs">{info.note}</span>
                {!info.comingSoon && (
                  <button
                    onClick={e => { e.stopPropagation(); handleConnect(key) }}
                    disabled={connecting === key}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all
                      ${info.accentColor} border-current/30 bg-current/5 hover:bg-current/15
                      ${connecting === key ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {connecting === key ? (
                      <><div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> Redirecting...</>
                    ) : (
                      <><MdOpenInNew className="text-sm" /> Connect</>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-card border border-border-subtle rounded-2xl p-6">
        <h3 className="font-display font-bold text-white text-base mb-5">How broker connection works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '1', icon: MdOpenInNew, title: 'One-click OAuth', desc: 'Click Connect — you are taken to your broker login page. No passwords shared with us.' },
            { step: '2', icon: MdShield, title: 'Secure token exchange', desc: 'Your broker issues a session token. We store only this token, never your credentials.' },
            { step: '3', icon: MdFlashOn, title: 'Live trading enabled', desc: 'Your holdings sync automatically. Place trades here — we route to the fastest broker.' },
          ].map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="flex gap-4">
              <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center flex-shrink-0">
                <Icon className="text-accent text-sm" />
              </div>
              <div>
                <div className="text-white text-sm font-semibold mb-1">{title}</div>
                <div className="text-text-secondary text-xs leading-relaxed">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trade modal */}
      <TradeModal
        isOpen={tradeModal}
        onClose={() => { setTradeModal(false); setTradeBroker(null) }}
        broker={tradeBroker}
        connectedBrokers={connected}
      />
    </div>
  )
}

export default Brokers
