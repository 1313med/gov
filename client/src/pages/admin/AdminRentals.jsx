import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { getAdminRentals, updateRentalStatus } from "../../api/rental";

function formatMoney(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return `${Number(n).toLocaleString()} MAD`;
}

function statusBadge(status) {
  const map = {
    approved: "adm-badge-approved",
    rejected: "adm-badge-rejected",
    pending: "adm-badge-pending",
    unavailable: "adm-badge-unavailable",
  };
  const cls = map[status] || "adm-badge-neutral";
  const label = status ? String(status).replace(/^\w/, (c) => c.toUpperCase()) : "—";
  return <span className={`adm-badge ${cls}`}>{label}</span>;
}

export default function AdminRentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const res = await getAdminRentals();
      setRentals(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const updateStatus = async (id, status) => {
    const confirmMsg =
      status === "approved"
        ? "Approve this rental listing?"
        : "Reject this rental listing?";

    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoading(id);
      await updateRentalStatus(id, status);
      fetchRentals();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout>
      <div className="adm-page">
        <header className="adm-header">
          <div>
            <p className="adm-label">Moderation</p>
            <h1 className="adm-title">Rental listings</h1>
            <p className="adm-sub">
              Review cars offered for rent. Only approved listings appear on the public rentals page.
            </p>
          </div>
          <span className="adm-meta">{rentals.length} total</span>
        </header>

        {loading ? (
          <div className="adm-card adm-card-pad">
            <div className="adm-loading">
              <div className="adm-spin" aria-hidden />
              Loading rentals…
            </div>
          </div>
        ) : (
          <div className="adm-card adm-card-pad">
            <div className="adm-sh" style={{ position: "relative", zIndex: 1 }}>
              <p className="adm-label">Queue</p>
              <h2 className="adm-sh-title">All rental cars</h2>
            </div>
            <div className="adm-table-wrap">
              <table className="adm-table" style={{ minWidth: 720 }}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Owner</th>
                    <th>City</th>
                    <th>Price / day</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rentals.map((r) => (
                    <tr key={r._id}>
                      <td style={{ fontWeight: 600 }}>{r.title}</td>
                      <td style={{ color: "#9a9ab0" }}>
                        {r.rentalOwnerId?.name || "—"}
                      </td>
                      <td style={{ color: "#9a9ab0" }}>{r.city || "—"}</td>
                      <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
                        {formatMoney(r.pricePerDay)}
                      </td>
                      <td>{statusBadge(r.status)}</td>
                      <td>
                        <div className="adm-action-btns">
                          {r.status === "pending" && (
                            <>
                              <button
                                type="button"
                                disabled={actionLoading === r._id}
                                onClick={() => updateStatus(r._id, "approved")}
                                className="adm-btn-sm adm-btn-ok"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={actionLoading === r._id}
                                onClick={() => updateStatus(r._id, "rejected")}
                                className="adm-btn-sm adm-btn-danger"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rentals.length === 0 && (
                    <tr>
                      <td colSpan={6} className="adm-empty">
                        No rental listings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
