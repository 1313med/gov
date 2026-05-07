import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/axios";
import { saveAuth } from "../utils/authStorage";
import { useAppLang } from "../context/AppLangContext";

export default function Register() {
  const { copy } = useAppLang();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState("customer");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        name,
        phone,
        password,
        city,
        role,
      });

      saveAuth(res.data);
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || copy.register.regFail);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#05060f] transition-colors">

      {/* ================= LEFT SIDE (BRANDING) ================= */}
      <div className="hidden lg:flex lg:w-1/2 bg-black dark:bg-[#0a0a12] text-white items-center justify-center relative overflow-hidden">

        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70"
          className="absolute inset-0 w-full h-full object-cover opacity-40 dark:opacity-30"
          alt=""
        />

        <div className="relative z-10 max-w-md px-10">
          <h1 className="text-5xl font-extrabold leading-tight">
            {copy.register.joinTitle}
          </h1>
          <p className="mt-6 text-gray-300 dark:text-slate-400 text-lg">
            {copy.register.joinSub}
          </p>
        </div>
      </div>

      {/* ================= RIGHT SIDE (FORM) ================= */}
      <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-gray-100 to-white dark:from-[#0a0a12] dark:to-[#05060f] px-6 transition-colors">

        <div className="w-full max-w-md bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/80 rounded-3xl shadow-2xl dark:shadow-black/40 p-10">

          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {copy.register.createTitle}
            </h2>
            <p className="mt-2 text-gray-500 dark:text-slate-400">
              {copy.register.createSub}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-sm px-4 py-3 border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">

            <FloatingInput
              label={copy.register.fullName}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <FloatingInput
              label={copy.register.phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <FloatingInput
              label={copy.register.city}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />

            {/* Account Type */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-slate-400">
                {copy.register.accountType}
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 px-4 py-4 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-violet-500/40 transition"
              >
                <option value="customer">{copy.register.roleCustomer}</option>
                <option value="seller">{copy.register.roleSeller}</option>
                <option value="rental_owner">{copy.register.roleRental}</option>
              </select>
            </div>

            <FloatingInput
              label={copy.register.password}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              disabled={loading}
              className="w-full mt-4 bg-black dark:bg-violet-600 text-white py-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-60 dark:hover:bg-violet-500"
            >
              {loading ? copy.register.creating : copy.register.createBtn}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-slate-400">
            {copy.register.footerQ}{" "}
            <Link
              to="/login"
              className="text-black dark:text-violet-400 font-semibold hover:underline"
            >
              {copy.register.footerLogin}
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
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" "
        required
        className="peer w-full border border-gray-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 rounded-2xl px-4 pt-6 pb-3 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-violet-500/40 transition"
      />
      <label className="absolute left-4 top-3 text-gray-400 dark:text-slate-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 dark:peer-placeholder-shown:text-slate-500 peer-focus:top-3 peer-focus:text-sm peer-focus:text-black dark:peer-focus:text-violet-300">
        {label}
      </label>
    </div>
  );
}
