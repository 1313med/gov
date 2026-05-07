import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { useAppLang } from "../context/AppLangContext";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.rp-root { min-height:100vh; background:var(--bg0); display:flex; align-items:center; justify-content:center; font-family:var(--sans); position:relative; overflow:hidden; padding:24px; }
.rp-bg { position:fixed; inset:0; z-index:0; pointer-events:none; background:radial-gradient(ellipse 80% 70% at 10% 20%,rgba(124,107,255,0.18) 0%,transparent 60%),radial-gradient(ellipse 60% 60% at 90% 80%,rgba(56,189,248,0.12) 0%,transparent 60%),var(--bg0); }
.rp-orb { position:fixed; z-index:0; pointer-events:none; border-radius:50%; filter:blur(80px); mix-blend-mode:screen; }
.rp-orb1 { width:500px; height:500px; background:radial-gradient(circle,rgba(124,107,255,0.25),transparent 70%); top:-150px; left:-150px; }
.rp-orb2 { width:400px; height:400px; background:radial-gradient(circle,rgba(56,189,248,0.2),transparent 70%); bottom:-100px; right:-100px; }
.rp-card { position:relative; z-index:1; width:100%; max-width:420px; background:rgba(255,255,255,0.04); border:1px solid var(--border2); border-radius:24px; padding:40px 36px; backdrop-filter:blur(24px); box-shadow:0 0 0 1px rgba(255,255,255,0.05) inset,0 32px 64px rgba(0,0,0,0.5),0 0 80px rgba(124,107,255,0.08); animation:cardIn .9s cubic-bezier(0.22,1,0.36,1) both; }
.rp-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(124,107,255,0.5),transparent); }
@keyframes cardIn { from{opacity:0;transform:translateY(32px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
.rp-logo { display:inline-flex; align-items:center; gap:10px; text-decoration:none; margin-bottom:32px; }
.rp-logo-mark { width:32px; height:32px; border-radius:9px; background:linear-gradient(135deg,var(--p1),var(--p3)); display:flex; align-items:center; justify-content:center; font-family:var(--display); font-size:14px; font-weight:800; color:#fff; }
.rp-logo-text { font-family:var(--display); font-size:16px; font-weight:700; color:#fff; }
.rp-logo-text span { color:var(--p2); }
.rp-title { font-family:var(--display); font-size:28px; font-weight:800; letter-spacing:-.04em; color:#fff; margin-bottom:8px; }
.rp-sub { font-size:13px; color:var(--ink3); font-weight:300; line-height:1.6; margin-bottom:28px; }
.rp-field { position:relative; margin-bottom:14px; }
.rp-label { display:block; font-family:var(--mono); font-size:10px; letter-spacing:.08em; text-transform:uppercase; color:var(--ink3); margin-bottom:8px; }
.rp-input { width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--border); border-radius:14px; padding:16px; font-family:var(--mono); font-size:13px; color:#fff; outline:none; transition:border-color .25s,background .25s,box-shadow .25s; }
.rp-input:focus { border-color:rgba(124,107,255,0.5); background:rgba(124,107,255,0.08); box-shadow:0 0 0 3px rgba(124,107,255,0.1); }
.rp-input::placeholder { color:var(--ink4); }
.rp-strength { height:3px; border-radius:99px; margin-top:6px; transition:all .3s; }
.rp-strength-wrap { background:rgba(255,255,255,.06); border-radius:99px; overflow:hidden; }
.rp-strength-label { font-family:var(--mono); font-size:9px; letter-spacing:.08em; margin-top:4px; }
.rp-submit { width:100%; padding:16px; background:linear-gradient(135deg,var(--p1) 0%,rgba(56,189,248,0.8) 100%); border:none; border-radius:14px; font-family:var(--display); font-size:14px; font-weight:700; color:#fff; cursor:pointer; transition:transform .2s,box-shadow .2s,opacity .2s; box-shadow:0 8px 32px rgba(124,107,255,0.35); margin-top:4px; }
.rp-submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 16px 40px rgba(124,107,255,0.45); }
.rp-submit:disabled { opacity:.55; cursor:not-allowed; }
.rp-error { display:flex; align-items:flex-start; gap:10px; background:rgba(255,107,107,0.08); border:1px solid rgba(255,107,107,0.2); border-radius:12px; padding:12px 14px; margin-bottom:16px; font-family:var(--mono); font-size:11px; color:var(--danger); }
.rp-success { background:rgba(12,153,102,0.1); border:1px solid rgba(12,153,102,0.25); border-radius:12px; padding:16px; margin-bottom:16px; font-size:13px; color:#4ade80; line-height:1.6; }
.rp-back { display:block; text-align:center; margin-top:20px; font-size:13px; color:var(--ink3); text-decoration:none; font-weight:300; }
.rp-back span { color:var(--p2); font-weight:500; }
.rp-spinner { display:inline-block; width:16px; height:16px; border-radius:50%; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; animation:spin .7s linear infinite; vertical-align:middle; margin-right:8px; }
@keyframes spin { to{transform:rotate(360deg)} }
`;

function getStrength(pw, labels) {
  if (!pw) return { pct: 0, label: "", color: "transparent" };
  let score = 0;
  if (pw.length >= 8)           score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { pct: "0%",   label: "",            color: "transparent" },
    { pct: "25%",  label: labels.weak,   color: "#f87171" },
    { pct: "50%",  label: labels.fair,   color: "#fbbf24" },
    { pct: "75%",  label: labels.good,   color: "#4ade80" },
    { pct: "100%", label: labels.strong, color: "#a78bfa" },
  ];
  return map[score];
}

export default function ResetPassword() {
  const { copy } = useAppLang();
  const t = copy.resetPassword;
  const { token } = useParams();
  const navigate  = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [done,     setDone]     = useState(false);

  const strength = getStrength(password, t.strength);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) { setError(t.mismatch); return; }
    if (password.length < 6)  { setError(t.tooShort); return; }
    setError(""); setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || t.failed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rp-root gv-auth">
      <style>{CSS}</style>
      <div className="rp-bg" />
      <div className="rp-orb rp-orb1" />
      <div className="rp-orb rp-orb2" />

      <div className="rp-card">
        <Link to="/" className="rp-logo">
          <div className="rp-logo-mark">G</div>
          <span className="rp-logo-text">Goo<span>voiture</span></span>
        </Link>

        <h1 className="rp-title">{t.title}</h1>
        <p className="rp-sub">{t.sub}</p>

        {error && <div className="rp-error">⚠ {error}</div>}

        {done ? (
          <div className="rp-success">
            {t.success}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="rp-field">
              <label className="rp-label">{t.newPassword}</label>
              <input
                type="password"
                className="rp-input"
                placeholder={t.newPasswordPh}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
              {password && (
                <>
                  <div className="rp-strength-wrap" style={{ marginTop: 6 }}>
                    <div className="rp-strength" style={{ width: strength.pct, background: strength.color }} />
                  </div>
                  <div className="rp-strength-label" style={{ color: strength.color }}>{strength.label}</div>
                </>
              )}
            </div>

            <div className="rp-field">
              <label className="rp-label">{t.confirmPassword}</label>
              <input
                type="password"
                className="rp-input"
                placeholder={t.confirmPasswordPh}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="rp-submit" disabled={loading}>
              {loading && <span className="rp-spinner" />}
              {loading ? t.submitting : t.submit}
            </button>
          </form>
        )}

        <Link to="/login" className="rp-back">
          {t.backText}<span>{t.backLink}</span>
        </Link>
      </div>
    </div>
  );
}
