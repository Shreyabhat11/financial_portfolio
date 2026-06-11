import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdPsychology, MdTrendingUp, MdTrendingDown, MdShield,
  MdSearch, MdRefresh, MdClose, MdAutoAwesome
} from 'react-icons/md'
import { MdSentimentSatisfied, MdSentimentDissatisfied, MdSentimentNeutral } from 'react-icons/md'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import { useApi } from '../../hooks/useApi'
import { aiService, marketService } from '../../services/apiServices'
import StockDetailModal from '../../components/ui/StockDetailModal'

// ── Confidence Bar ────────────────────────────────────────────────────────────
const ConfidenceBar = ({ value }) => (
  <div className="w-full bg-border-subtle rounded-full h-1.5 mt-2">
    <motion.div
      initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8 }}
      className={`h-full rounded-full ${value >= 80 ? 'bg-success' : value >= 60 ? 'bg-warning' : 'bg-danger'}`}
    />
  </div>
)

// ── Signal Badge ──────────────────────────────────────────────────────────────
const SignalBadge = ({ signal }) => {
  const map = { BUY: 'tag-buy', SELL: 'tag-sell', HOLD: 'tag-hold' }
  return <span className={map[signal] || 'tag-hold'}>{signal || 'HOLD'}</span>
}

// ── Sentiment Icon ────────────────────────────────────────────────────────────
const SentimentIcon = ({ s }) => ({
  bullish: <MdSentimentSatisfied className="text-success text-xl" />,
  bearish: <MdSentimentDissatisfied className="text-danger text-xl" />,
  neutral: <MdSentimentNeutral className="text-warning text-xl" />,
}[s] || <MdSentimentNeutral className="text-warning text-xl" />)

// ── Full Analysis Drawer ──────────────────────────────────────────────────────
const AnalysisDrawer = ({ rec, onClose, onViewChart }) => {
  if (!rec) return null
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.25 }}
          className="relative bg-card border border-border-subtle rounded-2xl w-full max-w-xl max-h-[80vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border-subtle sticky top-0 bg-card z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center">
                <span className="font-display font-bold text-accent text-xs">{rec.symbol?.slice(0,3)}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-white text-lg">{rec.symbol}</span>
                  <SignalBadge signal={rec.signal} />
                </div>
                <div className="flex items-center gap-3 text-xs mt-0.5">
                  <span className="text-text-secondary">
                    CMP: <span className="text-white font-mono">₹{rec.current?.toLocaleString('en-IN')}</span>
                  </span>
                  <span className={`font-mono font-semibold ${(rec.change || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                    {(rec.change || 0) >= 0 ? '+' : ''}{rec.change?.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewChart(rec.symbol)}
                className="px-3 py-1.5 text-xs border border-border-subtle text-text-secondary hover:border-accent/50 hover:text-accent rounded-lg transition-all"
              >
                View Chart
              </button>
              <button onClick={onClose}
                className="p-1.5 rounded-lg text-text-secondary hover:text-white hover:bg-border-subtle transition-all">
                <MdClose className="text-xl" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Target', value: `₹${rec.target?.toLocaleString('en-IN')}` },
                { label: 'Upside', value: `${(rec.upside || 0) >= 0 ? '+' : ''}${rec.upside}%`,
                  color: (rec.upside || 0) >= 0 ? 'text-success' : 'text-danger' },
                { label: 'Confidence', value: `${rec.confidence}%` },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-card-dark border border-border-subtle rounded-xl p-3 text-center">
                  <div className="text-text-secondary text-xs mb-1">{label}</div>
                  <div className={`font-semibold font-mono text-sm ${color || 'text-white'}`}>{value}</div>
                </div>
              ))}
            </div>

            <div>
              <div className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">Confidence</div>
              <ConfidenceBar value={rec.confidence || 75} />
            </div>

            <div>
              <div className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3">AI Analysis</div>
              <div className="bg-card-dark border border-border-subtle rounded-xl p-4">
                <p className="text-white text-sm leading-relaxed whitespace-pre-line">
                  {rec.fullAnalysis || rec.reason || 'No analysis available.'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Search Analysis Panel ─────────────────────────────────────────────────────
const SearchAnalysis = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [analysing, setAnalysing] = useState(false)
  const [selectedSym, setSelectedSym] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [stockModal, setStockModal] = useState(null)

  const handleSearch = async (q) => {
    setQuery(q)
    if (!q.trim()) { setResults([]); return }
    setSearching(true)
    try {
      const res = await marketService.searchStocks(q)
      setResults(res.data || [])
    } catch { setResults([]) }
    finally { setSearching(false) }
  }

  const handleAnalyse = async (symbol) => {
    setSelectedSym(symbol)
    setResults([])
    setQuery(symbol)
    setAnalysing(true)
    setAnalysis(null)
    try {
      const res = await aiService.analyzeStock(symbol)
      setAnalysis(res.data)
    } catch {
      setAnalysis({ symbol, signal: 'HOLD', analysis: 'Analysis temporarily unavailable.' })
    } finally { setAnalysing(false) }
  }

  return (
    <div className="bg-card border border-border-subtle rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <MdSearch className="text-accent text-lg" />
        <h3 className="font-display font-bold text-white text-base">Search Stock Analysis</h3>
      </div>

      {/* Search input */}
      <div className="relative mb-4">
        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-lg" />
        <input
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Type NSE symbol e.g. RELIANCE, TCS..."
          className="input-field pl-10 text-sm"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setAnalysis(null); setSelectedSym('') }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white">
            <MdClose className="text-lg" />
          </button>
        )}
        {/* Dropdown results */}
        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card-dark border border-border-subtle rounded-xl overflow-hidden z-10 shadow-card">
            {results.map(r => (
              <button key={r.symbol} onClick={() => handleAnalyse(r.symbol)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/10 transition-colors text-sm text-left">
                <div>
                  <span className="text-white font-semibold">{r.symbol}</span>
                  <span className="text-text-secondary ml-2">{r.name}</span>
                </div>
                <span className="text-accent text-xs">Analyse →</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Analysis result */}
      {analysing ? (
        <div className="space-y-2 mt-4">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
          <div className="skeleton h-4 w-4/5" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-3/4" />
        </div>
      ) : analysis ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-display font-bold text-white text-lg">{analysis.symbol}</span>
            <SignalBadge signal={analysis.signal} />
            {analysis.price && (
              <span className="text-text-secondary text-sm font-mono">₹{analysis.price?.toLocaleString('en-IN')}</span>
            )}
            <button onClick={() => setStockModal(analysis.symbol)}
              className="ml-auto text-xs text-accent hover:underline">View Chart →</button>
          </div>
          <div className="bg-card-dark border border-border-subtle rounded-xl p-4">
            <p className="text-white text-sm leading-relaxed whitespace-pre-line">
              {analysis.analysis}
            </p>
          </div>
          <button onClick={() => handleAnalyse(analysis.symbol)}
            className="mt-3 flex items-center gap-1.5 text-text-secondary text-xs hover:text-accent transition-colors">
            <MdRefresh className="text-sm" /> Refresh Analysis
          </button>
        </motion.div>
      ) : (
        <p className="text-text-secondary text-sm">
          Search for any NSE stock symbol to get an AI analysis with buy/sell/hold recommendation.
        </p>
      )}

      {stockModal && <StockDetailModal symbol={stockModal} onClose={() => setStockModal(null)} />}
    </div>
  )
}

// ── AI Insights Page ──────────────────────────────────────────────────────────
const AIInsights = () => {
  const [selectedRec, setSelectedRec] = useState(null)
  const [stockModal, setStockModal] = useState(null)

  const { data: recs, loading: recLoading } = useApi(aiService.getRecommendations, [], { defaultData: [] })
  const { data: riskData, loading: riskLoading } = useApi(aiService.getRiskAnalysis, [], { defaultData: {} })
  const { data: sentiment } = useApi(aiService.getSentiment, [], { defaultData: [] })

  const recList = recs || []
  const riskMetrics = riskData?.riskMetrics || []
  const sentimentList = sentiment || []

  return (
    <div className="space-y-6">
      {/* Signal summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Buy Signals', value: recList.filter(r => r.signal === 'BUY').length, color: 'text-success', bg: 'bg-success/10 border-success/20', icon: MdTrendingUp },
          { label: 'Sell Signals', value: recList.filter(r => r.signal === 'SELL').length, color: 'text-danger', bg: 'bg-danger/10 border-danger/20', icon: MdTrendingDown },
          { label: 'Hold Signals', value: recList.filter(r => r.signal === 'HOLD').length, color: 'text-warning', bg: 'bg-warning/10 border-warning/20', icon: MdShield },
        ].map(({ label, value, color, bg, icon: Icon }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }} className={`rounded-2xl border p-5 ${bg}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-secondary text-xs uppercase tracking-wider">{label}</span>
              <Icon className={`text-xl ${color}`} />
            </div>
            <div className={`font-display font-bold text-3xl ${color}`}>
              {recLoading ? <div className="skeleton h-8 w-10 rounded" /> : value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search + main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: recommendations + search */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recommendations */}
          <div className="bg-card border border-border-subtle rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 p-5 border-b border-border-subtle">
              <MdAutoAwesome className="text-accent text-lg" />
              <h3 className="font-display font-bold text-white text-base">Portfolio Recommendations</h3>
              <span className="ml-auto text-text-secondary text-xs">Click to view full analysis</span>
            </div>

            {recLoading ? (
              <div className="p-5 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="skeleton h-5 w-32" />
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : recList.length === 0 ? (
              <div className="p-8 text-center">
                <MdAutoAwesome className="text-text-secondary text-4xl mx-auto mb-3" />
                <p className="text-text-secondary text-sm">Add holdings to get portfolio recommendations</p>
              </div>
            ) : (
              <div className="divide-y divide-border-subtle/50">
                {recList.map((rec, i) => (
                  <motion.button
                    key={rec.symbol}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => setSelectedRec(rec)}
                    className="w-full text-left p-5 hover:bg-accent/5 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="font-semibold text-white group-hover:text-accent transition-colors">
                          {rec.symbol}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs font-mono ${(rec.change || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                            {(rec.change || 0) >= 0 ? '+' : ''}{rec.change?.toFixed(2)}%
                          </span>
                          <span className="text-text-secondary text-xs font-mono">₹{rec.current?.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <SignalBadge signal={rec.signal} />
                    </div>
                    <p className="text-text-secondary text-sm leading-snug line-clamp-2">{rec.reason}</p>
                    <ConfidenceBar value={rec.confidence || 75} />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Search analysis */}
          <SearchAnalysis />
        </div>

        {/* Right: Risk + Sentiment */}
        <div className="space-y-6">
          <div className="bg-card border border-border-subtle rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <MdShield className="text-accent text-lg" />
              <h3 className="font-display font-bold text-white text-base">Risk Analysis</h3>
            </div>
            {riskLoading ? (
              <div className="skeleton w-full h-52 rounded-xl" />
            ) : riskMetrics.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={riskMetrics} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                    <PolarGrid stroke="#232b38" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#8892a4', fontSize: 10 }} />
                    <Radar name="Portfolio" dataKey="A" stroke="#00d2d3" fill="#00d2d3" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
                {riskData?.analysis && (
                  <p className="text-text-secondary text-xs leading-relaxed mt-3 line-clamp-5">
                    {riskData.analysis}
                  </p>
                )}
              </>
            ) : (
              <div className="text-text-secondary text-sm text-center py-8">
                Add holdings for risk analysis
              </div>
            )}
          </div>

          <div className="bg-card border border-border-subtle rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <MdPsychology className="text-accent text-lg" />
              <h3 className="font-display font-bold text-white text-base">Sector Sentiment</h3>
            </div>
            <div className="space-y-3">
              {sentimentList.map(({ sector, sentiment: sent, score }) => (
                <div key={sector} className="flex items-center gap-3">
                  <SentimentIcon s={sent} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm">{sector}</span>
                      <span className={`text-xs font-mono ${score > 0 ? 'text-success' : score < 0 ? 'text-danger' : 'text-warning'}`}>
                        {score > 0 ? '+' : ''}{score.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-border-subtle rounded-full h-1.5">
                      <div
                        className={`h-full rounded-full ${score > 0.3 ? 'bg-success' : score < -0.1 ? 'bg-danger' : 'bg-warning'}`}
                        style={{ width: `${Math.min(Math.abs(score) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full analysis drawer */}
      {selectedRec && (
        <AnalysisDrawer
          rec={selectedRec}
          onClose={() => setSelectedRec(null)}
          onViewChart={(sym) => { setSelectedRec(null); setStockModal(sym) }}
        />
      )}

      {/* Chart modal from drawer */}
      {stockModal && (
        <StockDetailModal symbol={stockModal} onClose={() => setStockModal(null)} />
      )}
    </div>
  )
}

export default AIInsights
