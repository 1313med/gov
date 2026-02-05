import { useEffect, useState } from "react";
import SellerLayout from "../components/seller/SellerLayout";
import { getMySales } from "../api/sale";
import { Link } from "react-router-dom";

const StatCard = ({ label, value, sub, highlight }) => (
  <div
    className={`rounded-3xl p-6 border shadow-sm ${
      highlight ? "bg-black text-white" : "bg-white"
    }`}
  >
    <p className={`text-sm ${highlight ? "text-white/70" : "text-gray-500"}`}>
      {label}
    </p>
    <p className="text-3xl font-extrabold mt-2">{value}</p>
    {sub && (
      <p className={`text-xs mt-2 ${highlight ? "text-white/60" : "text-gray-400"}`}>
        {sub}
      </p>
    )}
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

  // ===================== KPIs =====================
  const total = sales.length;
  const active = sales.filter((s) => s.status === "approved").length;
  const pending = sales.filter((s) => s.status === "pending").length;
  const sold = sales.filter((s) => s.status === "sold").length;

  const revenue = sales
    .filter((s) => s.status === "sold")
    .reduce((sum, s) => sum + Number(s.price || 0), 0);

  return (
    <SellerLayout>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold">Seller Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of your listings and performance
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border p-8 shadow-sm">
          Loading dashboard...
        </div>
      ) : (
        <>
          {/* ===================== KPI GRID ===================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard label="Total Listings" value={total} />
            <StatCard label="Active" value={active} />
            <StatCard label="Pending" value={pending} />
            <StatCard label="Sold" value={sold} />
            <StatCard
              label="Estimated Revenue"
              value={`${revenue.toLocaleString()} MAD`}
              sub="From sold cars"
              highlight
            />
          </div>

          {/* ===================== INSIGHTS ===================== */}
          <div className="mt-12 bg-white rounded-3xl border p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Insights</h2>

            {total === 0 && (
              <div className="text-gray-600">
                <p>You haven’t added any listings yet.</p>
                <Link
                  to="/my-sales/new"
                  className="inline-block mt-4 px-6 py-3 bg-black text-white rounded-xl hover:opacity-90"
                >
                  Add your first car
                </Link>
              </div>
            )}

            {total > 0 && (
              <ul className="space-y-2 text-gray-700">
                <li>
                  • You currently have <b>{active}</b> active listings.
                </li>
                <li>
                  • <b>{pending}</b> listings are waiting for approval.
                </li>
                <li>
                  • You’ve sold <b>{sold}</b> cars so far.
                </li>
                {sold > 0 && (
                  <li>
                    • Estimated revenue:{" "}
                    <b>{revenue.toLocaleString()} MAD</b>.
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* ===================== QUICK ACTIONS ===================== */}
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/my-sales"
              className="px-6 py-4 rounded-2xl border hover:bg-gray-100 font-semibold"
            >
              Manage Listings
            </Link>

            <Link
              to="/my-sales/new"
              className="px-6 py-4 rounded-2xl bg-black text-white hover:opacity-90 font-semibold"
            >
              Add New Car
            </Link>
          </div>
        </>
      )}
    </SellerLayout>
  );
}
