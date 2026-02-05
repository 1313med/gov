import { useEffect, useState } from "react";
import { getMySales, deleteSale, updateSaleStatus } from "../api/sale";
import { Link } from "react-router-dom";
import SellerLayout from "../components/seller/SellerLayout";

const statusStyle = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "approved") return "bg-green-100 text-green-700";
  if (s === "rejected") return "bg-red-100 text-red-700";
  if (s === "sold") return "bg-gray-200 text-gray-800";
  return "bg-orange-100 text-orange-700";
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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;

    try {
      await deleteSale(id);
      setSales((prev) => prev.filter((s) => s._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  const toggleStatus = async (sale) => {
    const newStatus = sale.status === "sold" ? "approved" : "sold";

    try {
      await updateSaleStatus(sale._id, newStatus);
      setSales((prev) =>
        prev.map((s) =>
          s._id === sale._id ? { ...s, status: newStatus } : s
        )
      );
    } catch {
      alert("Failed to update status");
    }
  };

  return (
    <SellerLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold">My Listings</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your car listings
          </p>
        </div>

        <Link
          to="/my-sales/new"
          className="px-6 py-3 bg-black text-white rounded-2xl font-semibold hover:opacity-90 w-fit"
        >
          + Add Car
        </Link>
      </div>

      {/* States */}
      {loading && (
        <div className="bg-white rounded-2xl border p-8 shadow-sm">
          Loading your listings...
        </div>
      )}

      {error && (
        <div className="bg-white rounded-2xl border p-8 shadow-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && sales.length === 0 && (
        <div className="bg-white rounded-2xl border p-10 shadow-sm text-center">
          <p className="text-xl font-semibold">No listings yet</p>
          <p className="text-gray-600 mt-2">
            Add your first car to start selling
          </p>

          <Link
            to="/my-sales/new"
            className="inline-block mt-6 px-6 py-3 bg-black text-white rounded-xl hover:opacity-90"
          >
            Add Car
          </Link>
        </div>
      )}

      {/* Grid */}
      {!loading && sales.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sales.map((s) => {
            const image = s.images?.[0];

            return (
              <div
                key={s._id}
                className="bg-white rounded-3xl border shadow-sm overflow-hidden hover:shadow-md transition"
              >
                {/* Image */}
                <div className="h-48 bg-gray-100">
                  {image ? (
                    <img
                      src={image}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg leading-tight">
                      {s.title}
                    </h3>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle(
                        s.status
                      )}`}
                    >
                      {s.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600">
                    {s.brand} {s.model} • {s.year}
                  </p>

                  <p className="text-sm text-gray-500">{s.city}</p>

                  <p className="text-xl font-bold">
                    {s.price.toLocaleString()} MAD
                  </p>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={() => toggleStatus(s)}
                      className="px-4 py-2 text-sm rounded-xl bg-gray-900 text-white hover:opacity-90"
                    >
                      {s.status === "sold" ? "Mark Active" : "Mark Sold"}
                    </button>

                    <Link
                      to={`/my-sales/edit/${s._id}`}
                      className="px-4 py-2 text-sm rounded-xl border hover:bg-gray-100"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(s._id)}
                      className="px-4 py-2 text-sm rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SellerLayout>
  );
}
