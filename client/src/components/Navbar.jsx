import { Link, useNavigate } from "react-router-dom";
import { loadAuth, clearAuth } from "../utils/authStorage";

export default function Navbar() {
  const navigate = useNavigate();
  const auth = loadAuth();
  const role = (auth?.role || "").toLowerCase();
  const isSeller = role === "seller" || role === "admin";

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        
        <Link to="/" className="font-bold text-xl tracking-tight">
          Goovoiture
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link to="/cars" className="px-3 py-2 hover:text-black/80">
            Browse Cars
          </Link>

          {isSeller && (
            <Link to="/my-sales" className="px-3 py-2 hover:text-black/80">
              My Sales
            </Link>
          )}

          {auth?.token ? (
            <button
              onClick={() => {
                clearAuth();
                navigate("/login");
              }}
              className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-90"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-80"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
