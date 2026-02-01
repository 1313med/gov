import { useEffect, useState } from "react";
import { getMySales, deleteSale, updateSaleStatus } from "../api/sale";
import { Link } from "react-router-dom";
import SellerLayout from "../components/seller/SellerLayout";

const statusBadge = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "approved") return "bg-green-100 text-green-700";
  if (s === "rejected") return "bg-red-100 text-red-700";
  if (s === "sold") return "bg-gray-200 text-gray-800";
  return "bg-orange-100 text-orange-700"; // pending
};

export default function MySales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSales = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await getMySales();
      setSales(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load your listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // ===================== DELETE =====================
  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this listing?");
    if (!ok) return;

    try {
      await deleteSale(id);
      setSales((prev) => prev.filter((s) => s._id !== id));
    } catch (e) {
      alert(e?.response?.data?.message || "Delete failed");
    }
  };

  // ===================== STATUS TOGGLE =====================
  const toggleStatus = async (sale) => {
    const newStatus = sale.status === "sold" ? "approved" : "sold";

    try {
      await updateSaleStatus(sale._id, newStatus);

      setSales((prev) =>
        prev.map((s) =>
          s._id === sale._id ? { ...s, status: newStatus } : s
        )
      );
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <SellerLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Listings</h1>

        <Link
          to="/my-sales/new"
          className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-90"
        >
          + Add Car
        </Link>
      </div>

      {loading && (
        <div className="bg-white p-6 rounded-xl border shadow">
          Loading your listings...
        </div>
      )}

      {error && (
        <div className="bg-white p-6 rounded-xl border shadow text-red-600">
          {error}
        </div>
      )}

      {!loading && sales.length === 0 && (
        <div className="bg-white p-6 rounded-xl border shadow">
          <p className="font-semibold">No listings yet.</p>
          <p className="text-sm text-gray-600 mt-1">
            Start by adding your first car.
          </p>
        </div>
      )}

      {!loading && sales.length > 0 && (
        <div className="bg-white rounded-xl border shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Car</th>
                <th className="px-4 py-3 text-left">City</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {sales.map((s) => (
                <tr key={s._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.title}</td>

                  <td className="px-4 py-3">
                    {s.brand} {s.model} ({s.year})
                  </td>

                  <td className="px-4 py-3">{s.city}</td>

                  <td className="px-4 py-3 font-semibold">
                    {s.price} MAD
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge(
                        s.status
                      )}`}
                    >
                      {s.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right space-x-2">
                    {/* STATUS TOGGLE */}
                    <button
                      onClick={() => toggleStatus(s)}
                      className={`px-3 py-1 rounded text-white ${
                        s.status === "sold"
                          ? "bg-green-600"
                          : "bg-gray-700"
                      }`}
                    >
                      {s.status === "sold" ? "Mark Active" : "Mark Sold"}
                    </button>

                    <Link
                      to={`/my-sales/edit/${s._id}`}
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(s._id)}
                      className="px-3 py-1 bg-black text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SellerLayout>
  );
}
