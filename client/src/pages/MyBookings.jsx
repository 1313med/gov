import { useEffect, useState } from "react";
import { getMyBookings } from "../api/booking";
import { api } from "../api/axios";
import { Link } from "react-router-dom";

const STATUS_STYLES = {
  pending:   { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  confirmed: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  rejected:  { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  cancelled: { bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb" },
  completed: { bg: "#faf5ff", color: "#7c3aed", border: "#e9d5ff" },
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const load = () =>
    getMyBookings()
      .then((res) => setBookings(res.data))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(id);
    try {
      await api.put(`/bookings/${id}/cancel`);
      load();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to cancel");
    } finally { setCancelling(null); }
  };

  if (loading) return <div style={{ padding: 40, color: "#9ca3af", fontFamily: "sans-serif" }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 760, margin: "40px auto", padding: "0 20px 60px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>My Bookings</h1>
      <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 28 }}>{bookings.length} booking{bookings.length !== 1 ? "s" : ""}</p>

      {bookings.length === 0 && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 40, textAlign: "center", color: "#9ca3af" }}>
          <p style={{ fontSize: 16, marginBottom: 12 }}>No bookings yet</p>
          <Link to="/rentals" style={{ color: "#3d3af5", fontWeight: 600, fontSize: 14 }}>Browse rental cars →</Link>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {bookings.map((b) => {
          const s = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
          const canCancel = ["pending", "confirmed"].includes(b.status);
          const days = b.startDate && b.endDate
            ? Math.ceil((new Date(b.endDate) - new Date(b.startDate)) / 86400000)
            : null;

          return (
            <div key={b._id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 18, padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>{b.rentalId?.title || "Rental"}</h2>
                  <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
                    {new Date(b.startDate).toDateString()} → {new Date(b.endDate).toDateString()}
                    {days ? <span style={{ marginLeft: 8, fontWeight: 600, color: "#374151" }}>({days} day{days !== 1 ? "s" : ""})</span> : null}
                  </p>
                  {b.totalAmount && (
                    <p style={{ margin: "6px 0 0", fontSize: 13, color: "#374151", fontWeight: 600 }}>
                      Total: {Number(b.totalAmount).toLocaleString()} MAD
                    </p>
                  )}
                </div>

                <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 600, textTransform: "capitalize", whiteSpace: "nowrap" }}>
                  {b.status}
                </span>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                <Link
                  to={`/rentals/${b.rentalId?._id}`}
                  style={{ fontSize: 12, color: "#3d3af5", fontWeight: 600, textDecoration: "none" }}
                >
                  View rental →
                </Link>

                {canCancel && (
                  <button
                    onClick={() => handleCancel(b._id)}
                    disabled={cancelling === b._id}
                    style={{
                      fontSize: 12, color: "#dc2626", fontWeight: 600,
                      background: "none", border: "1px solid #fecaca",
                      borderRadius: 8, padding: "4px 12px", cursor: "pointer",
                      opacity: cancelling === b._id ? 0.5 : 1,
                    }}
                  >
                    {cancelling === b._id ? "Cancelling…" : "Cancel booking"}
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
