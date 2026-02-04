import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/axios";
import { loadAuth } from "../utils/authStorage";

export default function SellerProfile() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth = loadAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/user/seller/${id}`);

        setSeller(res.data.seller);
        setCars(res.data.listings || []);
      } catch {
        setSeller(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <p className="p-6">Loading seller...</p>;
  if (!seller) return <p className="p-6 text-red-600">Seller not found</p>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Seller Card */}
        <div className="bg-white rounded-2xl shadow p-6 mb-10">
          <h1 className="text-3xl font-extrabold">{seller.name}</h1>

          {seller.city && (
            <p className="text-gray-500 mt-1">{seller.city}</p>
          )}

          {auth?.token && (
            <div className="flex gap-4 mt-4">
              <a
                href={`tel:${seller.phone}`}
                className="px-6 py-3 bg-black text-white rounded-xl"
              >
                Call
              </a>

              <a
                href={`https://wa.me/${seller.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-green-600 text-white rounded-xl"
              >
                WhatsApp
              </a>
            </div>
          )}
        </div>

        {/* Listings */}
        <h2 className="text-2xl font-bold mb-6">
          Listings by {seller.name}
        </h2>

        {cars.length === 0 ? (
          <p className="text-gray-500">
            This seller has no active listings.
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((c) => (
              <Link
                key={c._id}
                to={`/cars/${c._id}`}
                className="bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden"
              >
                <div className="h-52 bg-gray-100">
                  {c.images?.[0] ? (
                    <img
                      src={c.images[0]}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <p className="font-semibold text-lg truncate">
                    {c.title}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {c.brand} {c.model} • {c.year}
                  </p>
                  <p className="font-bold mt-2">
                    {c.price} MAD
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Link
          to="/cars"
          className="inline-block mt-10 text-blue-600 hover:underline"
        >
          ← Back to marketplace
        </Link>
      </div>
    </div>
  );
}
