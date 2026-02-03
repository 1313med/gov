import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { api } from "../../api/axios";

export default function AdminSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchSales = async () => {
    setLoading(true);
    const res = await api.get("/sale/admin");
    setSales(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const updateStatus = async (id, status) => {
    const confirmMsg =
      status === "approved"
        ? "Approve this listing?"
        : "Reject this listing?";

    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoading(id);
      await api.put(`/sale/admin/${id}/status`, { status });
      fetchSales();
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (status) => {
    const base = "px-3 py-1 rounded-full text-xs font-semibold";

    switch (status) {
      case "approved":
        return <span className={`${base} bg-green-600/20 text-green-400`}>Approved</span>;
      case "rejected":
        return <span className={`${base} bg-red-600/20 text-red-400`}>Rejected</span>;
      case "pending":
        return <span className={`${base} bg-yellow-500/20 text-yellow-400`}>Pending</span>;
      case "sold":
        return <span className={`${base} bg-blue-500/20 text-blue-400`}>Sold</span>;
      default:
        return <span className={base}>{status}</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Listings</h1>
        <p className="text-sm text-gray-400">
          Total: {sales.length}
        </p>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-gray-400">
              <tr>
                <th className="px-5 py-3 text-left">Title</th>
                <th className="px-5 py-3 text-left">Seller</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {sales.map((s) => (
                <tr
                  key={s._id}
                  className="border-t border-gray-700 hover:bg-gray-700/30 transition"
                >
                  <td className="px-5 py-4 font-medium">
                    {s.title}
                  </td>

                  <td className="px-5 py-4 text-gray-300">
                    {s.sellerId?.name || "—"}
                  </td>

                  <td className="px-5 py-4">
                    {statusBadge(s.status)}
                  </td>

                  <td className="px-5 py-4 text-right space-x-2">
                    {s.status === "pending" && (
                      <>
                        <button
                          disabled={actionLoading === s._id}
                          onClick={() => updateStatus(s._id, "approved")}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-white text-xs"
                        >
                          Approve
                        </button>

                        <button
                          disabled={actionLoading === s._id}
                          onClick={() => updateStatus(s._id, "rejected")}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-white text-xs"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}

              {sales.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    No listings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
