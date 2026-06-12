import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Car, PlusCircle, Calendar, Layers, ClipboardList, Wrench, Eye, Users } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAppLang } from "../../context/AppLangContext";

const STYLES = `

  .osb {
    /* LIGHT defaults */
    --osb-bg:        #ffffff;
    --osb-border:    rgba(15, 23, 42, 0.10);
    --osb-eyebrow:   #94a3b8;
    --osb-title:     #0f172a;
    --osb-divider:   rgba(15, 23, 42, 0.08);
    --osb-item-fg:   #64748b;
    --osb-item-hover-fg: #0f172a;
    --osb-item-hover-bg: rgba(15,23,42,0.04);
    --osb-item-hover-bd: rgba(15,23,42,0.08);
    --osb-item-active-fg: #0f172a;
    --osb-item-active-bg: rgba(124,108,252,0.10);
    --osb-item-active-bd: rgba(124,108,252,0.30);
    --osb-icon-bg:   rgba(15,23,42,0.04);
    --osb-icon-fg:   #64748b;
    --osb-icon-hover-bg: rgba(15,23,42,0.07);
    --osb-icon-hover-fg: #334155;
    --osb-footer-bg: rgba(15,23,42,0.02);
    --osb-footer-bd: rgba(15,23,42,0.08);
    --osb-footer-role: #94a3b8;
    --osb-footer-name: #475569;
    --osb-mob-shadow: 0 -8px 32px rgba(15,23,42,.10);

    width: 240px;
    min-width: 240px;
    background: var(--osb-bg);
    border-right: 1px solid var(--osb-border);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 32px 16px 32px;
    box-sizing: border-box;
    position: relative;
    transition: background-color .3s ease, border-color .3s ease;
  }

  .osb.dark, html.dark .osb {
    --osb-bg:        #09090f;
    --osb-border:    rgba(255,255,255,.06);
    --osb-eyebrow:   #3a3a52;
    --osb-title:     #e8e8f0;
    --osb-divider:   rgba(255,255,255,.05);
    --osb-item-fg:   #5a5a72;
    --osb-item-hover-fg: #c8c8d8;
    --osb-item-hover-bg: rgba(255,255,255,.04);
    --osb-item-hover-bd: rgba(255,255,255,.06);
    --osb-item-active-fg: #e8e8f0;
    --osb-item-active-bg: rgba(124,108,252,.14);
    --osb-item-active-bd: rgba(124,108,252,.28);
    --osb-icon-bg:   rgba(255,255,255,.04);
    --osb-icon-fg:   #5a5a72;
    --osb-icon-hover-bg: rgba(255,255,255,.07);
    --osb-icon-hover-fg: #a0a0b8;
    --osb-footer-bg: rgba(255,255,255,.02);
    --osb-footer-bd: rgba(255,255,255,.06);
    --osb-footer-role: #3a3a52;
    --osb-footer-name: #6b6b82;
    --osb-mob-shadow: 0 -8px 32px rgba(0,0,0,.35);
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
    color: var(--osb-eyebrow);
    margin-bottom: 4px;
  }
  .osb-brand-title {
    font-family: 'Poppins', sans-serif;
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -.03em;
    color: var(--osb-title);
    margin: 0;
    line-height: 1;
  }

  /* Divider */
  .osb-divider {
    height: 1px;
    background: var(--osb-divider);
    margin: 0 12px 20px;
  }

  /* Nav label */
  .osb-nav-label {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: var(--osb-eyebrow);
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
    color: var(--osb-item-fg);
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    font-weight: 400;
    transition: color .2s, background .2s;
    position: relative;
    margin-bottom: 2px;
    border: 1px solid transparent;
  }

  .osb-item:hover {
    color: var(--osb-item-hover-fg);
    background: var(--osb-item-hover-bg);
    border-color: var(--osb-item-hover-bd);
  }

  .osb-item.active {
    color: var(--osb-item-active-fg);
    background: var(--osb-item-active-bg);
    border-color: var(--osb-item-active-bd);
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
    background: var(--osb-icon-bg);
    color: var(--osb-icon-fg);
  }

  .osb-item:hover:not(.active) .osb-icon {
    background: var(--osb-icon-hover-bg);
    color: var(--osb-icon-hover-fg);
  }

  /* Bottom user area */
  .osb-footer {
    margin-top: auto;
    padding: 14px;
    border: 1px solid var(--osb-footer-bd);
    border-radius: 12px;
    background: var(--osb-footer-bg);
  }
  .osb-footer-role {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--osb-footer-role);
    margin-bottom: 3px;
  }
  .osb-footer-name {
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: var(--osb-footer-name);
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

  .osb-nav-scroll {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
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
      flex-direction: column;
      padding: 0;
      border-right: none;
      border-top: 1px solid var(--osb-border);
      z-index: 50;
      box-shadow: var(--osb-mob-shadow);
    }
    .osb::before { display: none; }
    .osb-brand,
    .osb-divider,
    .osb-nav-label,
    .osb-footer {
      display: none;
    }

    .osb-nav-scroll {
      position: relative;
      width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      padding: 8px 10px calc(8px + env(safe-area-inset-bottom, 0px));
      flex: unset;
    }
    .osb-nav-scroll::-webkit-scrollbar { display: none; }

    .osb-nav-scroll::before,
    .osb-nav-scroll::after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      width: 20px;
      pointer-events: none;
      z-index: 2;
    }
    .osb-nav-scroll::before {
      left: 0;
      background: linear-gradient(90deg, var(--osb-bg) 25%, transparent);
    }
    .osb-nav-scroll::after {
      right: 0;
      background: linear-gradient(270deg, var(--osb-bg) 25%, transparent);
    }

    .osb nav {
      display: inline-flex;
      flex-direction: row;
      align-items: stretch;
      gap: 6px;
      width: max-content;
      min-width: 100%;
      padding: 0 2px;
    }
    .osb-item {
      flex: 0 0 auto;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 8px 14px;
      margin: 0;
      font-size: 10px;
      text-align: center;
      gap: 5px;
      min-width: 76px;
      max-width: none;
      border-radius: 12px;
    }
    .osb-item.active::before {
      display: none;
    }
    .osb-item.active {
      box-shadow: 0 0 0 1px rgba(124,108,252,.22) inset, 0 4px 16px rgba(124,108,252,.12);
    }
    .osb-item-label {
      font-size: 10px;
      line-height: 1.2;
      white-space: nowrap;
      overflow: visible;
      text-overflow: unset;
    }
    .osb-icon {
      width: 30px;
      height: 30px;
      border-radius: 9px;
    }
  }
`;

const MENU_DEFS = [
  { key: "dashboard",   path: "/owner/analytics",      icon: LayoutDashboard },
  { key: "myFleet",     path: "/my-fleet",              icon: Layers          },
  { key: "myRentals",   path: "/my-rentals",            icon: Car             },
  { key: "addRental",   path: "/add-rental",            icon: PlusCircle      },
  { key: "bookings",    path: "/owner/bookings-list",   icon: ClipboardList   },
  { key: "calendar",    path: "/owner-bookings",        icon: Calendar        },
  { key: "maintenance", path: "/owner/maintenance",     icon: Wrench          },
  { key: "listingViews", path: "/owner/listing-views", icon: Eye             },
  { key: "staff",       path: "/owner/staff",           icon: Users           },
];

function isNavActive(pathname, itemPath) {
  if (pathname === itemPath) return true;
  if (itemPath !== "/" && pathname.startsWith(`${itemPath}/`)) return true;
  return false;
}

export default function OwnerSidebar() {
  const location = useLocation();
  const { dark } = useTheme();
  const { copy } = useAppLang();
  const t = copy.ownerSidebar;
  const itemRefs = useRef({});

  useEffect(() => {
    const active = MENU_DEFS.find((item) => isNavActive(location.pathname, item.path));
    if (!active) return;
    const el = itemRefs.current[active.path];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [location.pathname]);

  return (
    <>
      <style>{STYLES}</style>

      <div className={`osb${dark ? " dark" : ""}`}>

        {/* ── Brand ── */}
        <div className="osb-brand">
          <p className="osb-brand-eyebrow">{t.panel}</p>
          <h2 className="osb-brand-title">{t.brand}</h2>
        </div>

        <div className="osb-divider"/>

        {/* ── Nav ── */}
        <p className="osb-nav-label">{t.navigation}</p>

        <div className="osb-nav-scroll">
          <nav>
            {MENU_DEFS.map((item) => {
              const Icon = item.icon;
              const isActive = isNavActive(location.pathname, item.path);

              return (
                <Link
                  key={item.path}
                  ref={(node) => { itemRefs.current[item.path] = node; }}
                  to={item.path}
                  className={`osb-item${isActive ? " active" : ""}`}
                >
                  <span className="osb-icon">
                    <Icon size={15}/>
                  </span>
                  <span className="osb-item-label">{t.items[item.key]}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── Footer ── */}
        <div className="osb-footer">
          <p className="osb-footer-role">{t.loggedInAs}</p>
          <p className="osb-footer-name">{t.roleOwner}</p>
        </div>

      </div>
    </>
  );
}
