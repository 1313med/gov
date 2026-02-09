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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold">Rent a car</h1>
          <p className="text-gray-500 mt-1">
            Choose from verified rental cars
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Filter
            placeholder="City"
            value={filters.city}
            onChange={(v) => setFilters({ ...filters, city: v })}
          />

          <Filter
            type="number"
            placeholder="Min MAD/day"
            value={filters.minPrice}
            onChange={(v) => setFilters({ ...filters, minPrice: v })}
          />

          <Filter
            type="number"
            placeholder="Max MAD/day"
            value={filters.maxPrice}
            onChange={(v) => setFilters({ ...filters, maxPrice: v })}
          />

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
            className="border rounded-xl p-3"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
            className="border rounded-xl p-3"
          />

          <button
            onClick={fetchRentals}
            className="lg:col-span-5 bg-black text-white py-3 rounded-xl"
          >
            Apply filters
          </button>
        </div>

        {/* Grid */}
        <div className="grid gap-8 mt-10 sm:grid-cols-2 lg:grid-cols-3">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} />
            ))}

          {!loading &&
            rentals.map((r) => (
              <Link
                key={r._id}
                to={`/rentals/${r._id}`}
                className="bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden"
              >
                <div className="h-52 bg-gray-100 flex items-center justify-center">
                  {r.images?.[0] ? (
                    <img
                      src={r.images[0]}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "No image"
                  )}
                </div>

                <div className="p-5">
                  <p className="font-semibold text-lg">{r.title}</p>
                  <p className="text-sm text-gray-600">
                    {r.brand} {r.model} • {r.year}
                  </p>
                  <p className="text-sm text-gray-500">{r.city}</p>
                  <p className="text-xl font-bold mt-2">
                    {r.pricePerDay} MAD / day
                  </p>
                </div>
              </Link>
            ))}
        </div>

        {!loading && rentals.length === 0 && (
          <div className="text-center mt-16">
            <p className="text-xl font-semibold">No rentals found 🚗</p>
            <p className="text-gray-500 mt-2">
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Filter({ placeholder, value, onChange, type = "text" }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded-xl p-3"
    />
  );
}

function Skeleton() {
  return (
    <div className="bg-white rounded-2xl shadow animate-pulse h-80" />
  );
}
