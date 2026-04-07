import { useEffect, useState } from "react";
import { getNotifications, markAsRead } from "../api/notification";
import { api } from "../api/axios";
import { useSocket } from "../context/SocketContext";
import SellerLayout from "../components/seller/SellerLayout";

const TYPE_COLORS = {
  approved: { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", dot: "#22c55e" },
  rejected: { bg: "#fef2f2", border: "#fecaca", text: "#dc2626", dot: "#ef4444" },
  pending:  { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", dot: "#3b82f6" },
  sold:     { bg: "#faf5ff", border: "#e9d5ff", text: "#7c3aed", dot: "#a855f7" },
};

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { clearNotificationBadge } = useSocket();

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

  const handleMarkAll = async () => {
    const unread = items.filter((n) => !n.read);
    await Promise.all(unread.map((n) => markAsRead(n._id)));
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filtered = filter === "all" ? items : filter === "unread" ? items.filter((n) => !n.read) : items.filter((n) => n.type === filter);
  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <SellerLayout>
      <div style={{ maxWidth: 680 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Notifications</h1>
            {unreadCount > 0 && (
              <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>
                {unreadCount} unread
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              style={{
                padding: "8px 16px", background: "none", border: "1px solid #e5e7eb",
                borderRadius: 10, fontSize: 13, color: "#374151", cursor: "pointer", fontWeight: 500,
              }}
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { key: "all", label: "All" },
            { key: "unread", label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
            { key: "approved", label: "Approved" },
            { key: "rejected", label: "Rejected" },
            { key: "pending", label: "Pending" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: "7px 14px", borderRadius: 999, border: "1px solid",
                borderColor: filter === key ? "#3d3af5" : "#e5e7eb",
                background: filter === key ? "#eef2ff" : "#fff",
                color: filter === key ? "#3d3af5" : "#6b7280",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ background: "#fff", padding: 24, borderRadius: 14, border: "1px solid #e5e7eb", color: "#9ca3af", fontSize: 13 }}>
            Loading notifications…
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ background: "#fff", padding: 32, borderRadius: 14, border: "1px solid #e5e7eb", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
            {filter === "unread" ? "All caught up! No unread notifications." : "No notifications yet."}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((n) => {
            const colors = TYPE_COLORS[n.type] || TYPE_COLORS.pending;
            return (
              <div
                key={n._id}
                style={{
                  background: n.read ? "#fff" : colors.bg,
                  border: `1px solid ${n.read ? "#e5e7eb" : colors.border}`,
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
                  <p style={{ margin: 0, fontSize: 14, color: "#111827", fontWeight: n.read ? 400 : 600, lineHeight: 1.5 }}>
                    {n.message}
                  </p>
                  <p style={{ margin: "5px 0 0", fontSize: 12, color: "#9ca3af" }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>

                {!n.read && (
                  <button
                    onClick={() => handleRead(n._id)}
                    style={{
                      flexShrink: 0, padding: "5px 12px", fontSize: 11, fontWeight: 600,
                      background: "none", border: `1px solid ${colors.border}`,
                      color: colors.text, borderRadius: 8, cursor: "pointer",
                    }}
                  >
                    Mark read
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
