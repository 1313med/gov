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
          <h1 className="text-3xl font-extrabold">Find your next car</h1>
          <p className="text-gray-500 mt-1">
            Browse verified listings from trusted sellers
          </p>
        </div>

        {/* ================= FILTER BAR ================= */}
        <div className="bg-white rounded-2xl shadow p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FilterInput
  placeholder="Search cars (brand, model, city...)"
  value={filters.search}
  onChange={(v) => setFilters((f) => ({ ...f, search: v }))}
 />

          <FilterInput
            placeholder="Brand"
            value={filters.brand}
            onChange={(v) => setFilters((f) => ({ ...f, brand: v }))}
          />
          <FilterInput
            placeholder="City"
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

          {/* Skeletons */}
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}

          {/* Cars */}
          {!loading &&
            cars.map((c) => {
              const isFav = favorites.includes(c._id);
              const firstImage = c.images?.[0];

              return (
                <Link
                  key={c._id}
                  to={`/cars/${c._id}`}
                  className="group bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden"
                >
                  <div className="relative h-52 bg-gray-100">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}

                    <button
                      onClick={(e) => toggleFavorite(c._id, e)}
                      className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center bg-white/80 ${
                        isFav ? "text-red-500" : "text-gray-700"
                      }`}
                    >
                      ❤
                    </button>
                  </div>

                  <div className="p-5 space-y-2">
                    <p className="font-semibold text-lg truncate">
                      {c.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {c.brand} {c.model} • {c.year}
                    </p>
                    <p className="text-sm text-gray-500">{c.city}</p>
                    <p className="text-xl font-extrabold pt-2">
                      {c.price} MAD
                    </p>
                  </div>
                </Link>
              );
            })}
        </div>

        {/* ================= EMPTY STATE ================= */}
        {!loading && cars.length === 0 && (
          <div className="text-center mt-16">
            <p className="text-xl font-semibold">
              No cars found 🚗
            </p>
            <p className="text-gray-500 mt-2">
              Try adjusting your filters
            </p>
          </div>
        )}

        {/* ================= LOAD MORE ================= */}
        {hasMore && !loading && cars.length > 0 && (
          <div className="flex justify-center mt-12">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-10 py-4 bg-black text-white rounded-full hover:scale-105 transition"
            >
              Load more cars
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function FilterInput({ placeholder, value, onChange, type = "text" }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-black/20"
    />
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden animate-pulse">
      <div className="h-52 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}
