import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border-subtle rounded-xl p-3 text-sm shadow-card">
      <div className="text-text-secondary mb-1">{label}</div>
      <div className="text-accent font-semibold">₹{payload[0]?.value?.toLocaleString('en-IN')}</div>
    </div>
  )
}

const PortfolioChart = ({ data = [] }) => {
  const isPositive = data.length >= 2
    ? data[data.length - 1]?.value >= data[0]?.value
    : true
  const color = isPositive ? '#00c853' : '#ff5252'

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#232b38" />
        <XAxis dataKey="date" tick={{ fill: '#8892a4', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#8892a4', fontSize: 11 }} axisLine={false} tickLine={false}
          tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2}
          fill="url(#portfolioGrad)" dot={false} activeDot={{ r: 5, fill: color }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default PortfolioChart
