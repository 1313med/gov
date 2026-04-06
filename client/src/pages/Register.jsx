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
    <div className="min-h-screen flex">

      {/* ================= LEFT SIDE (BRANDING) ================= */}
      <div className="hidden lg:flex lg:w-1/2 bg-black text-white items-center justify-center relative overflow-hidden">

        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          alt=""
        />

        <div className="relative z-10 max-w-md px-10">
          <h1 className="text-5xl font-extrabold leading-tight">
            {copy.register.joinTitle}
          </h1>
          <p className="mt-6 text-gray-300 text-lg">
            {copy.register.joinSub}
          </p>
        </div>
      </div>

      {/* ================= RIGHT SIDE (FORM) ================= */}
      <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-gray-100 to-white px-6">

        <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-10">

          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-extrabold">
              {copy.register.createTitle}
            </h2>
            <p className="mt-2 text-gray-500">
              {copy.register.createSub}
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
              <label className="text-sm font-medium text-gray-600">
                {copy.register.accountType}
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-4 focus:outline-none focus:ring-2 focus:ring-black/20 transition"
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
              className="w-full mt-4 bg-black text-white py-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-60"
            >
              {loading ? copy.register.creating : copy.register.createBtn}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            {copy.register.footerQ}{" "}
            <Link
              to="/login"
              className="text-black font-semibold hover:underline"
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
        className="peer w-full border border-gray-200 bg-white/80 rounded-2xl px-4 pt-6 pb-3 focus:outline-none focus:ring-2 focus:ring-black/20 transition"
      />
      <label className="absolute left-4 top-3 text-gray-400 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-3 peer-focus:text-sm peer-focus:text-black">
        {label}
      </label>
    </div>
  );
}
