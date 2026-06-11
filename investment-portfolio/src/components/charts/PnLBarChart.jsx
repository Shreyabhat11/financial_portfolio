import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  return (
    <div className="bg-card border border-border-subtle rounded-xl p-3 text-sm">
      <div className="text-text-secondary mb-1">{label}</div>
      <div className={`font-semibold ${val >= 0 ? 'text-success' : 'text-danger'}`}>
        {val >= 0 ? '+' : ''}₹{Math.abs(val).toLocaleString('en-IN')}
      </div>
    </div>
  )
}

const PnLBarChart = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height={180}>
    <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#232b38" vertical={false} />
      <XAxis dataKey="month" tick={{ fill: '#8892a4', fontSize: 11 }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fill: '#8892a4', fontSize: 11 }} axisLine={false} tickLine={false}
        tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
      <Tooltip content={<CustomTooltip />} />
      <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
        {data.map((entry, i) => (
          <Cell key={i} fill={entry.pnl >= 0 ? '#00c853' : '#ff5252'}
            fillOpacity={0.85} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
)

export default PnLBarChart
