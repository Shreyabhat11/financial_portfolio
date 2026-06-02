export default function SummaryCard({ title, value, extra }) {
  return (
    <div className="bg-[#343b46] rounded-3xl p-6 w-full">
      <h3 className="text-2xl text-gray-200">{title}</h3>
      <h1 className="text-4xl font-bold mt-4">{value}</h1>
      <p className="text-green-400 text-2xl mt-2">{extra}</p>
    </div>
  );
}