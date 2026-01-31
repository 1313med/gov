import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApprovedSales } from "../api/sale";
import { addFavorite, removeFavorite, getFavorites } from "../api/user";
import { loadAuth } from "../utils/authStorage";

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const auth = loadAuth();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const res = await getApprovedSales();
        setCars(Array.isArray(res.data) ? res.data : []);

        if (auth?.token) {
          const favRes = await getFavorites();
          setFavorites(favRes.data.map((x) => x._id));
        }
      } catch {
        setError("Failed to load cars");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
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

  if (loading) return <p className="p-6">Loading cars...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold">Available Cars</h2>

      <div className="grid mt-6 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cars.map((c) => {
          const isFav = favorites.includes(c._id);
          const firstImage = c.images?.[0];

          return (
            <Link
              key={c._id}
              to={`/cars/${c._id}`}
              className="bg-white border rounded-xl shadow hover:shadow-lg transition overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-100">
                {firstImage ? (
                  <img
                    src={firstImage}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}

                {/* Favorite Heart */}
                <button
                  onClick={(e) => toggleFavorite(c._id, e)}
                  className={`absolute top-3 right-3 text-3xl ${
                    isFav ? "text-red-500" : "text-white/80"
                  } drop-shadow hover:scale-110 transition`}
                >
                  ❤
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="font-semibold text-lg truncate">{c.title}</p>

                <p className="text-gray-700 mt-1">
                  {c.brand} {c.model} • {c.year}
                </p>

                <p className="text-gray-600 text-sm">{c.city}</p>

                <p className="text-xl font-bold text-black mt-2">
                  {c.price} MAD
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
