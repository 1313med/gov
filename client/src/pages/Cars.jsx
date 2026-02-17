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
    search: "",
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

  /* ===================== DEBOUNCE ===================== */
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

  /* ===================== FETCH ===================== */
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

  /* ===================== FAVORITES ===================== */
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
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-white to-white">

      {/* ================= HERO ================= */}
      <div className="relative h-[40vh] flex items-center bg-black overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1502877338535-766e1452684a"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          alt=""
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-white">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Premium Car Marketplace
          </h1>
          <p className="mt-4 text-gray-200 text-lg max-w-2xl">
            Buy with confidence. Verified listings. Transparent pricing.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">

        {/* ================= MODERN FILTER PANEL ================= */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-8 grid gap-6 md:grid-cols-2 lg:grid-cols-5">

          <ModernInput
            placeholder="Search brand, model..."
            value={filters.search}
            onChange={(v) => setFilters((f) => ({ ...f, search: v }))}
          />

          <ModernInput
            placeholder="Brand"
            value={filters.brand}
            onChange={(v) => setFilters((f) => ({ ...f, brand: v }))}
          />

          <ModernInput
            placeholder="City"
            value={filters.city}
            onChange={(v) => setFilters((f) => ({ ...f, city: v }))}
          />

          <ModernInput
            type="number"
            placeholder="Min price"
            value={filters.minPrice}
            onChange={(v) => setFilters((f) => ({ ...f, minPrice: v }))}
          />

          <ModernInput
            type="number"
            placeholder="Max price"
            value={filters.maxPrice}
            onChange={(v) => setFilters((f) => ({ ...f, maxPrice: v }))}
          />
        </div>

        {/* ================= GRID ================= */}
        <div className="grid mt-20 gap-12 sm:grid-cols-2 lg:grid-cols-3">

          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}

          {!loading &&
            cars.map((c) => {
              const isFav = favorites.includes(c._id);
              const firstImage = c.images?.[0];

              return (
                <Link
                  key={c._id}
                  to={`/cars/${c._id}`}
                  className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-3"
                >
                  <div className="relative h-64 overflow-hidden">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                        No Image
                      </div>
                    )}

                    <button
                      onClick={(e) => toggleFavorite(c._id, e)}
                      className={`absolute top-5 right-5 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md bg-white/80 text-xl shadow ${
                        isFav ? "text-red-500" : "text-gray-700"
                      }`}
                    >
                      ❤
                    </button>
                  </div>

                  <div className="p-7 space-y-4">
                    <h3 className="font-bold text-xl truncate">
                      {c.title}
                    </h3>

                    <p className="text-gray-600 text-sm">
                      {c.brand} {c.model} • {c.year}
                    </p>

                    <p className="text-gray-500 text-sm">
                      📍 {c.city}
                    </p>

                    <div className="pt-4 border-t flex items-center justify-between">
                      <span className="text-2xl font-extrabold">
                        {c.price} MAD
                      </span>
                      <span className="text-sm text-gray-400 group-hover:text-black transition">
                        View →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>

        {/* ================= EMPTY ================= */}
        {!loading && cars.length === 0 && (
          <div className="text-center py-28">
            <h3 className="text-3xl font-bold">
              No cars found 🚗
            </h3>
            <p className="text-gray-500 mt-4">
              Try adjusting your filters.
            </p>
          </div>
        )}

        {/* ================= LOAD MORE ================= */}
        {hasMore && !loading && cars.length > 0 && (
          <div className="flex justify-center mt-20 pb-24">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-14 py-4 bg-black text-white rounded-full hover:scale-105 transition-all duration-300 shadow-xl"
            >
              Load More Cars
            </button>
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
      <label className="absolute left-4 top-3 text-gray-400 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-3 peer-focus:text-sm peer-focus:text-black">
        {placeholder}
      </label>
    </div>
  );
}

/* ================= SKELETON ================= */

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden animate-pulse">
      <div className="h-64 bg-gray-200" />
      <div className="p-7 space-y-4">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}
