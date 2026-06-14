import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import { useAppLang } from "../context/AppLangContext";
import AuthTopBar from "../components/AuthTopBar";

const CSS = `
.vp-root {
  min-height: 100vh;
  background: var(--bg0);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  font-family: var(--sans);
}
.vp-card {
  max-width: 480px;
  width: 100%;
  padding: 2.5rem 2rem;
  border-radius: 20px;
  background: var(--card-bg);
  border: 1px solid var(--card-bdr);
  box-shadow: var(--card-shadow);
  text-align: center;
}
.vp-icon {
  width: 64px; height: 64px;
  margin: 0 auto 1.25rem;
  border-radius: 50%;
  background: rgba(124,107,255,0.15);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.75rem;
}
.vp-title {
  font-family: var(--disp);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 0.75rem;
}
.vp-body {
  color: var(--mut);
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}
.vp-email {
  color: var(--brand);
  font-weight: 600;
  word-break: break-all;
}
.vp-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.vp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s;
}
.vp-btn-primary {
  background: var(--brand);
  color: #fff;
}
.vp-btn-outline {
  border: 1px solid var(--card-bdr);
  color: var(--ink);
  background: transparent;
}
.vp-msg { font-size: 0.85rem; margin-top: 1rem; color: var(--mut); }
.vp-msg.ok { color: #22c55e; }
.vp-msg.err { color: #ef4444; }
`;

export default function VerifyEmailPending() {
  const { copy } = useAppLang();
  const t = copy.verifyPending;
  const params = new URLSearchParams(window.location.search);
  const email = params.get("email") || "";
  const [resendMsg, setResendMsg] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  const handleResend = async () => {
    setResendLoading(true);
    setResendMsg("");
    try {
      await api.post("/auth/resend-verification", { email });
      setResendMsg(t.resendOk);
    } catch (err) {
      setResendMsg(err?.response?.data?.message || t.resendFail);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="vp-root gv-auth">
      <style>{CSS}</style>
      <AuthTopBar backLabel="← Accueil" />
      <div className="vp-card">
        <div className="vp-icon">✉</div>
        <h1 className="vp-title">{t.title}</h1>
        <p className="vp-body">
          {t.body}{" "}
          {email ? <span className="vp-email">{email}</span> : null}
        </p>
        <p className="vp-body" style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
          {t.hint}
        </p>
        <div className="vp-actions">
          <Link to="/login" className="vp-btn vp-btn-primary">
            {t.login}
          </Link>
          {email ? (
            <button
              type="button"
              className="vp-btn vp-btn-outline"
              onClick={handleResend}
              disabled={resendLoading}
            >
              {resendLoading ? t.resending : t.resend}
            </button>
          ) : null}
        </div>
        {resendMsg ? (
          <p className={`vp-msg ${resendMsg === t.resendOk ? "ok" : "err"}`} role="status">
            {resendMsg}
          </p>
        ) : null}
      </div>
    </div>
  );
}
