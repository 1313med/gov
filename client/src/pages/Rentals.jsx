import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApprovedRentals } from "../api/rental";

export default function Rentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    city: "",
    minPrice: "",
    maxPrice: "",
    startDate: "",
    endDate: "",
  });

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const res = await getApprovedRentals(filters);
      setRentals(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-white to-white">

      {/* ================= HERO ================= */}
      <div className="relative bg-black h-[40vh] flex items-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1502877338535-766e1452684a"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          alt=""
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-white">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Premium Car Rentals
          </h1>
          <p className="mt-4 text-gray-200 text-lg max-w-2xl">
            Flexible booking. Trusted owners. Instant confirmation.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">

        {/* ================= MODERN FILTER PANEL ================= */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-8 grid gap-6 md:grid-cols-2 lg:grid-cols-5">

          <ModernInput
            placeholder="City"
            value={filters.city}
            onChange={(v) => setFilters({ ...filters, city: v })}
          />

          <ModernInput
            type="number"
            placeholder="Min MAD/day"
            value={filters.minPrice}
            onChange={(v) => setFilters({ ...filters, minPrice: v })}
          />

          <ModernInput
            type="number"
            placeholder="Max MAD/day"
            value={filters.maxPrice}
            onChange={(v) => setFilters({ ...filters, maxPrice: v })}
          />

          <DateInput
            label="Start Date"
            value={filters.startDate}
            onChange={(v) => setFilters({ ...filters, startDate: v })}
          />

          <DateInput
            label="End Date"
            value={filters.endDate}
            onChange={(v) => setFilters({ ...filters, endDate: v })}
          />

          <button
            onClick={fetchRentals}
            className="lg:col-span-5 mt-4 bg-black text-white py-4 rounded-2xl hover:scale-105 transition shadow-lg"
          >
            Apply Filters
          </button>
        </div>

        {/* ================= GRID ================= */}
        <div className="grid gap-12 mt-20 sm:grid-cols-2 lg:grid-cols-3">

          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} />
            ))}

          {!loading &&
            rentals.map((r) => (
              <Link
                key={r._id}
                to={`/rentals/${r._id}`}
                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-3"
              >
                <div className="relative h-64 overflow-hidden">
                  {r.images?.[0] ? (
                    <img
                      src={r.images[0]}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-7 space-y-4">
                  <h3 className="font-bold text-xl truncate">
                    {r.title}
                  </h3>

                  <p className="text-gray-600 text-sm">
                    {r.brand} {r.model} • {r.year}
                  </p>

                  <p className="text-gray-500 text-sm">
                    📍 {r.city}
                  </p>

                  <div className="pt-4 border-t flex items-center justify-between">
                    <span className="text-2xl font-extrabold">
                      {r.pricePerDay} MAD
                    </span>
                    <span className="text-sm text-gray-400">
                      / day
                    </span>
                  </div>
                </div>
              </Link>
            ))}
        </div>

        {/* ================= EMPTY ================= */}
        {!loading && rentals.length === 0 && (
          <div className="text-center py-28">
            <h3 className="text-3xl font-bold">
              No rentals found 🚗
            </h3>
            <p className="text-gray-500 mt-4">
              Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= MODERN INPUT ================= */

function ModernInput({ placeholder, value, onChange, type = "text" }) {
  return (
    <div className="relative">
      <input
        type={type}
        placeholder=" "
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="peer w-full border border-gray-200 bg-white/80 rounded-2xl px-4 pt-6 pb-3 focus:outline-none focus:ring-2 focus:ring-black/20 transition"
      />
      <label className="absolute left-4 top-3 text-gray-400 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-focus:top-3 peer-focus:text-sm peer-focus:text-black">
        {placeholder}
      </label>
    </div>
  );
}

/* ================= DATE INPUT ================= */

function DateInput({ label, value, onChange }) {
  return (
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 bg-white/80 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-black/20 transition"
      />
      <span className="absolute -top-2 left-4 bg-white px-2 text-xs text-gray-500">
        {label}
      </span>
    </div>
  );
}

/* ================= SKELETON ================= */

function Skeleton() {
  return (
    <div className="bg-white rounded-3xl shadow-lg animate-pulse">
      <div className="h-64 bg-gray-200" />
      <div className="p-7 space-y-4">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}
