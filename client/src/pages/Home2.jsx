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
    <div className="relative min-h-screen bg-white overflow-hidden">

      {/* ================= HERO ================= */}
      <section className="relative min-h-[90vh] flex items-center justify-center text-center px-6">

        <img
          src="https://images.unsplash.com/photo-1493238792000-8113da705763"
          className="absolute inset-0 w-full h-full object-cover"
          alt=""
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 max-w-5xl text-white">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-tight">
            The Future of
            <span className="block text-gray-200 mt-3">
              Car Buying & Renting
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
            Discover verified vehicles, secure rentals, and trusted sellers —
            all in one global marketplace.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-6">
            <Link
              to="/cars"
              className="px-10 py-4 bg-white text-black rounded-2xl text-lg font-semibold hover:scale-105 transition"
            >
              Browse Cars
            </Link>

            <Link
              to="/rentals"
              className="px-10 py-4 border border-white rounded-2xl text-lg font-semibold hover:bg-white hover:text-black transition"
            >
              Rent a Car
            </Link>
          </div>
        </div>
      </section>

      {/* ================= TRUST STATS ================= */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-3 gap-10 text-center">

          <Stat number="10K+" label="Verified Vehicles" />
          <Stat number="5K+" label="Active Users" />
          <Stat number="99%" label="Secure Transactions" />

        </div>
      </section>

      {/* ================= FEATURED CATEGORIES ================= */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-14">
          Explore Categories
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          <CategoryCard
            title="Luxury Cars"
            img="https://images.unsplash.com/photo-1502877338535-766e1452684a"
          />

          <CategoryCard
            title="Electric Vehicles"
            img="https://images.unsplash.com/photo-1511919884226-fd3cad34687c"
          />

          <CategoryCard
            title="SUV & Family"
            img="https://images.unsplash.com/photo-1549924231-f129b911e442"
          />

        </div>
      </section>

      {/* ================= USER DASHBOARD ================= */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-white border rounded-3xl p-10 shadow-xl flex flex-col gap-8">

          {auth ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-gray-700 text-lg">
                  Logged in as <b>{auth.name}</b>{" "}
                  <span className="text-gray-500">({role})</span>
                </p>

                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-black text-white rounded-xl hover:opacity-90"
                >
                  Logout
                </button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                {isCustomer && (
                  <>
                    <ActionCard to="/rentals" title="Rent a Car" />
                    <ActionCard to="/my-bookings" title="My Bookings" />
                    <ActionCard to="/cars" title="Buy a Car" />
                  </>
                )}

                {isRentalOwner && (
                  <>
                    <ActionCard to="/rentals" title="Browse Rentals" />
                    <ActionCard to="/owner-bookings" title="Rental Bookings" />
                    <ActionCard to="/add-rental" title="Add Rental Car" />
                  </>
                )}

                {isSeller && (
                  <>
                    <ActionCard to="/my-sales" title="My Sales" />
                    <ActionCard to="/my-sales/new" title="Add Car for Sale" />
                  </>
                )}

                {isAdmin && (
                  <ActionCard to="/admin" title="Admin Dashboard" dark />
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-wrap gap-6 justify-center">
              <Link
                to="/login"
                className="px-8 py-4 bg-black text-white rounded-2xl font-semibold hover:opacity-90"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-8 py-4 border rounded-2xl font-semibold hover:bg-gray-100"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-black text-gray-400 py-14">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10 text-sm">

          <div>
            <h3 className="text-white font-semibold mb-4">Goovoiture</h3>
            <p>
              A global marketplace for buying, selling, and renting cars with confidence.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="/cars">Buy Cars</Link></li>
              <li><Link to="/rentals">Rent Cars</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>Terms</li>
              <li>Privacy</li>
            </ul>
          </div>

        </div>

        <div className="text-center mt-10 text-xs text-gray-500">
          © {new Date().getFullYear()} Goovoiture — International Car Marketplace
        </div>
      </footer>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function ActionCard({ to, title, dark = false }) {
  return (
    <Link
      to={to}
      className={`p-8 rounded-2xl border font-semibold text-center transition text-lg ${
        dark
          ? "bg-black text-white hover:opacity-90"
          : "hover:bg-gray-50 hover:shadow-md"
      }`}
    >
      {title}
    </Link>
  );
}

function Stat({ number, label }) {
  return (
    <div>
      <h3 className="text-4xl font-bold">{number}</h3>
      <p className="text-gray-600 mt-2">{label}</p>
    </div>
  );
}

function CategoryCard({ title, img }) {
  return (
    <div className="relative rounded-3xl overflow-hidden group cursor-pointer">
      <img src={img} className="w-full h-72 object-cover group-hover:scale-105 transition duration-500" alt="" />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition" />
      <div className="absolute bottom-6 left-6 text-white text-2xl font-bold">
        {title}
      </div>
    </div>
  );
}
