import { useEffect, useState } from "react";
import { getMyBookings, confirmReturn } from "../api/booking";
import { api } from "../api/axios";
import { Link } from "react-router-dom";
import { useAppLang } from "../context/AppLangContext";

const STATUS_STYLES = {
  pending:   "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  confirmed: "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800",
  rejected:  "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
  cancelled: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600",
  completed: "bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800",
};

export default function MyBookings() {
  const { copy, lang } = useAppLang();
  const t = copy.myBookings;
  const dateLocale = lang === "fr" ? "fr-FR" : "en-US";
  const numLocale  = lang === "fr" ? "fr-FR" : "en-US";

  const [bookings,   setBookings]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [returning,  setReturning]  = useState(null);

  const load = () =>
    getMyBookings()
      .then((res) => setBookings(res.data))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const localizeStatus = (s) => t.status[s] || s;

  const handleCancel = async (id) => {
    if (!window.confirm(t.cancelConfirm)) return;
    setCancelling(id);
    try {
      await api.put(`/bookings/${id}/cancel`);
      load();
    } catch (err) {
      alert(err?.response?.data?.message || t.cancelFail);
    } finally { setCancelling(null); }
  };

  const handleConfirmReturn = async (id) => {
    setReturning(id);
    try {
      await confirmReturn(id);
      setBookings((prev) =>
        prev.map((b) => b._id === id ? { ...b, customerConfirmedReturn: true } : b)
      );
    } catch (err) {
      alert(err?.response?.data?.message || t.returnFail);
    } finally { setReturning(null); }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-500 dark:text-slate-400 font-sans">
        {t.loading}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 pb-16 pt-10 font-sans text-slate-900 dark:text-slate-100">
      <h1 className="text-2xl font-bold mb-1.5">{t.title}</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-7">
        {bookings.length} {bookings.length !== 1 ? t.bookingMany : t.bookingOne}
      </p>

      {bookings.length === 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-10 text-center text-slate-500 dark:text-slate-400">
          <p className="text-base mb-3">{t.empty}</p>
          <Link to="/rentals" className="text-indigo-600 dark:text-violet-400 font-semibold text-sm hover:underline">
            {t.browse}
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-3.5">
        {bookings.map((b) => {
          const badge = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
          const canCancel      = ["pending", "confirmed"].includes(b.status);
          const isPastEndDate  = b.endDate && new Date() > new Date(b.endDate);
          const showReturnBtn  = b.status === "confirmed" && isPastEndDate && !b.customerConfirmedReturn;
          const days = b.startDate && b.endDate
            ? Math.ceil((new Date(b.endDate) - new Date(b.startDate)) / 86400000)
            : null;

          return (
            <div
              key={b._id}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 md:p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    {b.rentalId?.title || t.fallbackName}
                  </h2>
                  <p className="text-[13px] text-slate-600 dark:text-slate-400 m-0">
                    {new Date(b.startDate).toLocaleDateString(dateLocale)} → {new Date(b.endDate).toLocaleDateString(dateLocale)}
                    {days ? (
                      <span className="ml-2 font-semibold text-slate-800 dark:text-slate-200">
                        ({days} {days !== 1 ? t.dayMany : t.dayOne})
                      </span>
                    ) : null}
                  </p>
                  {b.totalAmount && (
                    <p className="mt-1.5 text-[13px] font-semibold text-slate-800 dark:text-slate-200 m-0">
                      {t.total}: {Number(b.totalAmount).toLocaleString(numLocale)} MAD
                    </p>
                  )}
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${badge}`}>
                  {localizeStatus(b.status)}
                </span>
              </div>

              {showReturnBtn && (
                <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
                  <p className="m-0 text-[13px] font-medium text-amber-900 dark:text-amber-200">
                    {t.returnPrompt}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleConfirmReturn(b._id)}
                    disabled={returning === b._id}
                    className="shrink-0 rounded-lg border-0 bg-amber-500 px-4 py-2 text-[13px] font-bold text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-amber-600"
                  >
                    {returning === b._id ? t.returnConfirming : t.returnYes}
                  </button>
                </div>
              )}

              {b.customerConfirmedReturn && b.status === "confirmed" && (
                <p className="mt-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {t.returnedWaiting}
                </p>
              )}

              <div className="flex flex-wrap gap-2.5 mt-3.5">
                <Link
                  to={`/rentals/${b.rentalId?._id}`}
                  className="text-xs font-semibold text-indigo-600 dark:text-violet-400 no-underline hover:underline"
                >
                  {t.view}
                </Link>

                {canCancel && (
                  <button
                    type="button"
                    onClick={() => handleCancel(b._id)}
                    disabled={cancelling === b._id}
                    className="text-xs font-semibold text-red-600 dark:text-red-400 bg-transparent border border-red-200 dark:border-red-800 rounded-lg px-3 py-1 cursor-pointer disabled:opacity-50 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    {cancelling === b._id ? t.cancelling : t.cancel}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
