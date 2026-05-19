import { useEffect, useState, useCallback } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import ListingModerationReview from "../../components/admin/ListingModerationReview";
import { getAdminRentals, updateRentalStatus } from "../../api/rental";

function formatMoney(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return `${Number(n).toLocaleString()} MAD/day`;
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

  const patchOwnerCinVerified = useCallback((ownerId) => {
    setRentals((prev) =>
      prev.map((r) => {
        const oid = r.rentalOwnerId?._id || r.rentalOwnerId;
        if (String(oid) !== String(ownerId)) return r;
        return {
          ...r,
          rentalOwnerId: {
            ...r.rentalOwnerId,
            nationalId: { ...r.rentalOwnerId?.nationalId, verified: true },
          },
        };
      })
    );
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
    } catch (err) {
      window.alert(err?.response?.data?.message || "Could not update status");
    } finally {
      setActionLoading(null);
    }
  };

  const pending = rentals.filter((r) => r.status === "pending");

  return (
    <AdminLayout>
      <div className="adm-page">
        <header className="adm-header">
          <div>
            <p className="adm-label">Moderation</p>
            <h1 className="adm-title">Rental listings</h1>
            <p className="adm-sub">
              Review each car and the owner's CIN before approving. Verify the CIN document first, then approve the listing.
            </p>
          </div>
          <span className="adm-meta">{pending.length} pending · {rentals.length} total</span>
        </header>

        {loading ? (
          <div className="adm-card adm-card-pad">
            <div className="adm-loading">
              <div className="adm-spin" aria-hidden />
              Loading rentals…
            </div>
          </div>
        ) : rentals.length === 0 ? (
          <div className="adm-card adm-card-pad">
            <p className="adm-empty">No rental listings found</p>
          </div>
        ) : (
          <div>
            {rentals.map((r) => (
              <ListingModerationReview
                key={r._id}
                listing={r}
                ownerField="rentalOwnerId"
                priceLabel={formatMoney(r.pricePerDay)}
                statusBadge={statusBadge}
                onStatusChange={updateStatus}
                actionLoading={actionLoading}
                onOwnerVerified={patchOwnerCinVerified}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
