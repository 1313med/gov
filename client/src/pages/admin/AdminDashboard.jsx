import AdminLayout from "../../components/admin/AdminLayout";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../api/axios";


const Stat = ({ label, value }) => (
  <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
    <p className="text-sm text-gray-400">{label}</p>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get("/sale/admin");
        const listings = res.data || [];

        setStats({
          total: listings.length,
          pending: listings.filter((l) => l.status === "pending").length,
          approved: listings.filter((l) => l.status === "approved").length,
          rejected: listings.filter((l) => l.status === "rejected").length,
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold">Admin Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Monitor platform activity and manage listings
        </p>
      </div>

      {/* KPIs */}
      {loading ? (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          Loading statistics...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Stat label="Total Listings" value={stats.total} />
          <Stat label="Pending Approval" value={stats.pending} />
          <Stat label="Approved" value={stats.approved} />
          <Stat label="Rejected" value={stats.rejected} />
        </div>
      )}

      {/* Actions */}
      <div className="mt-10 bg-gray-800 border border-gray-700 rounded-2xl p-8">
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>

        <div className="flex flex-wrap gap-4">
          <Link
            to="/admin/sales"
            className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:opacity-90"
          >
            Review Listings
          </Link>

          <span className="px-6 py-3 border border-gray-600 rounded-xl text-gray-400">
            More tools coming soon
          </span>
        </div>
      </div>
    </AdminLayout>
  );
}
