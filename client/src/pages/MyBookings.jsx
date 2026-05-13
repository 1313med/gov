import { useEffect, useState } from "react";
import { getMyBookings, confirmReturn, rescheduleMyBooking } from "../api/booking";
import { api } from "../api/axios";
import { Link } from "react-router-dom";
import { useAppLang } from "../context/AppLangContext";

function localYMD(d) {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Local calendar days from today to pickup day (0 = today, 1 = tomorrow). */
function calendarDaysUntilPickupDay(iso) {
  const s = new Date(iso);
  const startDay = new Date(s.getFullYear(), s.getMonth(), s.getDate());
  const n = new Date();
  const today = new Date(n.getFullYear(), n.getMonth(), n.getDate());
  return Math.round((startDay.getTime() - today.getTime()) / 86400000);
}

function addOneLocalDayYmd(ymdStr) {
  const p = String(ymdStr).split("-").map((x) => parseInt(x, 10));
  if (p.length !== 3 || p.some(Number.isNaN)) return localYMD(new Date());
  const d = new Date(p[0], p[1] - 1, p[2], 12, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  return localYMD(d);
}

/** Same rule as server: refund cancel if pickup is at least this many local calendar days after today. */
const CALENDAR_DAYS_REFUND_CANCEL_MIN = 2;

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
  const [rescheduling, setRescheduling] = useState(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(null);
  const [rsStart, setRsStart] = useState("");
  const [rsEnd, setRsEnd] = useState("");

  const load = () =>
    getMyBookings()
      .then((res) => setBookings(res.data))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const localizeStatus = (s) => t.status[s] || s;

  const handleCancel = async (b) => {
    const h = (new Date(b.startDate).getTime() - Date.now()) / 3600000;
    const cal = calendarDaysUntilPickupDay(b.startDate);
    const canRefundCancel = h >= 48 || cal >= CALENDAR_DAYS_REFUND_CANCEL_MIN;
    if (b.status === "confirmed" && canRefundCancel) {
      const paid = Number(b.totalAmount) || 0;
      const est = Math.max(0, Math.round(paid * 0.96 * 100) / 100);
      const msg =
        lang === "fr"
          ? `Remboursement estimé ~${est.toLocaleString("fr-FR")} MAD (frais 4 % sur ${paid.toLocaleString("fr-FR")} MAD). Confirmer l'annulation ?`
          : `Estimated refund ~${est.toLocaleString("en-US")} MAD (4% fee on ${paid.toLocaleString("en-US")} MAD paid). Confirm cancellation?`;
      if (!window.confirm(msg)) return;
    } else if (b.status === "pending") {
      if (!window.confirm(t.cancelConfirm)) return;
    } else {
      return;
    }

    setCancelling(b._id);
    try {
      await api.put(`/bookings/${b._id}/cancel`);
      load();
    } catch (err) {
      alert(err?.response?.data?.message || t.cancelFail);
    } finally { setCancelling(null); }
  };

  const openRescheduleModal = (b) => {
    setRsStart(localYMD(b.startDate));
    setRsEnd(localYMD(b.endDate));
    setRescheduleOpen(b);
  };

  const closeRescheduleModal = () => {
    if (rescheduling) return;
    setRescheduleOpen(null);
  };

  const submitRescheduleModal = async () => {
    if (!rescheduleOpen) return;
    const parse = (s) => {
      const p = String(s).trim().split("-").map((x) => parseInt(x, 10));
      if (p.length !== 3 || p.some(Number.isNaN)) return null;
      return new Date(p[0], p[1] - 1, p[2], 12, 0, 0, 0);
    };
    const start = parse(rsStart);
    const end = parse(rsEnd);
    if (!start || !end || end <= start) {
      alert(lang === "fr" ? "Choisissez une date de fin après le début." : "Pick an end date after the start date.");
      return;
    }
    const b = rescheduleOpen;
    setRescheduling(b._id);
    try {
      await rescheduleMyBooking(b._id, {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
      setRescheduleOpen(null);
      load();
    } catch (err) {
      alert(err?.response?.data?.message || (lang === "fr" ? "Échec" : "Failed"));
    } finally {
      setRescheduling(null);
    }
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
          const hoursUntilStart = (start) => (new Date(start).getTime() - Date.now()) / 3600000;
          const h = hoursUntilStart(b.startDate);
          const calDays = calendarDaysUntilPickupDay(b.startDate);
          const bookingLocked =
            b.status === "confirmed" && h > 0 && b.customerDateChangeUsed && calDays <= 1;
          const canCancel =
            b.status === "pending" ||
            (b.status === "confirmed" &&
              !bookingLocked &&
              (h >= 48 || calDays >= CALENDAR_DAYS_REFUND_CANCEL_MIN));
          const canOpenReschedule =
            (b.status === "pending" || b.status === "confirmed") &&
            !b.customerDateChangeUsed &&
            h > 0 &&
            calDays === 1;
          const isPastEndDate  = b.endDate && new Date() > new Date(b.endDate);
          const showReturnBtn  = b.status === "confirmed" && isPastEndDate && !b.customerConfirmedReturn;
          const days = b.startDate && b.endDate
            ? Math.ceil((new Date(b.endDate) - new Date(b.startDate)) / 86400000)
            : null;
          const offerRescheduleHint = calDays === 1 && !b.customerDateChangeUsed;

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
                  {b.status === "confirmed" && h > 0 && bookingLocked && (
                    <p className="mt-2 text-[12px] text-slate-600 dark:text-slate-300 font-semibold m-0 leading-snug rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/60 px-3 py-2.5 text-center">
                      {lang === "fr"
                        ? "Plus d’actions possibles : vous avez déjà modifié les dates une fois. La réservation est figée jusqu’au départ."
                        : "No further changes: you already updated your dates once. Your booking is set until pickup."}
                    </p>
                  )}
                  {b.status === "confirmed" && h > 0 && !bookingLocked && !(h >= 48 || calDays >= CALENDAR_DAYS_REFUND_CANCEL_MIN) && (
                    <p className="mt-2 text-[12px] text-amber-800 dark:text-amber-200/90 font-medium m-0 leading-snug">
                      {lang === "fr"
                        ? h <= 24
                          ? offerRescheduleHint
                            ? "Moins de 24h avant le départ : annulation non remboursable. Vous pouvez utiliser « Changer les dates » une seule fois si le véhicule est libre."
                            : "Moins de 24h avant le départ : annulation non remboursable."
                          : offerRescheduleHint
                            ? "Moins de 48h avant le départ : annulation en ligne indisponible. Vous pouvez utiliser « Changer les dates » une seule fois si le véhicule est libre."
                            : "Moins de 48h avant le départ : annulation en ligne indisponible."
                        : h <= 24
                          ? offerRescheduleHint
                            ? "Within 24h of pickup: not refundable. You may “Change dates” once if the car is available."
                            : "Within 24h of pickup: not refundable."
                          : offerRescheduleHint
                            ? "Within 48h of pickup: online cancellation is unavailable. You may “Change dates” once if the car is available."
                            : "Within 48h of pickup: online cancellation is unavailable."}
                    </p>
                  )}
                  {b.status === "confirmed" && h > 0 && !bookingLocked && (h >= 48 || calDays >= CALENDAR_DAYS_REFUND_CANCEL_MIN) && (
                    <p className="mt-2 text-[12px] text-emerald-800 dark:text-emerald-200/90 font-medium m-0 leading-snug">
                      {lang === "fr"
                        ? "Annulation remboursable : plus de 48h avant le départ, ou date de départ au calendrier dans au moins 2 jours (frais 4 %, voir confirmation à l’annulation)."
                        : "Refundable cancel: more than 48h before pickup, or pickup is at least two calendar days away (4% fee; see confirmation when you cancel)."}
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

                {canOpenReschedule && (
                  <button
                    type="button"
                    onClick={() => openRescheduleModal(b)}
                    disabled={rescheduling === b._id}
                    className="text-xs font-semibold text-slate-700 dark:text-slate-200 bg-transparent border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1 cursor-pointer disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    {rescheduling === b._id
                      ? lang === "fr"
                        ? "Mise à jour…"
                        : "Updating…"
                      : lang === "fr"
                        ? "Changer les dates (1×)"
                        : "Change dates (once)"}
                  </button>
                )}

                {canCancel && (
                  <button
                    type="button"
                    onClick={() => handleCancel(b)}
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

      {rescheduleOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reschedule-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeRescheduleModal();
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="reschedule-title" className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {lang === "fr" ? "Nouvelles dates" : "New dates"}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 m-0 leading-snug">
              {lang === "fr"
                ? "Sélectionnez les dates dans le calendrier du navigateur. Une seule modification ; la disponibilité est vérifiée à l’enregistrement."
                : "Pick dates using your browser’s date picker. One change; availability is checked when you save."}
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="rs-start" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  {lang === "fr" ? "Début" : "Start"}
                </label>
                <input
                  id="rs-start"
                  type="date"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  value={rsStart}
                  min={localYMD(new Date())}
                  onChange={(e) => {
                    const v = e.target.value;
                    setRsStart(v);
                    const minEnd = addOneLocalDayYmd(v);
                    if (!rsEnd || rsEnd <= v) setRsEnd(minEnd);
                  }}
                />
              </div>
              <div>
                <label htmlFor="rs-end" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  {lang === "fr" ? "Fin" : "End"}
                </label>
                <input
                  id="rs-end"
                  type="date"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  value={rsEnd}
                  min={rsStart ? addOneLocalDayYmd(rsStart) : localYMD(new Date())}
                  onChange={(e) => setRsEnd(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={closeRescheduleModal}
                disabled={!!rescheduling}
                className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                {lang === "fr" ? "Fermer" : "Close"}
              </button>
              <button
                type="button"
                onClick={submitRescheduleModal}
                disabled={!!rescheduling}
                className="rounded-lg border-0 bg-indigo-600 dark:bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 dark:hover:bg-violet-500 disabled:opacity-50"
              >
                {rescheduling
                  ? lang === "fr"
                    ? "Enregistrement…"
                    : "Saving…"
                  : lang === "fr"
                    ? "Enregistrer"
                    : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
