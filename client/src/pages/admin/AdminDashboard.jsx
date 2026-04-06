import AdminLayout from "../../components/admin/AdminLayout";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../api/axios";
import { getAdminRentals } from "../../api/rental";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  CarFront,
} from "lucide-react";

function KpiCard({ barColor, iconBg, iconColor, Icon, label, value }) {
  return (
    <div className="adm-card adm-kpi">
      <div className="adm-kpi-bar" style={{ background: barColor }} />
      <div className="adm-kpi-top">
        <div>
          <p className="adm-kpi-lbl">{label}</p>
          <p className="adm-kpi-val">{value}</p>
        </div>
        <div className="adm-kpi-ico" style={{ background: iconBg, color: iconColor }}>
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}

function countByStatus(listings, status) {
  return listings.filter((l) => l.status === status).length;
}

export default function AdminDashboard() {
  const [saleStats, setSaleStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [rentalStats, setRentalStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [saleRes, rentalRes] = await Promise.all([
          api.get("/sale/admin"),
          getAdminRentals(),
        ]);
        const sales = saleRes.data || [];
        const rentals = rentalRes.data || [];

        setSaleStats({
          total: sales.length,
          pending: countByStatus(sales, "pending"),
          approved: countByStatus(sales, "approved"),
          rejected: countByStatus(sales, "rejected"),
        });
        setRentalStats({
          total: rentals.length,
          pending: countByStatus(rentals, "pending"),
          approved: countByStatus(rentals, "approved"),
          rejected: countByStatus(rentals, "rejected"),
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <AdminLayout>
      <div className="adm-page">
        <header className="adm-header">
          <div>
            <p className="adm-label">Overview</p>
            <h1 className="adm-title">Dashboard</h1>
            <p className="adm-sub">
              Moderate cars for sale and cars for rent before they appear to customers.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="adm-card adm-card-pad">
            <div className="adm-loading">
              <div className="adm-spin" aria-hidden />
              Loading statistics…
            </div>
          </div>
        ) : (
          <>
            <div className="adm-sh" style={{ marginBottom: 14 }}>
              <p className="adm-label">For sale</p>
              <h2 className="adm-sh-title">Car sales</h2>
            </div>
            <div className="adm-kpi-grid" style={{ marginBottom: 28 }}>
              <KpiCard
                barColor="#7c6cfc"
                iconBg="rgba(124,108,252,.2)"
                iconColor="#7c6cfc"
                Icon={ClipboardList}
                label="Total listings"
                value={saleStats.total}
              />
              <KpiCard
                barColor="#f5a623"
                iconBg="rgba(245,166,35,.15)"
                iconColor="#f5a623"
                Icon={Clock}
                label="Pending approval"
                value={saleStats.pending}
              />
              <KpiCard
                barColor="#2af5c0"
                iconBg="rgba(42,245,192,.14)"
                iconColor="#2af5c0"
                Icon={CheckCircle2}
                label="Approved"
                value={saleStats.approved}
              />
              <KpiCard
                barColor="#fc6c6c"
                iconBg="rgba(252,108,108,.14)"
                iconColor="#fc6c6c"
                Icon={XCircle}
                label="Rejected"
                value={saleStats.rejected}
              />
            </div>

            <div className="adm-sh" style={{ marginBottom: 14 }}>
              <p className="adm-label">For rent</p>
              <h2 className="adm-sh-title">Rental cars</h2>
            </div>
            <div className="adm-kpi-grid" style={{ marginBottom: 20 }}>
              <KpiCard
                barColor="#7c6cfc"
                iconBg="rgba(124,108,252,.2)"
                iconColor="#7c6cfc"
                Icon={CarFront}
                label="Total listings"
                value={rentalStats.total}
              />
              <KpiCard
                barColor="#f5a623"
                iconBg="rgba(245,166,35,.15)"
                iconColor="#f5a623"
                Icon={Clock}
                label="Pending approval"
                value={rentalStats.pending}
              />
              <KpiCard
                barColor="#2af5c0"
                iconBg="rgba(42,245,192,.14)"
                iconColor="#2af5c0"
                Icon={CheckCircle2}
                label="Approved"
                value={rentalStats.approved}
              />
              <KpiCard
                barColor="#fc6c6c"
                iconBg="rgba(252,108,108,.14)"
                iconColor="#fc6c6c"
                Icon={XCircle}
                label="Rejected"
                value={rentalStats.rejected}
              />
            </div>
          </>
        )}

        <div className="adm-card adm-card-pad">
          <div className="adm-sh">
            <p className="adm-label">Workflow</p>
            <h2 className="adm-sh-title">Quick actions</h2>
          </div>
          <div className="adm-actions-row">
            <Link to="/admin/sales" className="adm-btn adm-btn-pri">
              Review car sales
              <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
            <Link to="/admin/rentals" className="adm-btn adm-btn-pri">
              Review rentals
              <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
