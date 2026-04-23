import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg0:#05060f; --bg1:#080c1a; --glass:rgba(255,255,255,0.04);
  --border:rgba(255,255,255,0.08); --border2:rgba(255,255,255,0.14);
  --p1:#7c6bff; --p2:#a78bfa; --p3:#38bdf8; --p-glow:rgba(124,107,255,0.35);
  --ink:#ffffff; --ink2:rgba(255,255,255,0.7); --ink3:rgba(255,255,255,0.4);
  --ink4:rgba(255,255,255,0.2); --danger:#ff6b6b;
  --sans:'Inter',sans-serif; --display:'Syne',sans-serif; --mono:'Space Mono',monospace;
}
.fp-root { min-height:100vh; background:var(--bg0); display:flex; align-items:center; justify-content:center; font-family:var(--sans); position:relative; overflow:hidden; padding:24px; }
.fp-bg { position:fixed; inset:0; z-index:0; pointer-events:none; background:radial-gradient(ellipse 80% 70% at 10% 20%,rgba(124,107,255,0.18) 0%,transparent 60%),radial-gradient(ellipse 60% 60% at 90% 80%,rgba(56,189,248,0.12) 0%,transparent 60%),var(--bg0); }
.fp-orb { position:fixed; z-index:0; pointer-events:none; border-radius:50%; filter:blur(80px); mix-blend-mode:screen; }
.fp-orb1 { width:500px; height:500px; background:radial-gradient(circle,rgba(124,107,255,0.25),transparent 70%); top:-150px; left:-150px; }
.fp-orb2 { width:400px; height:400px; background:radial-gradient(circle,rgba(56,189,248,0.2),transparent 70%); bottom:-100px; right:-100px; }
.fp-card { position:relative; z-index:1; width:100%; max-width:420px; background:rgba(255,255,255,0.04); border:1px solid var(--border2); border-radius:24px; padding:40px 36px; backdrop-filter:blur(24px); box-shadow:0 0 0 1px rgba(255,255,255,0.05) inset,0 32px 64px rgba(0,0,0,0.5),0 0 80px rgba(124,107,255,0.08); animation:cardIn .9s cubic-bezier(0.22,1,0.36,1) both; }
.fp-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(124,107,255,0.5),transparent); }
@keyframes cardIn { from{opacity:0;transform:translateY(32px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
.fp-logo { display:inline-flex; align-items:center; gap:10px; text-decoration:none; margin-bottom:32px; }
.fp-logo-mark { width:32px; height:32px; border-radius:9px; background:linear-gradient(135deg,var(--p1),var(--p3)); display:flex; align-items:center; justify-content:center; font-family:var(--display); font-size:14px; font-weight:800; color:#fff; }
.fp-logo-text { font-family:var(--display); font-size:16px; font-weight:700; color:#fff; }
.fp-logo-text span { color:var(--p2); }
.fp-title { font-family:var(--display); font-size:28px; font-weight:800; letter-spacing:-.04em; color:#fff; margin-bottom:8px; }
.fp-sub { font-size:13px; color:var(--ink3); font-weight:300; line-height:1.6; margin-bottom:28px; }
.fp-field { position:relative; margin-bottom:14px; }
.fp-input { width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--border); border-radius:14px; padding:16px; font-family:var(--mono); font-size:13px; color:#fff; outline:none; transition:border-color .25s,background .25s,box-shadow .25s; }
.fp-input:focus { border-color:rgba(124,107,255,0.5); background:rgba(124,107,255,0.08); box-shadow:0 0 0 3px rgba(124,107,255,0.1); }
.fp-input::placeholder { color:var(--ink4); }
.fp-submit { width:100%; padding:16px; background:linear-gradient(135deg,var(--p1) 0%,rgba(56,189,248,0.8) 100%); border:none; border-radius:14px; font-family:var(--display); font-size:14px; font-weight:700; color:#fff; cursor:pointer; transition:transform .2s,box-shadow .2s,opacity .2s; box-shadow:0 8px 32px rgba(124,107,255,0.35); }
.fp-submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 16px 40px rgba(124,107,255,0.45); }
.fp-submit:disabled { opacity:.55; cursor:not-allowed; }
.fp-error { display:flex; align-items:flex-start; gap:10px; background:rgba(255,107,107,0.08); border:1px solid rgba(255,107,107,0.2); border-radius:12px; padding:12px 14px; margin-bottom:16px; font-family:var(--mono); font-size:11px; color:var(--danger); }
.fp-success { background:rgba(12,153,102,0.1); border:1px solid rgba(12,153,102,0.25); border-radius:12px; padding:16px; margin-bottom:16px; font-size:13px; color:#4ade80; line-height:1.6; }
.fp-back { display:block; text-align:center; margin-top:20px; font-size:13px; color:var(--ink3); text-decoration:none; font-weight:300; }
.fp-back span { color:var(--p2); font-weight:500; }
.fp-spinner { display:inline-block; width:16px; height:16px; border-radius:50%; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; animation:spin .7s linear infinite; vertical-align:middle; margin-right:8px; }
@keyframes spin { to{transform:rotate(360deg)} }
`;

export default function ForgotPassword() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [sent,    setSent]    = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fp-root">
      <style>{CSS}</style>
      <div className="fp-bg" />
      <div className="fp-orb fp-orb1" />
      <div className="fp-orb fp-orb2" />

      <div className="fp-card">
        <Link to="/" className="fp-logo">
          <div className="fp-logo-mark">G</div>
          <span className="fp-logo-text">Goo<span>voiture</span></span>
        </Link>

        <h1 className="fp-title">Forgot password?</h1>
        <p className="fp-sub">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && <div className="fp-error">⚠ {error}</div>}

        {sent ? (
          <div className="fp-success">
            Check your inbox — if an account with that email exists, a reset link has been sent.
            The link expires in 1 hour.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="fp-field">
              <input
                type="email"
                className="fp-input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <button type="submit" className="fp-submit" disabled={loading}>
              {loading && <span className="fp-spinner" />}
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <Link to="/login" className="fp-back">
          Back to <span>Sign in</span>
        </Link>
      </div>
    </div>
  );
}
