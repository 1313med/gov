import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/axios";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg0:#05060f; --border2:rgba(255,255,255,0.14);
  --p1:#7c6bff; --p2:#a78bfa; --p3:#38bdf8;
  --ink3:rgba(255,255,255,0.4); --danger:#ff6b6b;
  --sans:'Inter',sans-serif; --display:'Syne',sans-serif; --mono:'Space Mono',monospace;
}
.ve-root { min-height:100vh; background:var(--bg0); display:flex; align-items:center; justify-content:center; font-family:var(--sans); position:relative; overflow:hidden; padding:24px; }
.ve-bg { position:fixed; inset:0; z-index:0; pointer-events:none; background:radial-gradient(ellipse 80% 70% at 10% 20%,rgba(124,107,255,0.18) 0%,transparent 60%),radial-gradient(ellipse 60% 60% at 90% 80%,rgba(56,189,248,0.12) 0%,transparent 60%),var(--bg0); }
.ve-orb { position:fixed; z-index:0; pointer-events:none; border-radius:50%; filter:blur(80px); mix-blend-mode:screen; }
.ve-orb1 { width:500px; height:500px; background:radial-gradient(circle,rgba(124,107,255,0.25),transparent 70%); top:-150px; left:-150px; }
.ve-orb2 { width:400px; height:400px; background:radial-gradient(circle,rgba(56,189,248,0.2),transparent 70%); bottom:-100px; right:-100px; }
.ve-card { position:relative; z-index:1; width:100%; max-width:420px; background:rgba(255,255,255,0.04); border:1px solid var(--border2); border-radius:24px; padding:40px 36px; backdrop-filter:blur(24px); box-shadow:0 0 0 1px rgba(255,255,255,0.05) inset,0 32px 64px rgba(0,0,0,0.5),0 0 80px rgba(124,107,255,0.08); animation:cardIn .9s cubic-bezier(0.22,1,0.36,1) both; text-align:center; }
.ve-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(124,107,255,0.5),transparent); }
@keyframes cardIn { from{opacity:0;transform:translateY(32px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
.ve-logo { display:inline-flex; align-items:center; gap:10px; text-decoration:none; margin-bottom:32px; }
.ve-logo-mark { width:32px; height:32px; border-radius:9px; background:linear-gradient(135deg,var(--p1),var(--p3)); display:flex; align-items:center; justify-content:center; font-family:var(--display); font-size:14px; font-weight:800; color:#fff; }
.ve-logo-text { font-family:var(--display); font-size:16px; font-weight:700; color:#fff; }
.ve-logo-text span { color:var(--p2); }
.ve-icon { font-size:56px; margin-bottom:20px; line-height:1; }
.ve-title { font-family:var(--display); font-size:26px; font-weight:800; letter-spacing:-.04em; color:#fff; margin-bottom:10px; }
.ve-sub { font-size:13px; color:var(--ink3); font-weight:300; line-height:1.7; margin-bottom:28px; }
.ve-spinner { width:40px; height:40px; border-radius:50%; border:3px solid rgba(124,107,255,0.2); border-top-color:#7c6bff; animation:spin .8s linear infinite; margin:0 auto 20px; }
@keyframes spin { to{transform:rotate(360deg)} }
.ve-btn { display:inline-block; padding:14px 28px; background:linear-gradient(135deg,var(--p1),rgba(56,189,248,0.8)); border:none; border-radius:14px; font-family:var(--display); font-size:14px; font-weight:700; color:#fff; text-decoration:none; cursor:pointer; box-shadow:0 8px 32px rgba(124,107,255,0.35); transition:transform .2s,box-shadow .2s; }
.ve-btn:hover { transform:translateY(-2px); box-shadow:0 16px 40px rgba(124,107,255,0.45); }
.ve-error { background:rgba(255,107,107,0.08); border:1px solid rgba(255,107,107,0.2); border-radius:12px; padding:14px 16px; font-family:var(--mono); font-size:11px; color:var(--danger); margin-bottom:20px; }
.ve-success-ring { width:72px; height:72px; border-radius:50%; border:2px solid rgba(74,222,128,0.3); display:flex; align-items:center; justify-content:center; margin:0 auto 20px; background:rgba(74,222,128,0.08); font-size:32px; }
`;

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("No verification token found."); return; }
    api.get(`/auth/verify-email/${token}`)
      .then((res) => { setMessage(res.data.message); setStatus("success"); })
      .catch((err) => {
        setMessage(err?.response?.data?.message || "Verification failed. The link may have expired.");
        setStatus("error");
      });
  }, [token]);

  return (
    <div className="ve-root">
      <style>{CSS}</style>
      <div className="ve-bg" />
      <div className="ve-orb ve-orb1" />
      <div className="ve-orb ve-orb2" />

      <div className="ve-card">
        <Link to="/" className="ve-logo">
          <div className="ve-logo-mark">G</div>
          <span className="ve-logo-text">Goo<span>voiture</span></span>
        </Link>

        {status === "loading" && (
          <>
            <div className="ve-spinner" />
            <h1 className="ve-title">Verifying your email…</h1>
            <p className="ve-sub">Just a moment, please.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="ve-success-ring">✓</div>
            <h1 className="ve-title">Email verified!</h1>
            <p className="ve-sub">{message}<br/>You can now access all features of your account.</p>
            <Link to="/" className="ve-btn">Go to homepage</Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="ve-icon">✉</div>
            <h1 className="ve-title">Verification failed</h1>
            <div className="ve-error">{message}</div>
            <p className="ve-sub">Request a new verification link from your profile settings.</p>
            <Link to="/" className="ve-btn">Back to homepage</Link>
          </>
        )}
      </div>
    </div>
  );
}
