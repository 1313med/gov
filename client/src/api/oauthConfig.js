import { api } from "./axios";

const CACHE_KEY = "goovoiture_oauth_config";
const CACHE_MS = 10 * 60 * 1000;

export const getOAuthConfig = () => api.get("/auth/oauth/config");

function envFallbackConfig() {
  const googleId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  const facebookId = import.meta.env.VITE_FACEBOOK_APP_ID || "";
  const appleId = import.meta.env.VITE_APPLE_CLIENT_ID || "";
  return {
    google: { enabled: !!googleId, webClientId: googleId || null },
    facebook: { enabled: !!facebookId, appId: facebookId || null },
    apple: { enabled: !!appleId, clientId: appleId || null },
  };
}

function readCachedConfig() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.data || Date.now() - parsed.at > CACHE_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCachedConfig(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* ignore quota errors */
  }
}

export async function loadOAuthConfig() {
  const cached = readCachedConfig();
  if (cached) return cached;

  const fallback = envFallbackConfig();
  let lastError;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const res = await getOAuthConfig();
      writeCachedConfig(res.data);
      return res.data;
    } catch (err) {
      lastError = err;
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
      }
    }
  }

  if (fallback.google.enabled || fallback.facebook.enabled || fallback.apple.enabled) {
    return fallback;
  }

  throw lastError || new Error("OAuth config unavailable");
}
