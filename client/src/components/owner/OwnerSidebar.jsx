import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Car,
  PlusCircle,
  Calendar
} from "lucide-react";

export default function OwnerSidebar() {

  const location = useLocation();

  const menu = [
    {
      name: "Dashboard",
      path: "/owner/analytics",
      icon: LayoutDashboard
    },
    {
      name: "My Rentals",
      path: "/my-rentals",
      icon: Car
    },
    {
      name: "Add Rental",
      path: "/add-rental",
      icon: PlusCircle
    },
    {
      name: "Bookings",
      path: "/owner/bookings",
      icon: Calendar
    }
  ];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen p-6">

      <h2 className="text-xl font-bold mb-8">
        Owner Panel
      </h2>

      <nav className="space-y-2">

        {menu.map((item) => {

          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition
              
              ${
                location.pathname === item.path
                  ? "bg-indigo-600"
                  : "hover:bg-slate-800"
              }
              
              `}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );

        })}

      </nav>

    </div>
  );
}
