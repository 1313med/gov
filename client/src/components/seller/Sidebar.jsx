import { Link, useLocation } from "react-router-dom";
import { useAppLang } from "../../context/AppLangContext";

const Item = ({ to, label }) => {
  const { pathname } = useLocation();
  const active = pathname === to;

  return (
    <Link
      to={to}
      className={`block px-4 py-3 rounded-lg text-sm font-medium transition
        ${active
          ? "bg-indigo-100 text-indigo-900 dark:bg-gray-800 dark:text-white"
          : "text-slate-600 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}
    >
      {label}
    </Link>
  );
};

export default function Sidebar() {
  const { copy } = useAppLang();
  const t = copy.carOwnerSidebar || copy.sellerSidebar;
  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 p-6 dark:bg-gray-950 dark:border-gray-800 transition-colors duration-300">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">{t.panel}</h2>

      <nav className="space-y-2">
        <Item to="/dashboard"     label={t.items.dashboard} />
        <Item to="/my-sales"      label={t.items.myListings} />
        <Item to="/my-sales/new"  label={t.items.addCar} />
        <Item to="/cars"          label={t.items.browseCars} />
        <Item to="/notifications" label={t.items.notifications} />
      </nav>
    </aside>
  );
}
