export default function MarketCard({ title, value, gain }) {
  return (
    <div className="bg-[#343b46] rounded-3xl p-5 flex-1">
      <h2 className="text-xl text-gray-200">{title}</h2>
      <div className="flex items-center gap-3 mt-2">
        <span className="text-4xl font-bold">{value}</span>
        <span className="text-green-400 text-2xl">{gain}</span>
      </div>
    </div>
  );
}