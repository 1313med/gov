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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-gray-50 via-white to-white">

     {/* ================= DECORATIVE BACKGROUND CARS ================= */}


      {/* ================= HERO ================= */}
      {/* ================= HERO BACKGROUND ================= */}
<div className="absolute inset-0 h-[620px] bg-gradient-to-b from-white via-white/90 to-white z-0" />

{/* ================= FULL HERO ================= */}
<section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden">

  {/* Background image */}
  <img
    src="https://images.unsplash.com/photo-1503376780353-7e6692767b70"
    className="absolute inset-0 w-full h-full object-cover opacity-30"
    alt=""
  />

  {/* Overlay */}
  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />

  {/* Content */}
  <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
    <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
      Buy & Sell Cars  
      <span className="block mt-2">The Smart Way</span>
    </h1>

    <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
      A modern car marketplace connecting buyers with trusted sellers.
      Fast search, verified listings, and direct contact.
    </p>

    <div className="mt-10 flex flex-wrap justify-center gap-4">
      <Link
        to="/cars"
        className="px-8 py-4 bg-black text-white rounded-2xl text-lg font-semibold hover:opacity-90 transition shadow-lg"
      >
        Browse Cars
      </Link>

      {!auth && (
        <Link
          to="/register"
          className="px-8 py-4 border border-gray-300 rounded-2xl text-lg font-semibold hover:bg-gray-100 transition"
        >
          Get Started
        </Link>
      )}
    </div>
  </div>
</section>


      {/* ================= TRUST / FEATURES ================= */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 text-center">
          
          <div className="bg-white/80 backdrop-blur border rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-bold">Verified Listings</h3>
            <p className="mt-3 text-gray-600">
              Every car is reviewed and approved to ensure trust and quality.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur border rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-bold">Direct Contact</h3>
            <p className="mt-3 text-gray-600">
              Call or WhatsApp sellers directly — no middlemen.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur border rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-bold">Smart Search</h3>
            <p className="mt-3 text-gray-600">
              Find the right car instantly with powerful filters and search.
            </p>
          </div>

        </div>
      </section>

      {/* ================= USER ACTIONS ================= */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <div className="bg-white border rounded-3xl p-10 shadow-sm flex flex-col gap-6">

          {auth ? (
            <>
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

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/cars"
                  className="px-6 py-4 border rounded-2xl font-semibold hover:bg-gray-100"
                >
                  Browse Cars
                </Link>

                {isSeller && (
                  <Link
                    to="/my-sales"
                    className="px-6 py-4 bg-black text-white rounded-2xl font-semibold hover:opacity-90"
                  >
                    My Sales
                  </Link>
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
        © {new Date().getFullYear()} Goovoiture — Built for modern car trading
      </footer>
    </div>
  );
}
