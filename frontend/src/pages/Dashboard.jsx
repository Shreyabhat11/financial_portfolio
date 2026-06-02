import MarketCard from "../components/MarketCard";
import SummaryCard from "../components/SummaryCard";
import Table from "../components/Table";

export default function Dashboard() {
  return (
    <div>
      <div className="grid grid-cols-3 gap-5">
        <MarketCard title="NIFTY 50" value="22145" gain="+0.759" />
        <MarketCard title="BANKNIFTY" value="47810" gain="+0.425" />
        <MarketCard title="SENSEX" value="75893" gain="+0.48" />
      </div>

      <h1 className="text-4xl font-bold mt-10 mb-6">
        Portfolio Summary
      </h1>

      <div className="grid grid-cols-4 gap-5">
        <SummaryCard
          title="Total Investment"
          value="₹12000"
        />

        <SummaryCard
          title="Current Value"
          value="₹15000"
          extra="+3000"
        />

        <SummaryCard
          title="Day P&L"
          value="+450"
        />

        <div className="bg-[#343b46] rounded-3xl p-6">
          <h2 className="text-4xl font-bold">
            AI Portfolio Health Score
          </h2>

          <p className="text-green-400 text-5xl mt-5">
            +85
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mt-6">
        <div className="col-span-2">
          <Table />
        </div>

        <div className="space-y-5">
          <div className="bg-[#343b46] rounded-3xl p-5 h-64">
            <h2 className="text-3xl font-bold">
              TOP GAINERS / LOSERS
            </h2>
          </div>

          <div className="bg-[#343b46] rounded-3xl p-5 h-64">
            <h2 className="text-3xl font-bold">
              AI News Feed
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}