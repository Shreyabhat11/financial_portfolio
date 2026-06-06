import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#00d2d3', '#00c853', '#ff5252', '#ffab00', '#7c4dff', '#00b0ff']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border-subtle rounded-xl p-3 text-sm">
      <div className="text-white font-medium">{payload[0].name}</div>
      <div className="text-accent">{payload[0].value}%</div>
    </div>
  )
}

const AllocationPieChart = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height={240}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={65}
        outerRadius={95}
        paddingAngle={3}
        dataKey="value"
      >
        {data.map((_, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} />
      <Legend
        formatter={(value) => <span className="text-text-secondary text-xs">{value}</span>}
        iconType="circle"
        iconSize={8}
      />
    </PieChart>
  </ResponsiveContainer>
)

export default AllocationPieChart
