import { Link } from "react-router-dom";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-gray-950 border-r border-gray-800 p-6">
        <h2 className="text-xl font-bold mb-8">Admin Panel</h2>

        <nav className="space-y-3 text-sm">
          <Link to="/admin" className="block hover:text-white">
            Dashboard
          </Link>

          <Link to="/admin/sales" className="block hover:text-white">
            Listings
          </Link>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
