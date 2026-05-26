import { Link, useLocation } from "react-router-dom";
import { CarFront, Layers3, Fuel, BadgeDollarSign, ShieldAlert } from "lucide-react";

const ITEMS = [
  { to: "/garage", path: "/garage", icon: CarFront, fr: "Garage", en: "Garage", exact: true },
  { to: "/garage#outils", path: "/garage", icon: Layers3, fr: "Outils", en: "Tools", hash: "#outils" },
  { to: "/fuel-tracker", path: "/fuel-tracker", icon: Fuel, fr: "Essence", en: "Fuel" },
  { to: "/mechanic-prices", path: "/mechanic-prices", icon: BadgeDollarSign, fr: "Prix", en: "Prices" },
  { to: "/emergency", path: "/emergency", icon: ShieldAlert, fr: "SOS", en: "SOS", danger: true },
];

export default function GarageDock({ fr = true }) {
  const { pathname, hash } = useLocation();

  return (
    <nav className="ge-dock" aria-label={fr ? "Navigation garage" : "Garage navigation"}>
      <div className="ge-dock-inner">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          let on = false;
          if (item.hash === "#outils") {
            on = pathname === "/garage" && hash === "#outils";
          } else if (item.exact) {
            on = pathname === "/garage" && hash !== "#outils";
          } else if (item.danger) {
            on = pathname === item.path;
          } else {
            on = pathname === item.path || pathname.startsWith(`${item.path}/`);
          }
          return (
            <Link
              key={item.to + item.fr}
              to={item.to}
              className={`ge-dock-item${on ? " on" : ""}${item.danger ? " danger" : ""}`}
            >
              <span className="ge-dock-icon-wrap">
                <Icon size={22} strokeWidth={on ? 2.25 : 1.9} />
                {on && <span className="ge-dock-glow" />}
              </span>
              <span className="ge-dock-label">{fr ? item.fr : item.en}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
