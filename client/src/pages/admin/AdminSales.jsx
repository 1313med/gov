import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { api } from "../../api/axios";

export default function AdminSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    const res = await api.get("/sale/admin");
    setSales(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/sale/admin/${id}/status`, { status });
    fetchSales();
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">All Listings</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Seller</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {sales.map((s) => (
                <tr key={s._id} className="border-t border-gray-700">
                  <td className="px-4 py-3">{s.title}</td>
                  <td className="px-4 py-3">{s.sellerId?.name || "—"}</td>
                  <td className="px-4 py-3">{s.status}</td>

                  <td className="px-4 py-3 text-right space-x-2">
                    {s.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(s._id, "approved")}
                          className="px-3 py-1 bg-green-600 rounded"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => updateStatus(s._id, "rejected")}
                          className="px-3 py-1 bg-red-600 rounded"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
