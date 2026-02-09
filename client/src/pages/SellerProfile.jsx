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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading seller profile...
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Seller not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Seller Header */}
        <div className="bg-white rounded-3xl border shadow-sm p-8 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold">{seller.name}</h1>

              {seller.city && (
                <p className="mt-2 text-gray-600">{seller.city}</p>
              )}

              <p className="mt-2 text-sm text-gray-400">
                Active listings: {cars.length}
              </p>
            </div>

            {auth?.token && (
              <div className="flex gap-3">
                <a
                  href={`tel:${seller.phone}`}
                  className="px-6 py-3 bg-black text-white rounded-2xl font-semibold hover:opacity-90"
                >
                  Call
                </a>

                <a
                  href={`https://wa.me/${seller.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-green-600 text-white rounded-2xl font-semibold hover:opacity-90"
                >
                  WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Listings */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            Cars listed by {seller.name}
          </h2>
          <p className="text-gray-600 mt-1">
            Browse all active listings from this seller
          </p>
        </div>

        {cars.length === 0 ? (
          <div className="bg-white rounded-2xl border p-10 text-center text-gray-600">
            This seller has no active listings.
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((c) => (
              <Link
                key={c._id}
                to={`/cars/${c._id}`}
                className="bg-white rounded-3xl border shadow-sm overflow-hidden hover:shadow-md transition"
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

                <div className="p-5 space-y-2">
                  <p className="font-semibold text-lg truncate">
                    {c.title}
                  </p>

                  <p className="text-sm text-gray-600">
                    {c.brand} {c.model} • {c.year}
                  </p>

                  <p className="text-xl font-bold">
                    {c.price} MAD
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12">
          <Link
            to="/cars"
            className="text-gray-600 hover:underline"
          >
            ← Back to marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
