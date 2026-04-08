import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ClipboardList, CarFront, Users } from "lucide-react";

const ADM_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&display=swap');

  .adm-shell {
    display: flex;
    min-height: 100vh;
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
    background: #09090f;
    color: #e8e8f0;
    font-family: 'Syne', sans-serif;
  }

  .adm-side {
    width: 240px;
    min-width: 240px;
    background: #0a0a12;
    border-right: 1px solid rgba(255,255,255,.07);
    padding: 28px 16px 28px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  .adm-side::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(124,108,252,.45), transparent);
  }

  .adm-brand-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: #3a3a52;
    margin-bottom: 4px;
    padding: 0 12px;
  }
  .adm-brand-title {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -.03em;
    margin: 0 0 28px;
    padding: 0 12px;
    line-height: 1;
  }

  .adm-nav-label {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: #3a3a52;
    padding: 0 14px;
    margin-bottom: 8px;
  }

  .adm-nav-item {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 10px 14px;
    border-radius: 10px;
    text-decoration: none;
    color: #5a5a72;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    transition: color .2s, background .2s, border-color .2s;
    margin-bottom: 2px;
    border: 1px solid transparent;
  }
  .adm-nav-item:hover {
    color: #c8c8d8;
    background: rgba(255,255,255,.04);
    border-color: rgba(255,255,255,.06);
  }
  .adm-nav-item.active {
    color: #e8e8f0;
    background: rgba(124,108,252,.14);
    border-color: rgba(124,108,252,.28);
  }

  .adm-nav-ico {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .adm-nav-item:not(.active) .adm-nav-ico {
    background: rgba(255,255,255,.04);
    color: #5a5a72;
  }
  .adm-nav-item.active .adm-nav-ico {
    background: rgba(124,108,252,.2);
    color: #7c6cfc;
  }

  .adm-main {
    flex: 1;
    min-width: 0;
    overflow-x: hidden;
    box-sizing: border-box;
  }

  /* ── Shared page UI (dashboard + sales) ── */
  .adm-page {
    padding: clamp(16px, 4vw, 40px) clamp(14px, 3.5vw, 44px) clamp(36px, 5vw, 56px);
    max-width: 1400px;
  }

  .adm-header {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: clamp(22px, 4vw, 32px);
  }
  @media (min-width: 640px) {
    .adm-header {
      flex-direction: row;
      align-items: flex-end;
      justify-content: space-between;
      gap: 16px;
    }
  }

  .adm-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: #5a5a72;
  }
  .adm-title {
    font-size: clamp(26px, 6vw, 36px);
    font-weight: 800;
    letter-spacing: -.04em;
    line-height: 1.05;
    margin: 6px 0 0;
  }
  .adm-sub {
    font-size: 14px;
    color: #6b6b82;
    line-height: 1.5;
    margin: 8px 0 0;
    max-width: 520px;
  }

  .adm-card {
    background: #111118;
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 18px;
    position: relative;
    overflow: hidden;
    transition: border-color .25s, box-shadow .25s;
  }
  .adm-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(124,108,252,.06) 0%, transparent 55%);
    pointer-events: none;
  }
  .adm-card:hover {
    border-color: rgba(255,255,255,.13);
    box-shadow: 0 0 40px rgba(124,108,252,.08);
  }

  .adm-card-pad { padding: clamp(18px, 4vw, 28px); }

  .adm-kpi-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }
  @media (min-width: 520px) {
    .adm-kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
  }
  @media (min-width: 1100px) {
    .adm-kpi-grid { grid-template-columns: repeat(4, 1fr); }
  }

  .adm-kpi {
    padding: clamp(18px, 3vw, 24px) clamp(16px, 3vw, 22px);
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }
  .adm-kpi-bar {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    border-radius: 2px 2px 0 0;
    z-index: 1;
  }
  .adm-kpi-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }
  .adm-kpi-ico {
    width: 40px;
    height: 40px;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .adm-kpi-lbl {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: #5a5a72;
  }
  .adm-kpi-val {
    font-family: 'DM Mono', monospace;
    font-size: clamp(26px, 6vw, 34px);
    font-weight: 500;
    letter-spacing: -.02em;
    line-height: 1;
  }

  .adm-sh { margin-bottom: 16px; }
  .adm-sh-title {
    font-size: clamp(15px, 3vw, 17px);
    font-weight: 700;
    letter-spacing: -.02em;
    margin: 6px 0 0;
  }

  .adm-actions-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    position: relative;
    z-index: 1;
  }
  .adm-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: 12px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .08em;
    text-transform: uppercase;
    text-decoration: none;
    border: 1px solid transparent;
    cursor: pointer;
    transition: transform .15s, box-shadow .2s, background .2s, border-color .2s;
  }
  .adm-btn:active { transform: scale(0.98); }
  .adm-btn-pri {
    background: #7c6cfc;
    border-color: rgba(124,108,252,.5);
    color: #fff;
    box-shadow: 0 4px 20px rgba(124,108,252,.25);
  }
  .adm-btn-pri:hover {
    box-shadow: 0 8px 28px rgba(124,108,252,.35);
  }
  .adm-btn-ghost {
    background: rgba(255,255,255,.04);
    border-color: rgba(255,255,255,.1);
    color: #8a8a9e;
  }
  .adm-btn-ghost:hover {
    border-color: rgba(124,108,252,.3);
    color: #c8c8d8;
  }

  .adm-table-wrap {
    position: relative;
    z-index: 1;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin: 0 -4px;
    padding: 0 4px;
  }
  .adm-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 640px;
    font-size: 13px;
  }
  .adm-table thead th {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: #5a5a72;
    text-align: left;
    padding: 12px 14px 14px 0;
    border-bottom: 1px solid rgba(255,255,255,.08);
  }
  .adm-table thead th:last-child { text-align: right; padding-right: 0; }
  .adm-table tbody td {
    padding: 14px 14px 14px 0;
    border-bottom: 1px solid rgba(255,255,255,.06);
    vertical-align: middle;
  }
  .adm-table tbody td:last-child { text-align: right; padding-right: 0; }
  .adm-table tbody tr {
    transition: background .15s;
  }
  .adm-table tbody tr:hover td {
    background: rgba(124,108,252,.04);
  }
  .adm-table tbody tr:last-child td { border-bottom: none; }

  .adm-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 999px;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .06em;
    text-transform: uppercase;
    border: 1px solid transparent;
  }
  .adm-badge-pending {
    background: rgba(245,166,35,.12);
    color: #f5a623;
    border-color: rgba(245,166,35,.25);
  }
  .adm-badge-approved {
    background: rgba(42,245,192,.12);
    color: #2af5c0;
    border-color: rgba(42,245,192,.25);
  }
  .adm-badge-rejected {
    background: rgba(252,108,108,.12);
    color: #fc6c6c;
    border-color: rgba(252,108,108,.25);
  }
  .adm-badge-sold {
    background: rgba(96,165,250,.12);
    color: #60a5fa;
    border-color: rgba(96,165,250,.25);
  }
  .adm-badge-neutral {
    background: rgba(255,255,255,.06);
    color: #8a8a9e;
    border-color: rgba(255,255,255,.1);
  }
  .adm-badge-unavailable {
    background: rgba(139,92,246,.12);
    color: #a78bfa;
    border-color: rgba(167,139,250,.28);
  }

  .adm-action-btns {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
  }
  .adm-btn-sm {
    padding: 8px 14px;
    border-radius: 10px;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .06em;
    text-transform: uppercase;
    border: 1px solid transparent;
    cursor: pointer;
    transition: opacity .2s, box-shadow .2s, transform .1s;
  }
  .adm-btn-sm:disabled { opacity: .45; cursor: not-allowed; }
  .adm-btn-sm:active:not(:disabled) { transform: scale(0.98); }
  .adm-btn-ok {
    background: rgba(42,245,192,.14);
    border-color: rgba(42,245,192,.35);
    color: #2af5c0;
  }
  .adm-btn-ok:hover:not(:disabled) {
    box-shadow: 0 0 16px rgba(42,245,192,.15);
  }
  .adm-btn-danger {
    background: rgba(252,108,108,.12);
    border-color: rgba(252,108,108,.35);
    color: #fc6c6c;
  }
  .adm-btn-danger:hover:not(:disabled) {
    box-shadow: 0 0 16px rgba(252,108,108,.12);
  }

  .adm-empty {
    text-align: center;
    padding: 48px 20px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #5a5a72;
  }

  .adm-loading {
    padding: 28px;
    text-align: center;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #5a5a72;
    position: relative;
    z-index: 1;
  }
  .adm-spin {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    margin: 0 auto 12px;
    border: 2px solid rgba(124,108,252,.2);
    border-top-color: #7c6cfc;
    animation: adm-spin .85s linear infinite;
  }
  @keyframes adm-spin { to { transform: rotate(360deg); } }

  .adm-meta {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #5a5a72;
    padding: 6px 12px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 999px;
    align-self: flex-start;
  }
  @media (min-width: 640px) {
    .adm-meta { align-self: auto; }
  }

  /* Mobile bottom nav */
  @media (max-width: 767px) {
    .adm-shell { flex-direction: column; }
    .adm-side {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      top: auto;
      width: 100%;
      min-width: 100%;
      flex-direction: row;
      padding: 10px 8px calc(10px + env(safe-area-inset-bottom, 0px));
      border-right: none;
      border-top: 1px solid rgba(255,255,255,.1);
      z-index: 50;
      box-shadow: 0 -8px 32px rgba(0,0,0,.4);
    }
    .adm-side::before { display: none; }
    .adm-brand-eyebrow,
    .adm-brand-title,
    .adm-nav-label { display: none; }
    .adm-side nav {
      display: flex;
      width: 100%;
      justify-content: space-around;
      gap: 4px;
    }
    .adm-nav-item {
      flex: 1;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 8px 4px;
      font-size: 9px;
      text-align: center;
      gap: 6px;
      max-width: 120px;
    }
    .adm-nav-ico { width: 28px; height: 28px; }
    .adm-main {
      padding-bottom: calc(76px + env(safe-area-inset-bottom, 0px));
    }
  }
`;

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/sales", label: "Sales", icon: ClipboardList },
  { to: "/admin/rentals", label: "Rentals", icon: CarFront },
  { to: "/admin/users", label: "Users", icon: Users },
];

export default function AdminLayout({ children }) {
  const { pathname } = useLocation();

  return (
    <>
      <style>{ADM_STYLES}</style>
      <div className="adm-shell">
        <aside className="adm-side">
          <p className="adm-brand-eyebrow">Control</p>
          <h1 className="adm-brand-title">Admin</h1>
          <p className="adm-nav-label">Navigation</p>
          <nav>
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = pathname === to || (to !== "/admin" && pathname.startsWith(to));
              return (
                <Link key={to} to={to} className={`adm-nav-item${active ? " active" : ""}`}>
                  <span className="adm-nav-ico">
                    <Icon size={15} strokeWidth={2.2} />
                  </span>
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="adm-main">{children}</main>
      </div>
    </>
  );
}
