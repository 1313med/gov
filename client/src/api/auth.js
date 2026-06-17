import { api } from "./axios";

export const getOAuthConfig = () => api.get("/auth/oauth/config");

export const exchangeGoogleToken = (idToken, role) =>
  api.post("/auth/oauth/google", { idToken, role });

export const exchangeFacebookToken = (accessToken, role) =>
  api.post("/auth/oauth/facebook", { accessToken, role });

export const exchangeAppleToken = (identityToken, extras = {}) =>
  api.post("/auth/oauth/apple", {
    identityToken,
    email: extras.email,
    name: extras.name,
    role: extras.role,
  });

export function oauthRedirectUrl(provider, { returnUrl, role } = {}) {
  const apiRoot = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(
    /\/api\/?$/,
    ""
  );
  const params = new URLSearchParams();
  if (returnUrl) params.set("returnUrl", returnUrl);
  if (role) params.set("role", role);
  const qs = params.toString();
  return `${apiRoot}/api/auth/oauth/${provider}/start${qs ? `?${qs}` : ""}`;
}
