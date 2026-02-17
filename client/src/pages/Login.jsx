import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/axios";
import { saveAuth } from "../utils/authStorage";

export default function Login() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { phone, password });
      saveAuth(res.data);

      const role = res.data.role;

      if (role === "admin") {
        navigate("/admin");
      } else if (role === "seller") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ================= LEFT SIDE (BRANDING) ================= */}
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white items-center justify-center relative overflow-hidden">

        <img
          src="https://images.unsplash.com/photo-1493238792000-8113da705763"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          alt=""
        />

        <div className="relative z-10 max-w-md px-10">
          <h1 className="text-5xl font-extrabold leading-tight">
            Welcome Back to Goovoiture
          </h1>
          <p className="mt-6 text-gray-300 text-lg">
            Buy. Sell. Rent. Experience the future of car mobility.
          </p>
        </div>
      </div>

      {/* ================= RIGHT SIDE (FORM) ================= */}
      <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-gray-100 to-white px-6">

        <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-10">

          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-extrabold">
              Sign In
            </h2>
            <p className="mt-2 text-gray-500">
              Access your account securely
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-2xl bg-red-50 text-red-600 text-sm px-4 py-3 border border-red-200">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">

            <FloatingInput
              label="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06XXXXXXXX"
            />

            <FloatingInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <button
              disabled={loading}
              className="w-full mt-4 bg-black text-white py-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-black font-semibold hover:underline"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= FLOATING INPUT ================= */

function FloatingInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" "
        required
        className="peer w-full border border-gray-200 bg-white/80 rounded-2xl px-4 pt-6 pb-3 focus:outline-none focus:ring-2 focus:ring-black/20 transition"
      />
      <label className="absolute left-4 top-3 text-gray-400 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-3 peer-focus:text-sm peer-focus:text-black">
        {label}
      </label>
    </div>
  );
}
