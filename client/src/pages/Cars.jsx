import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { getApprovedSales } from "../api/sale";
import { addFavorite, removeFavorite, getFavorites } from "../api/user";
import { loadAuth } from "../utils/authStorage";

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [filters, setFilters] = useState({
    brand: "",
    city: "",
    minPrice: "",
    maxPrice: "",
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const isFirstRender = useRef(true);

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const auth = loadAuth();

  // ===================== DEBOUNCE =====================
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
      setPage(1);
    }, 800);

    return () => clearTimeout(timer);
  }, [filters]);

  // ===================== FETCH =====================
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);

        const res = await getApprovedSales({
          ...debouncedFilters,
          page,
          limit: 9,
        });

        const newCars = res.data.items || [];

        setCars((prev) =>
          page === 1 ? newCars : [...prev, ...newCars]
        );

        setHasMore(page < res.data.pages);
      } catch {
        setError("Failed to load cars");
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [debouncedFilters, page]);

  // ===================== FAVORITES =====================
  useEffect(() => {
    if (!auth?.token) return;
    getFavorites().then((res) =>
      setFavorites(res.data.map((x) => x._id))
    );
  }, []);

  const toggleFavorite = async (carId, e) => {
    e.preventDefault();
    if (!auth?.token) return alert("Please login to save favorites");

    const isFav = favorites.includes(carId);

    try {
      if (isFav) {
        await removeFavorite(carId);
        setFavorites((p) => p.filter((id) => id !== carId));
      } else {
        await addFavorite(carId);
        setFavorites((p) => [...p, carId]);
      }
    } catch {
      alert("Failed to update favorites");
    }
  };

  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ================= HEADER ================= */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Find your next car
          </h1>
          <p className="text-gray-500 mt-1">
            Browse verified listings from trusted sellers
          </p>
        </div>

        {/* ================= FILTER BAR ================= */}
        <div className="bg-white rounded-2xl shadow p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FilterInput
            placeholder="Brand (e.g. Toyota)"
            value={filters.brand}
            onChange={(v) => setFilters((f) => ({ ...f, brand: v }))}
          />

          <FilterInput
            placeholder="City (e.g. Casablanca)"
            value={filters.city}
            onChange={(v) => setFilters((f) => ({ ...f, city: v }))}
          />

          <FilterInput
            type="number"
            placeholder="Min price"
            value={filters.minPrice}
            onChange={(v) => setFilters((f) => ({ ...f, minPrice: v }))}
          />

          <FilterInput
            type="number"
            placeholder="Max price"
            value={filters.maxPrice}
            onChange={(v) => setFilters((f) => ({ ...f, maxPrice: v }))}
          />
        </div>

        {/* ================= GRID ================= */}
        <div className="grid mt-10 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((c) => {
            const isFav = favorites.includes(c._id);
            const firstImage = c.images?.[0];

            return (
              <Link
                key={c._id}
                to={`/cars/${c._id}`}
                className="group bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-52 bg-gray-100">
                  {firstImage ? (
                    <img
                      src={firstImage}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}

                  {/* Favorite */}
                  <button
                    onClick={(e) => toggleFavorite(c._id, e)}
                    className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur bg-white/70 ${
                      isFav ? "text-red-500" : "text-gray-700"
                    }`}
                  >
                    ❤
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2">
                  <p className="font-semibold text-lg truncate">
                    {c.title}
                  </p>

                  <p className="text-sm text-gray-600">
                    {c.brand} {c.model} • {c.year}
                  </p>

                  <p className="text-sm text-gray-500">{c.city}</p>

                  <div className="pt-2 flex items-center justify-between">
                    <p className="text-xl font-extrabold">
                      {c.price} MAD
                    </p>

                    <span className="text-sm text-blue-600 opacity-0 group-hover:opacity-100 transition">
                      View →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ================= LOAD MORE ================= */}
        {hasMore && !loading && (
          <div className="flex justify-center mt-12">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-10 py-4 bg-black text-white rounded-full text-lg hover:scale-105 transition"
            >
              Load more cars
            </button>
          </div>
        )}

        {loading && (
          <p className="text-center text-gray-500 mt-8">
            Loading cars...
          </p>
        )}
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENT ================= */
function FilterInput({ placeholder, value, onChange, type = "text" }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20"
    />
  );
}
