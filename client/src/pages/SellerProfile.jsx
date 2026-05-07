import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/axios";
import { loadAuth } from "../utils/authStorage";
import { useAppLang } from "../context/AppLangContext";

export default function SellerProfile() {
  const { id } = useParams();
  const { copy, lang } = useAppLang();
  const t = copy.sellerProfile;
  const numLocale = lang === "fr" ? "fr-FR" : "en-US";

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
      <div className="min-h-screen flex items-center justify-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950">
        {t.loading}
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 dark:text-red-400 bg-slate-50 dark:bg-slate-950">
        {t.notFound}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Seller Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm p-8 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">{seller.name}</h1>

              {seller.city && (
                <p className="mt-2 text-gray-600 dark:text-slate-400">{seller.city}</p>
              )}

              <p className="mt-2 text-sm text-gray-400 dark:text-slate-500">
                {t.activeListings}: {cars.length}
              </p>
            </div>

            {auth?._id && (
              <div className="flex gap-3">
                <a
                  href={`tel:${seller.phone}`}
                  className="px-6 py-3 bg-black dark:bg-violet-600 text-white rounded-2xl font-semibold hover:opacity-90"
                >
                  {t.call}
                </a>

                <a
                  href={`https://wa.me/${seller.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-green-600 text-white rounded-2xl font-semibold hover:opacity-90"
                >
                  {t.whatsapp}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Listings */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t.carsBy} {seller.name}
          </h2>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            {t.carsSub}
          </p>
        </div>

        {cars.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-10 text-center text-gray-600 dark:text-slate-400">
            {t.empty}
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((c) => (
              <Link
                key={c._id}
                to={`/cars/${c._id}`}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md transition"
              >
                <div className="h-52 bg-gray-100 dark:bg-slate-800">
                  {c.images?.[0] ? (
                    <img
                      src={c.images[0]}
                      className="w-full h-full object-cover"
                      alt={c.title}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 dark:text-slate-500">
                      {t.noImage}
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-2">
                  <p className="font-semibold text-lg truncate text-slate-900 dark:text-white">
                    {c.title}
                  </p>

                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    {c.brand} {c.model} • {c.year}
                  </p>

                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {Number(c.price || 0).toLocaleString(numLocale)} MAD
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12">
          <Link
            to="/cars"
            className="text-gray-600 dark:text-slate-400 hover:underline"
          >
            {t.back}
          </Link>
        </div>
      </div>
    </div>
  );
}
