import { useEffect, useState } from "react";
import { getNotifications, markAsRead } from "../api/notification";
import { confirmReturn } from "../api/booking";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAppLang } from "../context/AppLangContext";
import SellerLayout from "../components/seller/SellerLayout";

const TYPE_COLORS = {
  approved:         { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", dot: "#22c55e" },
  rejected:         { bg: "#fef2f2", border: "#fecaca", text: "#dc2626", dot: "#ef4444" },
  pending:          { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", dot: "#3b82f6" },
  sold:             { bg: "#faf5ff", border: "#e9d5ff", text: "#7c3aed", dot: "#a855f7" },
  return_confirm:   { bg: "#fffbeb", border: "#fde68a", text: "#92400e", dot: "#f59e0b" },
  feedback_request: { bg: "#f5f3ff", border: "#ddd6fe", text: "#5b21b6", dot: "#7c3aed" },
};

export default function Notifications() {
  const { dark } = useTheme();
  const { copy, lang } = useAppLang();
  const t = copy.notifications;
  const dateLocale = lang === "fr" ? "fr-FR" : "en-US";
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");
  const [acting,   setActing]   = useState(null); // notificationId being acted on
  const [returned, setReturned] = useState(new Set()); // bookingIds already confirmed
  const { clearNotificationBadge } = useSocket();
  const navigate = useNavigate();

  const load = () =>
    getNotifications()
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    clearNotificationBadge();
  }, []);

  const handleRead = async (id) => {
    await markAsRead(id);
    setItems((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
  };

  const handleConfirmReturn = async (notifId, bookingId) => {
    if (!bookingId) return;
    setActing(notifId);
    try {
      await confirmReturn(bookingId);
      setReturned((prev) => new Set([...prev, bookingId.toString()]));
      await markAsRead(notifId);
      setItems((prev) => prev.map((n) => n._id === notifId ? { ...n, read: true } : n));
    } catch (err) {
      alert(err?.response?.data?.message || t.confirmReturnFail);
    } finally { setActing(null); }
  };

  const handleMarkAll = async () => {
    const unread = items.filter((n) => !n.read);
    await Promise.all(unread.map((n) => markAsRead(n._id)));
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filtered = filter === "all" ? items : filter === "unread" ? items.filter((n) => !n.read) : items.filter((n) => n.type === filter);
  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <SellerLayout>
      <div className="max-w-[680px] text-slate-900 dark:text-slate-100">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold m-0">{t.title}</h1>
            {unreadCount > 0 && (
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 m-0">
                {unreadCount} {t.unreadSuffix}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="py-2 px-4 rounded-[10px] text-[13px] font-medium border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {t.markAllRead}
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {[
            { key: "all",      label: t.filters.all },
            { key: "unread",   label: `${t.filters.unread}${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
            { key: "approved", label: t.filters.approved },
            { key: "rejected", label: t.filters.rejected },
            { key: "pending",  label: t.filters.pending },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`py-[7px] px-[14px] rounded-full border text-xs font-semibold cursor-pointer transition-colors ${
                filter === key
                  ? "border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-500"
                  : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[14px] border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-sm">
            {t.loading}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[14px] border border-slate-200 dark:border-slate-700 text-center text-slate-400 dark:text-slate-500 text-sm">
            {filter === "unread" ? t.emptyUnread : t.empty}
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {filtered.map((n) => {
            const colors = TYPE_COLORS[n.type] || TYPE_COLORS.pending;
            const readBg = dark ? "#1e293b" : "#fff";
            const readBorder = dark ? "#334155" : "#e5e7eb";
            return (
              <div
                key={n._id}
                style={{
                  background: n.read ? readBg : colors.bg,
                  border: `1px solid ${n.read ? readBorder : colors.border}`,
                  borderRadius: 14, padding: "16px 20px",
                  display: "flex", alignItems: "flex-start", gap: 14,
                  transition: "all .2s",
                }}
              >
                {/* Dot */}
                <div style={{
                  width: 10, height: 10, borderRadius: "50%", marginTop: 4, flexShrink: 0,
                  background: n.read ? "#d1d5db" : colors.dot,
                }} />

                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, color: dark ? "#e2e8f0" : "#111827", fontWeight: n.read ? 400 : 600, lineHeight: 1.5 }}>
                    {n.message}
                  </p>
                  <p style={{ margin: "5px 0 0", fontSize: 12, color: dark ? "#94a3b8" : "#9ca3af" }}>
                    {new Date(n.createdAt).toLocaleString(dateLocale)}
                  </p>

                  {/* Action button — customer confirms return */}
                  {n.type === "return_confirm" && n.bookingId && (
                    returned.has(n.bookingId.toString()) ? (
                      <span className="inline-block mt-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {t.confirmReturnDone}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConfirmReturn(n._id, n.bookingId)}
                        disabled={acting === n._id}
                        style={{
                          marginTop: 10, padding: "8px 18px", borderRadius: 9, border: "none",
                          background: "#f59e0b", color: "#fff",
                          fontSize: 13, fontWeight: 700, cursor: acting === n._id ? "not-allowed" : "pointer",
                          opacity: acting === n._id ? 0.6 : 1,
                        }}
                      >
                        {acting === n._id ? t.confirming : t.confirmReturnBtn}
                      </button>
                    )
                  )}

                  {/* Action button — owner goes to give feedback */}
                  {n.type === "feedback_request" && (
                    <button
                      type="button"
                      onClick={() => navigate("/owner/bookings-list")}
                      className="mt-2.5 py-[7px] px-4 rounded-[9px] border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 text-violet-900 dark:text-violet-300 text-xs font-bold cursor-pointer"
                    >
                      {t.rateCustomer}
                    </button>
                  )}
                </div>

                {!n.read && n.type !== "return_confirm" && n.type !== "feedback_request" && (
                  <button
                    type="button"
                    onClick={() => handleRead(n._id)}
                    style={{
                      flexShrink: 0, padding: "5px 12px", fontSize: 11, fontWeight: 600,
                      background: "none", border: `1px solid ${colors.border}`,
                      color: colors.text, borderRadius: 8, cursor: "pointer",
                    }}
                  >
                    {t.markRead}
                  </button>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </SellerLayout>
  );
}
