import { motion } from 'framer-motion'
import { MdTrendingUp, MdShowChart, MdHealthAndSafety, MdAutoAwesome, MdAdd } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { dashboardService, portfolioService } from '../../services/apiServices'
import MarketIndexCard from '../../components/cards/MarketIndexCard'
import HoldingsTable from '../../components/tables/HoldingsTable'
import PortfolioChart from '../../components/charts/PortfolioChart'
import { CardSkeleton } from '../../components/ui/Skeleton'

// Fallback demo data
const MOCK_INDICES = [
  { name: 'NIFTY 50', value: 22145, changePercent: 0.759 },
  { name: 'BANKNIFTY', value: 47810, changePercent: 0.425 },
  { name: 'SENSEX', value: 75893, changePercent: 0.48 },
]
const MOCK_SUMMARY = { totalInvestment: 0, currentValue: 0, dayPnl: 0, totalPnl: 0, totalPnlPct: 0, healthScore: 0 }
const MOCK_CHART = Array.from({ length: 12 }, (_, i) => ({
  date: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
  value: 12000 + Math.round(Math.random() * 4000 + i * 250),
}))
const MOCK_NEWS = [
  { id: 1, headline: 'RBI holds repo rate steady, markets react positively', time: '2h ago', sentiment: 'positive' },
  { id: 2, headline: 'IT sector faces headwinds from global slowdown concerns', time: '4h ago', sentiment: 'negative' },
  { id: 3, headline: 'Banking stocks surge on strong quarterly earnings beat', time: '6h ago', sentiment: 'positive' },
]

const HealthScore = ({ score }) => {
  const color = score >= 75 ? '#00c853' : score >= 50 ? '#ffab00' : '#ff5252'
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
        <text x="70" y="65" textAnchor="middle" fill={color} fontSize="28" fontWeight="700" fontFamily="Syne">{score}</text>
        <text x="70" y="83" textAnchor="middle" fill="#8892a4" fontSize="11">/100</text>
      </svg>
      <div className="text-xs text-text-secondary">Portfolio Health</div>
    </div>
  )
}

const TopMovers = ({ movers, loading }) => {
  if (loading) return <div className="space-y-2">{Array.from({length:4}).map((_,i)=><div key={i} className="flex justify-between"><div className="skeleton h-4 w-20"/><div className="skeleton h-4 w-12"/></div>)}</div>
  const gainers = movers?.gainers || []
  const losers = movers?.losers || []
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="text-success text-xs font-semibold uppercase tracking-wider mb-2">Gainers</div>
        <div className="space-y-2">{gainers.map(s=>(
          <div key={s.symbol} className="flex items-center justify-between">
            <span className="text-white text-sm font-medium">{s.symbol}</span>
            <span className="text-success text-sm font-mono">+{Math.abs(s.change)}%</span>
          </div>
        ))}</div>
      </div>
      <div>
        <div className="text-danger text-xs font-semibold uppercase tracking-wider mb-2">Losers</div>
        <div className="space-y-2">{losers.map(s=>(
          <div key={s.symbol} className="flex items-center justify-between">
            <span className="text-white text-sm font-medium">{s.symbol}</span>
            <span className="text-danger text-sm font-mono">{s.change}%</span>
          </div>
        ))}</div>
      </div>
    </div>
  )
}

const NewsItem = ({ item, index }) => {
  const colors = { positive:'bg-success/10 text-success', negative:'bg-danger/10 text-danger', neutral:'bg-warning/10 text-warning' }
  return (
    <motion.div initial={{opacity:0,x:10}} animate={{opacity:1,x:0}} transition={{delay:index*0.08}}
      className="flex gap-3 py-3 border-b border-border-subtle/50 last:border-0">
      <div className={`mt-0.5 px-1.5 py-0.5 rounded text-xs font-bold flex-shrink-0 ${colors[item.sentiment]}`}>
        {item.sentiment==='positive'?'↑':item.sentiment==='negative'?'↓':'→'}
      </div>
      <div>
        <p className="text-white text-sm leading-snug">{item.headline}</p>
        <span className="text-text-secondary text-xs">{item.time}</span>
      </div>
    </motion.div>
  )
}

const Dashboard = () => {
  const { data: summary, loading: sumLoading } = useApi(dashboardService.getSummary, [], { defaultData: MOCK_SUMMARY })
  const { data: market, loading: mktLoading } = useApi(dashboardService.getMarketOverview, [], { defaultData: { indices: MOCK_INDICES } })
  const { data: movers, loading: movLoading } = useApi(dashboardService.getTopMovers, [], { defaultData: { gainers: [], losers: [] } })
  const { data: holdings, loading: hLoading } = useApi(portfolioService.getHoldings, [], { defaultData: [] })
  const { data: perfData } = useApi(portfolioService.getPerformance, [], { defaultData: { data: MOCK_CHART } })

  const sum = summary || MOCK_SUMMARY
  const indices = market?.indices || MOCK_INDICES
  const chartData = perfData?.data || MOCK_CHART
  const holdingsList = holdings || []

  return (
    <div className="space-y-6">
      {/* Market Indices */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {mktLoading
          ? Array.from({length:3}).map((_,i)=><CardSkeleton key={i}/>)
          : indices.map((idx,i)=><MarketIndexCard key={idx.name} {...idx} index={i}/>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Portfolio Summary */}
          <section>
            <h2 className="font-display font-bold text-white text-lg mb-4">Portfolio Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {sumLoading ? Array.from({length:3}).map((_,i)=><CardSkeleton key={i}/>) : (
                <>
                  {[
                    { label:'Total Investment', value:`₹${sum.totalInvestment?.toLocaleString('en-IN')}` },
                    { label:'Current Value', value:`₹${sum.currentValue?.toLocaleString('en-IN')}`, sub: sum.totalPnl ? `(+${sum.totalPnl?.toLocaleString('en-IN')})` : null, subColor:'text-success' },
                    { label:'Day P&L', value:`${sum.dayPnl>=0?'+':''}₹${Math.abs(sum.dayPnl||0).toLocaleString('en-IN')}`, valueColor: sum.dayPnl>=0?'text-success':'text-danger' },
                  ].map(({label,value,sub,subColor,valueColor},i)=>(
                    <motion.div key={label} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
                      className="bg-card border border-border-subtle rounded-2xl p-5 hover:border-accent/30 transition-all">
                      <div className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-2">{label}</div>
                      <div className={`font-display font-bold text-2xl ${valueColor||'text-white'}`}>{value}</div>
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
              {holdingsList.length === 0 && !hLoading && (
                <Link to="/portfolio" className="flex items-center gap-1 text-accent text-sm hover:underline">
                  <MdAdd /> Add Holdings
                </Link>
              )}
            </div>
            <div className="bg-card border border-border-subtle rounded-2xl overflow-hidden">
              <HoldingsTable holdings={holdingsList} loading={hLoading} />
            </div>
          </section>

          {/* Chart */}
          <section>
            <div className="bg-card border border-border-subtle rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display font-bold text-white text-base">Portfolio Performance</h2>
                  <p className="text-text-secondary text-xs mt-0.5">12-month growth</p>
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${sum.totalPnlPct>=0?'text-success':'text-danger'}`}>
                  <MdShowChart />{sum.totalPnlPct>=0?'+':''}{sum.totalPnlPct}%
                </div>
              </div>
              <PortfolioChart data={chartData} />
            </div>
          </section>
        </div>

        {/* Right */}
        <div className="space-y-6">
          <div className="bg-card border border-accent/20 rounded-2xl p-5 shadow-accent-glow/10">
            <div className="flex items-center gap-2 mb-2">
              <MdHealthAndSafety className="text-accent text-lg" />
              <h3 className="font-display font-bold text-white text-sm">AI Portfolio Health Score</h3>
            </div>
            <HealthScore score={sum.healthScore || 0} />
          </div>

          <div className="bg-card border border-border-subtle rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <MdTrendingUp className="text-accent text-lg" />
              <h3 className="font-display font-bold text-white text-sm uppercase tracking-wide">Top Gainers / Losers</h3>
            </div>
            <TopMovers movers={movers} loading={movLoading} />
          </div>

          <div className="bg-card border border-border-subtle rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <MdAutoAwesome className="text-accent text-lg" />
              <h3 className="font-display font-bold text-white text-sm uppercase tracking-wide">AI News Feed</h3>
            </div>
            {MOCK_NEWS.map((item,i)=><NewsItem key={item.id} item={item} index={i}/>)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
