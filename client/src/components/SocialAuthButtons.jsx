import { useEffect, useState } from "react";
import {
  exchangeAppleToken,
  exchangeGoogleToken,
  getOAuthConfig,
  oauthRedirectUrl,
} from "../api/auth";

const APPLE_SCRIPT_ID = "apple-auth-js";

function loadAppleScript() {
  if (document.getElementById(APPLE_SCRIPT_ID)) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = APPLE_SCRIPT_ID;
    script.src =
      "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Apple Sign In failed to load"));
    document.head.appendChild(script);
  });
}

export default function SocialAuthButtons({
  copy,
  role = "customer",
  returnPath = "/login",
  onSuccess,
  onError,
  disabled = false,
}) {
  const [config, setConfig] = useState(null);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    getOAuthConfig()
      .then((res) => setConfig(res.data))
      .catch(() => setConfig({ google: { enabled: false }, facebook: { enabled: false }, apple: { enabled: false } }));
  }, []);

  const returnUrl = `${window.location.origin}${returnPath}`;

  function startRedirect(provider) {
    if (disabled || busy) return;
    setBusy(provider);
    window.location.href = oauthRedirectUrl(provider, { returnUrl, role });
  }

  async function signInWithApple() {
    if (disabled || busy || !config?.apple?.enabled) return;
    setBusy("apple");
    try {
      await loadAppleScript();
      const clientId = config.apple.clientId;
      if (!clientId || !window.AppleID) {
        throw new Error(copy.socialNotConfigured || "Apple Sign In is not configured");
      }

      window.AppleID.auth.init({
        clientId,
        scope: "name email",
        redirectURI: returnUrl,
        usePopup: true,
      });

      const response = await window.AppleID.auth.signIn();
      const idToken = response?.authorization?.id_token;
      if (!idToken) throw new Error(copy.socialFailed || "Apple Sign In failed");

      const fullName = response?.user?.name;
      const name = fullName
        ? [fullName.givenName, fullName.familyName].filter(Boolean).join(" ")
        : undefined;

      const res = await exchangeAppleToken(idToken, {
        email: response?.user?.email,
        name,
        role,
      });
      onSuccess?.(res.data);
    } catch (err) {
      const cancelled =
        err?.error === "popup_closed_by_user" ||
        /cancel/i.test(err?.message || "");
      if (!cancelled) {
        onError?.(
          err?.response?.data?.message ||
            err?.message ||
            copy.socialFailed ||
            "Social sign-in failed"
        );
      }
    } finally {
      setBusy(null);
    }
  }

  async function signInWithGoogleToken(idToken) {
    const res = await exchangeGoogleToken(idToken, role);
    onSuccess?.(res.data);
  }

  const googleEnabled = config?.google?.enabled;
  const facebookEnabled = config?.facebook?.enabled;
  const appleEnabled = config?.apple?.enabled;

  if (!googleEnabled && !facebookEnabled && !appleEnabled) {
    return null;
  }

  return (
    <div className="gv-social-auth">
      <style>{`
        .gv-social-auth { margin-bottom: 18px; }
        .gv-social-divider {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 14px; color: var(--mut, #53608f);
          font-family: var(--mono, monospace); font-size: 10px;
          letter-spacing: 0.08em; text-transform: uppercase;
        }
        .gv-social-divider::before,
        .gv-social-divider::after {
          content: ""; flex: 1; height: 1px;
          background: rgba(255,255,255,0.08);
        }
        .gv-social-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
        }
        .gv-social-btn {
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: var(--txt, #e8e8f0);
          border-radius: 12px;
          padding: 11px 8px;
          font-family: var(--sans, Outfit, sans-serif);
          font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.18s ease;
        }
        .gv-social-btn:hover:not(:disabled) {
          border-color: rgba(124,107,255,0.45);
          background: rgba(124,107,255,0.1);
        }
        .gv-social-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        @media (max-width: 480px) {
          .gv-social-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="gv-social-divider">
        <span>{copy.socialDivider || "or continue with"}</span>
      </div>

      <div className="gv-social-grid">
        {googleEnabled ? (
          <button
            type="button"
            className="gv-social-btn gv-social-google"
            disabled={disabled || !!busy}
            onClick={() => startRedirect("google")}
          >
            {busy === "google" ? "…" : copy.google || "Google"}
          </button>
        ) : null}

        {facebookEnabled ? (
          <button
            type="button"
            className="gv-social-btn gv-social-facebook"
            disabled={disabled || !!busy}
            onClick={() => startRedirect("facebook")}
          >
            {busy === "facebook" ? "…" : copy.facebook || "Facebook"}
          </button>
        ) : null}

        {appleEnabled ? (
          <button
            type="button"
            className="gv-social-btn gv-social-apple"
            disabled={disabled || !!busy}
            onClick={signInWithApple}
          >
            {busy === "apple" ? "…" : copy.apple || "Apple"}
          </button>
        ) : null}
      </div>

      {/* Optional GIS one-tap if web client id is exposed */}
      {googleEnabled && config?.google?.webClientId ? (
        <GoogleOneTap
          clientId={config.google.webClientId}
          disabled={disabled || !!busy}
          onCredential={async (credential) => {
            setBusy("google");
            try {
              await signInWithGoogleToken(credential);
            } catch (err) {
              onError?.(
                err?.response?.data?.message ||
                  err?.message ||
                  copy.socialFailed ||
                  "Google sign-in failed"
              );
            } finally {
              setBusy(null);
            }
          }}
        />
      ) : null}
    </div>
  );
}

function GoogleOneTap({ clientId, onCredential, disabled }) {
  useEffect(() => {
    if (disabled || !clientId) return;

    const scriptId = "google-gsi";
    const renderButton = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response?.credential) onCredential(response.credential);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    };

    if (document.getElementById(scriptId)) {
      renderButton();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderButton;
    document.head.appendChild(script);
  }, [clientId, disabled, onCredential]);

  return null;
}
