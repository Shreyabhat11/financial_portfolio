import { motion } from 'framer-motion'
import { MdShowChart, MdPieChart, MdHistory } from 'react-icons/md'
import { useApi } from '../../hooks/useApi'
import { portfolioService } from '../../services/apiServices'
import AllocationPieChart from '../../components/charts/AllocationPieChart'
import PortfolioChart from '../../components/charts/PortfolioChart'
import PnLBarChart from '../../components/charts/PnLBarChart'
import HoldingsTable from '../../components/tables/HoldingsTable'
import { CardSkeleton } from '../../components/ui/Skeleton'

const MOCK_HOLDINGS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', qty: 5, avgCost: 2400, cmp: 2650, dayPnl: 250, yearPnl: 1250, aiSignal: 'BUY' },
  { symbol: 'TCS', name: 'Tata Consultancy', qty: 3, avgCost: 3800, cmp: 4100, dayPnl: 180, yearPnl: 900, aiSignal: 'HOLD' },
  { symbol: 'INFY', name: 'Infosys Ltd', qty: 8, avgCost: 1450, cmp: 1380, dayPnl: -70, yearPnl: -560, aiSignal: 'SELL' },
  { symbol: 'HDFC', name: 'HDFC Bank', qty: 4, avgCost: 1600, cmp: 1720, dayPnl: 90, yearPnl: 480, aiSignal: 'BUY' },
  { symbol: 'WIPRO', name: 'Wipro Ltd', qty: 10, avgCost: 480, cmp: 520, dayPnl: 60, yearPnl: 400, aiSignal: 'HOLD' },
]
const MOCK_ALLOCATION = [
  { name: 'Large Cap', value: 45 },
  { name: 'Mid Cap', value: 25 },
  { name: 'Small Cap', value: 15 },
  { name: 'Debt', value: 10 },
  { name: 'Gold', value: 5 },
]
const MOCK_SECTORS = [
  { name: 'IT', value: 35 },
  { name: 'Banking', value: 28 },
  { name: 'Energy', value: 20 },
  { name: 'FMCG', value: 10 },
  { name: 'Pharma', value: 7 },
]
const MOCK_PERF = Array.from({ length: 12 }, (_, i) => ({
  date: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
  value: 12000 + Math.round(Math.random() * 4000 + i * 270),
}))
const MOCK_PNL = [
  { month: 'Jan', pnl: 1200 }, { month: 'Feb', pnl: -400 }, { month: 'Mar', pnl: 800 },
  { month: 'Apr', pnl: 1500 }, { month: 'May', pnl: -200 }, { month: 'Jun', pnl: 900 },
  { month: 'Jul', pnl: 600 }, { month: 'Aug', pnl: 1100 }, { month: 'Sep', pnl: -300 },
  { month: 'Oct', pnl: 700 }, { month: 'Nov', pnl: 1300 }, { month: 'Dec', pnl: 850 },
]

const StatRow = ({ label, value, sub, positive }) => (
  <div className="flex items-center justify-between py-3 border-b border-border-subtle/50 last:border-0">
    <span className="text-text-secondary text-sm">{label}</span>
    <div className="text-right">
      <div className={`font-semibold font-mono text-sm ${positive === true ? 'text-success' : positive === false ? 'text-danger' : 'text-white'}`}>{value}</div>
      {sub && <div className="text-text-secondary text-xs">{sub}</div>}
    </div>
  </div>
)

const Portfolio = () => {
  const { data: holdings, loading: hLoading } = useApi(portfolioService.getHoldings, [], { defaultData: MOCK_HOLDINGS })
  const { data: perf, loading: pLoading } = useApi(portfolioService.getPerformance, [], { defaultData: {} })

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Invested', value: '₹1,20,000', icon: MdShowChart },
          { label: 'Current Value', value: '₹1,50,000', sub: '+25%', positive: true, icon: MdShowChart },
          { label: 'Total P&L', value: '+₹30,000', positive: true, icon: MdShowChart },
          { label: 'Day P&L', value: '+₹450', positive: true, icon: MdShowChart },
        ].map(({ label, value, sub, positive, icon: Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-card border border-border-subtle rounded-2xl p-5 hover:border-accent/30 transition-all"
          >
            <div className="text-text-secondary text-xs uppercase tracking-wider mb-2">{label}</div>
            <div className={`font-display font-bold text-xl ${positive === true ? 'text-success' : positive === false ? 'text-danger' : 'text-white'}`}>{value}</div>
            {sub && <div className={`text-xs mt-1 ${positive === true ? 'text-success' : 'text-danger'}`}>{sub}</div>}
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance chart */}
        <div className="lg:col-span-2 bg-card border border-border-subtle rounded-2xl p-5">
          <h3 className="font-display font-bold text-white text-base mb-4 flex items-center gap-2">
            <MdShowChart className="text-accent" /> Portfolio Growth
          </h3>
          <PortfolioChart data={MOCK_PERF} />
        </div>

        {/* Asset Allocation */}
        <div className="bg-card border border-border-subtle rounded-2xl p-5">
          <h3 className="font-display font-bold text-white text-base mb-2 flex items-center gap-2">
            <MdPieChart className="text-accent" /> Asset Allocation
          </h3>
          <AllocationPieChart data={MOCK_ALLOCATION} />
        </div>
      </div>

      {/* P&L + Sector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border-subtle rounded-2xl p-5">
          <h3 className="font-display font-bold text-white text-base mb-4">Monthly P&L</h3>
          <PnLBarChart data={MOCK_PNL} />
        </div>

        <div className="bg-card border border-border-subtle rounded-2xl p-5">
          <h3 className="font-display font-bold text-white text-base mb-2 flex items-center gap-2">
            <MdPieChart className="text-accent" /> Sector Distribution
          </h3>
          <AllocationPieChart data={MOCK_SECTORS} />
        </div>
      </div>

      {/* Holdings */}
      <div className="bg-card border border-border-subtle rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 p-5 border-b border-border-subtle">
          <MdHistory className="text-accent text-lg" />
          <h3 className="font-display font-bold text-white text-base">Holdings Breakdown</h3>
          <span className="ml-auto text-text-secondary text-sm">{(holdings || MOCK_HOLDINGS).length} stocks</span>
        </div>
        <HoldingsTable holdings={holdings || MOCK_HOLDINGS} loading={hLoading} />
      </div>

      {/* Quick stats */}
      <div className="bg-card border border-border-subtle rounded-2xl p-5">
        <h3 className="font-display font-bold text-white text-base mb-2">Portfolio Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <StatRow label="XIRR" value="22.4%" positive={true} />
          <StatRow label="Beta" value="0.87" />
          <StatRow label="Sharpe Ratio" value="1.42" />
          <StatRow label="Max Drawdown" value="-12.3%" positive={false} />
          <StatRow label="Avg Holding Period" value="8.2 months" />
          <StatRow label="Win Rate" value="68%" positive={true} />
        </div>
      </div>
    </div>
  )
}

export default Portfolio
