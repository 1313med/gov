import { Link } from "react-router-dom";
import { loadAuth, clearAuth } from "../utils/authStorage";
import { useState } from "react";

export default function Home() {
  const [auth, setAuth] = useState(() => loadAuth());
  const role = (auth?.role || "").toLowerCase();
  const isSeller = role === "seller" || role === "admin";

  function handleLogout() {
    clearAuth();
    setAuth(null);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="bg-white border rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold">Goovoiture</h1>
        <p className="text-gray-600 mt-2">
          Sell cars and rent cars (MVP). Simple, fast, and secure.
        </p>

        {auth ? (
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-gray-700">
                Logged in as: <b>{auth.name}</b>{" "}
                <span className="text-gray-500">({role})</span>
              </p>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-90 w-fit"
              >
                Logout
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className="px-5 py-3 border rounded-xl hover:bg-gray-50"
                to="/cars"
              >
                Browse Cars
              </Link>

              {isSeller && (
                <Link
                  className="px-5 py-3 bg-black text-white rounded-xl hover:opacity-90"
                  to="/my-sales"
                >
                  My Sales
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="px-5 py-3 bg-black text-white rounded-xl hover:opacity-90"
              to="/login"
            >
              Login
            </Link>

            <Link className="px-5 py-3 border rounded-xl" to="/register">
              Register
            </Link>

            <Link className="px-5 py-3 border rounded-xl" to="/cars">
              Browse Cars
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
