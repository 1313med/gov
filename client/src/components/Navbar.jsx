import { Link, useNavigate } from "react-router-dom";
import { loadAuth, clearAuth } from "../utils/authStorage";
import { useAppLang } from "../context/AppLangContext";
import { useSocket } from "../context/SocketContext";
import LangSwitch from "./LangSwitch";

export default function Navbar() {
  const navigate = useNavigate();
  const auth = loadAuth();
  const { copy } = useAppLang();
  const { unreadNotifications, unreadMessages } = useSocket() || {};

  const isSeller = auth && ["seller", "admin"].includes(auth.role?.toLowerCase());
  const isOwner  = auth && auth.role?.toLowerCase() === "rental_owner";
  const isAdmin  = auth && auth.role?.toLowerCase() === "admin";

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <Link to="/" className="font-bold text-xl tracking-tight">
          Goovoiture
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3 text-sm flex-wrap justify-end">
          <LangSwitch />

          <Link to="/cars" className="px-3 py-2 hover:text-black/80">
            {copy.common.browseCars}
          </Link>
          <Link to="/rentals" className="px-3 py-2 hover:text-black/80">
            {copy.common.rentCars}
          </Link>

          {isSeller && (
            <>
              <Link to="/my-sales" className="px-3 py-2 hover:text-black/80">
                {copy.common.mySales}
              </Link>
              <Link to="/my-sales/new" className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-90">
                {copy.common.addCar}
              </Link>
            </>
          )}

          {auth?.token && (
            <>
              {/* Messages */}
              <Link to="/messages" className="relative px-3 py-2 hover:text-black/80" title="Messages">
                <span>✉</span>
                {unreadMessages > 0 && (
                  <span style={{
                    position: "absolute", top: 4, right: 2,
                    background: "#3d3af5", color: "#fff",
                    borderRadius: "50%", width: 16, height: 16,
                    fontSize: 9, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </Link>

              {/* Notifications */}
              <Link to="/notifications" className="relative px-3 py-2 hover:text-black/80" title="Notifications">
                <span>🔔</span>
                {unreadNotifications > 0 && (
                  <span style={{
                    position: "absolute", top: 4, right: 2,
                    background: "#dc2626", color: "#fff",
                    borderRadius: "50%", width: 16, height: 16,
                    fontSize: 9, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
              </Link>

              {/* Profile */}
              <Link to="/profile" className="px-3 py-2 hover:text-black/80" title="My Profile">
                👤
              </Link>

              <button
                type="button"
                onClick={() => { clearAuth(); navigate("/login"); }}
                className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-90"
              >
                {copy.common.logout}
              </button>
            </>
          )}

          {!auth?.token && (
            <Link to="/login" className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-80">
              {copy.common.login}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
