export default function Table() {
  return (
    <div className="bg-[#343b46] rounded-3xl p-5 mt-6">
      <h2 className="text-3xl mb-5 font-bold">Current Holdings</h2>

      <table className="w-full border border-gray-500">
        <thead className="bg-[#404854]">
          <tr>
            <th className="p-3 border">Stock</th>
            <th className="p-3 border">Qty</th>
            <th className="p-3 border">Avg</th>
            <th className="p-3 border">CMP</th>
            <th className="p-3 border">P&L</th>
            <th className="p-3 border">AI Signal</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td className="p-3 border">TCS</td>
            <td className="p-3 border">10</td>
            <td className="p-3 border">3200</td>
            <td className="p-3 border">3500</td>
            <td className="p-3 border text-green-400">+3000</td>
            <td className="p-3 border text-cyan-400">BUY</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}