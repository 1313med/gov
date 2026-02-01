import { useEffect, useState } from "react";
import SellerLayout from "../components/seller/SellerLayout";
import { getMySales } from "../api/sale";

const StatCard = ({ label, value, sub }) => (
  <div className="bg-white rounded-xl p-6 shadow border">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-3xl font-bold mt-1">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

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

  // ===================== KPI CALCULATIONS =====================
  const total = sales.length;

  const active = sales.filter(
    (s) => s.status === "approved"
  ).length;

  const pending = sales.filter(
    (s) => s.status === "pending"
  ).length;

  const sold = sales.filter(
    (s) => s.status === "sold"
  ).length;

  const revenue = sales
    .filter((s) => s.status === "sold")
    .reduce((sum, s) => sum + Number(s.price || 0), 0);

  return (
    <SellerLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {loading ? (
        <div className="bg-white p-6 rounded-xl border shadow">
          Loading dashboard...
        </div>
      ) : (
        <>
          {/* ===================== KPI CARDS ===================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard label="Total Listings" value={total} />
            <StatCard label="Active" value={active} />
            <StatCard label="Pending" value={pending} />
            <StatCard label="Sold" value={sold} />
            <StatCard
              label="Estimated Revenue"
              value={`${revenue} MAD`}
              sub="From sold cars"
            />
          </div>

          {/* ===================== INSIGHTS ===================== */}
          <div className="mt-10 bg-white rounded-xl p-6 border shadow">
            <h2 className="font-semibold text-lg">Insights</h2>

            {total === 0 && (
              <p className="text-sm text-gray-600 mt-2">
                You haven’t added any listings yet. Start by adding your first
                car.
              </p>
            )}

            {total > 0 && (
              <ul className="text-sm text-gray-700 mt-3 space-y-1">
                <li>• You have <b>{active}</b> active listings.</li>
                <li>• <b>{pending}</b> listings are pending approval.</li>
                <li>• You sold <b>{sold}</b> cars so far.</li>
                {sold > 0 && (
                  <li>
                    • Your estimated revenue is <b>{revenue} MAD</b>.
                  </li>
                )}
              </ul>
            )}
          </div>
        </>
      )}
    </SellerLayout>
  );
}
