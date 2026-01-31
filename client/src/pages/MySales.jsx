import { useEffect, useState } from "react";
import { getMySales, deleteSale } from "../api/sale";
import { Link } from "react-router-dom";


const badgeClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "approved") return "bg-green-100 text-green-700";
  if (s === "rejected") return "bg-red-100 text-red-700";
  if (s === "sold") return "bg-gray-200 text-gray-800";
  return "bg-orange-100 text-orange-700"; // pending default
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
      const data = Array.isArray(res.data) ? res.data : [];
      setSales(data);
    } catch (e) {
      console.error("GET /sale/mine failed:", e);

      if (e?.response?.status === 403) {
        setError(
          "You are not a seller. Switch to a seller account to see your listings."
        );
      } else {
        setError(e?.response?.data?.message || "Failed to load your sales");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleDelete = async (saleId) => {
    const ok = window.confirm("Are you sure you want to delete this listing?");
    if (!ok) return;

    try {
      await deleteSale(saleId);
      setSales((prev) => prev.filter((s) => s._id !== saleId));
    } catch (e) {
      console.error("DELETE failed:", e);
      alert(e?.response?.data?.message || "Failed to delete. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white border rounded-2xl p-6">
          <p className="text-gray-600">Loading your listings...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white border rounded-2xl p-6">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );

 return (
  <div className="max-w-6xl mx-auto px-4 py-8">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">My Sales</h2>
    </div>

    {sales.length === 0 ? (
      <div className="mt-6 bg-white border rounded-2xl p-6">
        <p className="font-semibold text-gray-800">No listings yet.</p>
        <p className="text-sm text-gray-600 mt-1">
          Create a listing and it will appear here.
        </p>
      </div>
    ) : (
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {sales.map((s) => (
          <div key={s._id} className="border rounded-lg p-4 shadow-sm bg-white">
            <p className="font-semibold text-lg">{s.title}</p>

            <p className="text-gray-700 mt-1">
              <b>Car:</b> {s.brand} {s.model} ({s.year})
            </p>

            <p className="text-gray-700 mt-1">
              <b>City:</b> {s.city}
            </p>

            <p className="text-gray-900 font-bold mt-1">
              {s.price} MAD
            </p>

            {/* STATUS */}
            <span
              className={`inline-block px-3 py-1 text-sm rounded mt-2 ${
                s.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : s.status === "rejected"
                  ? "bg-red-100 text-red-700"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              {s.status}
            </span>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3 mt-4">

              <Link
                to={`/my-sales/edit/${s._id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Edit
              </Link>

              <button
                onClick={() => handleDelete(s._id)}
                className="px-4 py-2 bg-black text-white rounded"
              >
                Delete
              </button>

            </div>

          </div>
        ))}
      </div>
    )}
  </div>
);
}