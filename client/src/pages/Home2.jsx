import { Link } from "react-router-dom";
import { loadAuth, clearAuth } from "../utils/authStorage";
import { useState } from "react";

export default function Home() {
  const [auth, setAuth] = useState(() => loadAuth());
  const role = (auth?.role || "").toLowerCase();

  const isCustomer = role === "customer";
  const isRentalOwner = role === "rental_owner";
  const isSeller = role === "seller";
  const isAdmin = role === "admin";

  function handleLogout() {
    clearAuth();
    setAuth(null);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-gray-50 via-white to-white">

      {/* ================= HERO ================= */}
      <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden">

        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          alt=""
        />

        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
            Buy & Rent Cars  
            <span className="block mt-2">The Smart Way</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Buy, sell, or rent cars with confidence.
            Verified listings, smart bookings, and full control.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/cars"
              className="px-8 py-4 bg-black text-white rounded-2xl text-lg font-semibold hover:opacity-90 transition"
            >
              Browse Cars
            </Link>

            <Link
              to="/rentals"
              className="px-8 py-4 border border-gray-300 rounded-2xl text-lg font-semibold hover:bg-gray-100 transition"
            >
              Rent a Car
            </Link>
          </div>
        </div>
      </section>

      {/* ================= USER DASHBOARD ================= */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="bg-white border rounded-3xl p-10 shadow-sm flex flex-col gap-8">

          {auth ? (
            <>
              {/* HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-gray-700">
                  Logged in as <b>{auth.name}</b>{" "}
                  <span className="text-gray-500">({role})</span>
                </p>

                <button
                  onClick={handleLogout}
                  className="px-5 py-3 bg-gray-900 text-white rounded-xl hover:opacity-90 w-fit"
                >
                  Logout
                </button>
              </div>

              {/* ACTIONS GRID */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {/* CUSTOMER */}
                {isCustomer && (
                  <>
                    <ActionCard to="/rentals" title="Rent a Car" />
                    <ActionCard to="/my-bookings" title="My Bookings" />
                    <ActionCard to="/cars" title="Buy a Car" />
                  </>
                )}

                {/* RENTAL OWNER */}
                {isRentalOwner && (
                  <>
                    <ActionCard to="/rentals" title="Browse Rentals" />
                    <ActionCard to="/owner-bookings" title="Rental Bookings" />
                    <ActionCard to="/add-rental" title="Add Rental Car" />
                  </>
                )}

                {/* SELLER */}
                {isSeller && (
                  <>
                    <ActionCard to="/my-sales" title="My Sales" />
                    <ActionCard to="/my-sales/new" title="Add Car for Sale" />
                  </>
                )}

                {/* ADMIN */}
                {isAdmin && (
                  <ActionCard
                    to="/admin"
                    title="Admin Dashboard"
                    dark
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/login"
                className="px-6 py-4 bg-black text-white rounded-2xl font-semibold hover:opacity-90"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-6 py-4 border rounded-2xl font-semibold hover:bg-gray-100"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="relative z-10 text-center text-gray-500 py-10 text-sm">
        © {new Date().getFullYear()} Goovoiture — Built for modern car mobility
      </footer>
    </div>
  );
}

/* ================= ACTION CARD ================= */

function ActionCard({ to, title, dark = false }) {
  return (
    <Link
      to={to}
      className={`p-6 rounded-2xl border font-semibold text-center transition ${
        dark
          ? "bg-black text-white hover:opacity-90"
          : "hover:bg-gray-50"
      }`}
    >
      {title}
    </Link>
  );
}
