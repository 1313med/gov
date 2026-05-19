import { useEffect, useState, useCallback } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import ListingModerationReview from "../../components/admin/ListingModerationReview";
import { api } from "../../api/axios";

function formatMoney(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return `${Number(n).toLocaleString()} MAD`;
}

function statusBadge(status) {
  const map = {
    approved: "adm-badge-approved",
    rejected: "adm-badge-rejected",
    pending: "adm-badge-pending",
    sold: "adm-badge-sold",
  };
  const cls = map[status] || "adm-badge-neutral";
  const label = status ? String(status).replace(/^\w/, (c) => c.toUpperCase()) : "—";
  return <span className={`adm-badge ${cls}`}>{label}</span>;
}

export default function AdminSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await api.get("/sale/admin");
      setSales(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const patchSellerCinVerified = useCallback((sellerId) => {
    setSales((prev) =>
      prev.map((s) => {
        const sid = s.sellerId?._id || s.sellerId;
        if (String(sid) !== String(sellerId)) return s;
        return {
          ...s,
          sellerId: {
            ...s.sellerId,
            nationalId: { ...s.sellerId?.nationalId, verified: true },
          },
        };
      })
    );
  }, []);

  const updateStatus = async (id, status) => {
    const confirmMsg =
      status === "approved"
        ? "Approve this listing?"
        : "Reject this listing?";

    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoading(id);
      await api.put(`/sale/admin/${id}/status`, { status });
      fetchSales();
    } catch (err) {
      window.alert(err?.response?.data?.message || "Could not update status");
    } finally {
      setActionLoading(null);
    }
  };

  const pending = sales.filter((s) => s.status === "pending");

  return (
    <AdminLayout>
      <div className="adm-page">
        <header className="adm-header">
          <div>
            <p className="adm-label">Moderation</p>
            <h1 className="adm-title">Sale listings</h1>
            <p className="adm-sub">
              Review each car and the seller's CIN before approving. Verify the CIN document first, then approve the listing.
            </p>
          </div>
          <span className="adm-meta">{pending.length} pending · {sales.length} total</span>
        </header>

        {loading ? (
          <div className="adm-card adm-card-pad">
            <div className="adm-loading">
              <div className="adm-spin" aria-hidden />
              Loading listings…
            </div>
          </div>
        ) : sales.length === 0 ? (
          <div className="adm-card adm-card-pad">
            <p className="adm-empty">No listings found</p>
          </div>
        ) : (
          <div>
            {sales.map((s) => (
              <ListingModerationReview
                key={s._id}
                listing={s}
                ownerField="sellerId"
                priceLabel={formatMoney(s.price)}
                statusBadge={statusBadge}
                onStatusChange={updateStatus}
                actionLoading={actionLoading}
                onOwnerVerified={patchSellerCinVerified}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
