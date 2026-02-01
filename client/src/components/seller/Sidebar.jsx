import { Link, useLocation } from "react-router-dom";

const Item = ({ to, label }) => {
  const { pathname } = useLocation();
  const active = pathname === to;

  return (
    <Link
      to={to}
      className={`block px-4 py-3 rounded-lg text-sm font-medium transition
        ${active ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800"}`}
    >
      {label}
    </Link>
  );
};

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-950 border-r border-gray-800 p-6">
      <h2 className="text-xl font-bold text-white mb-8">Seller Panel</h2>

      <nav className="space-y-2">
        <Item to="/dashboard" label="📊 Dashboard" />
        <Item to="/my-sales" label="🚗 My Listings" />
        <Item to="/my-sales/new" label="➕ Add Car" />
        <Item to="/cars" label="🌍 Browse Cars" />
        <Item to="/notifications" label="🔔 Notifications" />

      </nav>
    </aside>
  );
}
