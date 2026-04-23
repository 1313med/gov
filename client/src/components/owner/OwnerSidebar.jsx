import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Car, PlusCircle, Calendar, Layers, ClipboardList, Wrench } from "lucide-react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');

  .osb {
    width: 240px;
    min-width: 240px;
    background: #09090f;
    border-right: 1px solid rgba(255,255,255,.06);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 32px 16px 32px;
    box-sizing: border-box;
    position: relative;
  }

  /* Subtle top glow */
  .osb::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(124,108,252,.4), transparent);
  }

  /* Brand */
  .osb-brand {
    padding: 0 12px;
    margin-bottom: 36px;
  }
  .osb-brand-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: .15em;
    text-transform: uppercase;
    color: #3a3a52;
    margin-bottom: 4px;
  }
  .osb-brand-title {
    font-family: 'Syne', sans-serif;
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -.03em;
    color: #e8e8f0;
    margin: 0;
    line-height: 1;
  }

  /* Divider */
  .osb-divider {
    height: 1px;
    background: rgba(255,255,255,.05);
    margin: 0 12px 20px;
  }

  /* Nav label */
  .osb-nav-label {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: #3a3a52;
    padding: 0 14px;
    margin-bottom: 8px;
  }

  /* Nav item */
  .osb-item {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 10px 14px;
    border-radius: 10px;
    text-decoration: none;
    color: #5a5a72;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    font-weight: 400;
    transition: color .2s, background .2s;
    position: relative;
    margin-bottom: 2px;
    border: 1px solid transparent;
  }

  .osb-item:hover {
    color: #c8c8d8;
    background: rgba(255,255,255,.04);
    border-color: rgba(255,255,255,.06);
  }

  .osb-item.active {
    color: #e8e8f0;
    background: rgba(124,108,252,.14);
    border-color: rgba(124,108,252,.28);
  }

  /* Active left bar */
  .osb-item.active::before {
    content: '';
    position: absolute;
    left: 0; top: 20%; bottom: 20%;
    width: 2px;
    background: #7c6cfc;
    border-radius: 99px;
    box-shadow: 0 0 8px #7c6cfc;
  }

  /* Icon wrapper */
  .osb-icon {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background .2s;
  }

  .osb-item.active .osb-icon {
    background: rgba(124,108,252,.2);
    color: #7c6cfc;
  }

  .osb-item:not(.active) .osb-icon {
    background: rgba(255,255,255,.04);
    color: #5a5a72;
  }

  .osb-item:hover:not(.active) .osb-icon {
    background: rgba(255,255,255,.07);
    color: #a0a0b8;
  }

  /* Bottom user area */
  .osb-footer {
    margin-top: auto;
    padding: 14px;
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 12px;
    background: rgba(255,255,255,.02);
  }
  .osb-footer-role {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: #3a3a52;
    margin-bottom: 3px;
  }
  .osb-footer-name {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: #6b6b82;
    letter-spacing: -.01em;
  }

  /* Glow pulse on active icon */
  @keyframes osb-glow {
    0%, 100% { box-shadow: 0 0 6px rgba(124,108,252,.4); }
    50%       { box-shadow: 0 0 14px rgba(124,108,252,.7); }
  }
  .osb-item.active .osb-icon {
    animation: osb-glow 3s ease-in-out infinite;
  }

  .osb-item-label {
    flex: 1;
    min-width: 0;
  }

  @media (max-width: 767px) {
    .osb {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      top: auto;
      width: 100%;
      min-width: 100%;
      min-height: unset;
      height: auto;
      flex-direction: row;
      flex-wrap: nowrap;
      padding: 10px 6px calc(10px + env(safe-area-inset-bottom, 0px));
      border-right: none;
      border-top: 1px solid rgba(255,255,255,.1);
      z-index: 50;
      box-shadow: 0 -8px 32px rgba(0,0,0,.35);
    }
    .osb-brand,
    .osb-divider,
    .osb-nav-label,
    .osb-footer {
      display: none;
    }
    .osb nav {
      display: flex;
      flex-direction: row;
      width: 100%;
      justify-content: space-around;
      align-items: center;
      gap: 2px;
    }
    .osb-item {
      flex: 1;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 8px 4px;
      margin: 0;
      font-size: 10px;
      text-align: center;
      gap: 6px;
      max-width: 88px;
    }
    .osb-item.active::before {
      display: none;
    }
    .osb-item-label {
      font-size: 9px;
      line-height: 1.15;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .osb-icon {
      width: 28px;
      height: 28px;
    }
  }
`;

const MENU = [
  { name: "Dashboard",    path: "/owner/analytics",      icon: LayoutDashboard },
  { name: "My Fleet",     path: "/my-fleet",              icon: Layers          },
  { name: "My Rentals",   path: "/my-rentals",            icon: Car             },
  { name: "Add Rental",   path: "/add-rental",            icon: PlusCircle      },
  { name: "Bookings",     path: "/owner/bookings-list",   icon: ClipboardList   },
  { name: "Calendar",     path: "/owner/bookings",        icon: Calendar        },
  { name: "Maintenance",  path: "/owner/maintenance",     icon: Wrench          },
];

export default function OwnerSidebar() {
  const location = useLocation();

  return (
    <>
      <style>{STYLES}</style>

      <div className="osb">

        {/* ── Brand ── */}
        <div className="osb-brand">
          <p className="osb-brand-eyebrow">Panel</p>
          <h2 className="osb-brand-title">Owner</h2>
        </div>

        <div className="osb-divider"/>

        {/* ── Nav ── */}
        <p className="osb-nav-label">Navigation</p>

        <nav>
          {MENU.map((item) => {
            const Icon    = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`osb-item${isActive ? " active" : ""}`}
              >
                <span className="osb-icon">
                  <Icon size={15}/>
                </span>
                <span className="osb-item-label">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── Footer ── */}
        <div className="osb-footer">
          <p className="osb-footer-role">Logged in as</p>
          <p className="osb-footer-name">Owner</p>
        </div>

      </div>
    </>
  );
}
