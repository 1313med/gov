import { useEffect, useState, useMemo } from "react";
import SellerLayout from "../components/seller/SellerLayout";
import { getMySales } from "../api/sale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#6366F1", "#F59E0B", "#10B981"];

export default function Dashboard() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMySales()
      .then((res) => {
        setSales(Array.isArray(res.data) ? res.data : []);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ================= KPI CALCULATIONS ================= */

  const total = sales.length;
  const active = sales.filter((s) => s.status === "approved").length;
  const pending = sales.filter((s) => s.status === "pending").length;
  const sold = sales.filter((s) => s.status === "sold").length;

  const revenue = sales
    .filter((s) => s.status === "sold")
    .reduce((sum, s) => sum + Number(s.price || 0), 0);

  const conversionRate =
    total > 0 ? ((sold / total) * 100).toFixed(1) : 0;

  /* ================= CHART DATA ================= */

  const revenueTrend = useMemo(() => {
    return sales
      .filter((s) => s.status === "sold")
      .map((s, i) => ({
        name: `Sale ${i + 1}`,
        revenue: Number(s.price || 0),
      }));
  }, [sales]);

  const statusData = [
    { name: "Active", value: active },
    { name: "Pending", value: pending },
    { name: "Sold", value: sold },
  ];

  if (loading) {
    return (
      <SellerLayout>
        <div className="p-10">Loading dashboard...</div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="min-h-screen p-8 space-y-12
      bg-[radial-gradient(circle_at_top_left,_#eef2ff,_#f8fafc)]">

        {/* ================= HEADER ================= */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Sales Analytics
          </h1>
          <p className="text-gray-500 mt-1">
            Track performance, revenue and listing activity
          </p>
        </div>

        {/* ================= HERO SECTION ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Revenue Hero */}
          <div className="lg:col-span-2 rounded-3xl p-10
          bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800
          text-white shadow-2xl relative overflow-hidden">

            <div className="absolute -right-24 -top-24 w-72 h-72
            bg-white/10 rounded-full blur-3xl" />

            <p className="text-sm text-white/70">
              Total Revenue
            </p>

            <p className="text-5xl font-bold mt-4 tracking-tight">
              {revenue.toLocaleString()} MAD
            </p>

            <p className="text-sm text-white/60 mt-2">
              Generated from sold vehicles
            </p>
          </div>

          {/* Metrics Side Card */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg space-y-8">

            <Metric label="Sold Vehicles" value={sold} />
            <Metric label="Conversion Rate" value={`${conversionRate}%`} />
            <Metric label="Active Listings" value={active} />

          </div>
        </div>

        {/* ================= MINI STATS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

          <MiniStat label="Total Listings" value={total} />
          <MiniStat label="Pending Approval" value={pending} />
          <MiniStat label="Approved Listings" value={active} />

        </div>

        {/* ================= ANALYTICS SECTION ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg">

            <h2 className="font-semibold text-gray-800 mb-6">
              Revenue Trend
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>

                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="url(#colorRevenue)"
                  strokeWidth={4}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status Donut */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg">

            <h2 className="font-semibold text-gray-800 mb-6">
              Listing Status Distribution
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}

/* ================= SMALL COMPONENTS ================= */

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-2">
        {value}
      </p>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="relative bg-white rounded-3xl p-6 shadow-lg
    border border-gray-200 hover:shadow-xl transition-all duration-300">

      <div className="absolute top-0 left-0 w-full h-1 
      bg-gradient-to-r from-indigo-500 to-blue-500 rounded-t-3xl" />

      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-3">
        {value}
      </p>
    </div>
  );
}
