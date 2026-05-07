import { useEffect, useState } from "react";
import { getMySales, deleteSale, updateSaleStatus } from "../api/sale";
import { Link } from "react-router-dom";
import SellerLayout from "../components/seller/SellerLayout";
import { useAppLang } from "../context/AppLangContext";

const statusStyle = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "approved") return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
  if (s === "rejected") return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
  if (s === "sold") return "bg-gray-200 text-gray-800 dark:bg-slate-700 dark:text-slate-200";
  return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300";
};

export default function MySales() {
  const { copy, lang } = useAppLang();
  const t = copy.mySales;
  const numLocale = lang === "fr" ? "fr-FR" : "en-US";

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSales = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await getMySales();
      setSales(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(e?.response?.data?.message || t.loadFail);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(t.confirmDelete)) return;

    try {
      await deleteSale(id);
      setSales((prev) => prev.filter((s) => s._id !== id));
    } catch {
      alert(t.deleteFail);
    }
  };

  const toggleStatus = async (sale) => {
    const newStatus = sale.status === "sold" ? "approved" : "sold";

    try {
      await updateSaleStatus(sale._id, newStatus);
      setSales((prev) =>
        prev.map((s) =>
          s._id === sale._id ? { ...s, status: newStatus } : s
        )
      );
    } catch {
      alert(t.statusUpdateFail);
    }
  };

  const localizeStatus = (s) => {
    const k = (s || "").toLowerCase();
    return t.status[k] || s;
  };

  return (
    <SellerLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{t.title}</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            {t.sub}
          </p>
        </div>

        <Link
          to="/my-sales/new"
          className="px-6 py-3 bg-black dark:bg-violet-600 text-white rounded-2xl font-semibold hover:opacity-90 w-fit"
        >
          {t.addCar}
        </Link>
      </div>

      {/* States */}
      {loading && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-8 shadow-sm text-slate-700 dark:text-slate-300">
          {t.loading}
        </div>
      )}

      {error && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-8 shadow-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {!loading && sales.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-10 shadow-sm text-center">
          <p className="text-xl font-semibold text-slate-900 dark:text-white">{t.empty}</p>
          <p className="text-gray-600 dark:text-slate-400 mt-2">
            {t.emptySub}
          </p>

          <Link
            to="/my-sales/new"
            className="inline-block mt-6 px-6 py-3 bg-black dark:bg-violet-600 text-white rounded-xl hover:opacity-90"
          >
            {t.addCarPlain}
          </Link>
        </div>
      )}

      {/* Grid */}
      {!loading && sales.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sales.map((s) => {
            const image = s.images?.[0];

            return (
              <div
                key={s._id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md transition"
              >
                {/* Image */}
                <div className="h-48 bg-gray-100 dark:bg-slate-800">
                  {image ? (
                    <img
                      src={image}
                      className="w-full h-full object-cover"
                      alt={s.title}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 dark:text-slate-500">
                      {t.noImage}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg leading-tight text-slate-900 dark:text-white">
                      {s.title}
                    </h3>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle(
                        s.status
                      )}`}
                    >
                      {localizeStatus(s.status)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    {s.brand} {s.model} • {s.year}
                  </p>

                  <p className="text-sm text-gray-500 dark:text-slate-500">{s.city}</p>

                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {Number(s.price || 0).toLocaleString(numLocale)} MAD
                  </p>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={() => toggleStatus(s)}
                      className="px-4 py-2 text-sm rounded-xl bg-gray-900 dark:bg-violet-600 text-white hover:opacity-90"
                    >
                      {s.status === "sold" ? t.markActive : t.markSold}
                    </button>

                    <Link
                      to={`/my-sales/edit/${s._id}`}
                      className="px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                      {t.edit}
                    </Link>

                    <button
                      onClick={() => handleDelete(s._id)}
                      className="px-4 py-2 text-sm rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      {t.delete}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SellerLayout>
  );
}
