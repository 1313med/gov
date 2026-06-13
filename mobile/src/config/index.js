// Dev: set EXPO_PUBLIC_DEV_API_URL in .env (copy from .env.example) so you don’t edit this file after every Wi‑Fi change.
// Windows: `ipconfig` → IPv4 of the adapter you use for Wi‑Fi. Phone and PC must be on the same network.
const DEV_FALLBACK = "http://192.168.1.37:5000";
const fromEnv =
  typeof process !== "undefined" && process.env?.EXPO_PUBLIC_DEV_API_URL
    ? String(process.env.EXPO_PUBLIC_DEV_API_URL).trim().replace(/\/+$/, "")
    : "";
const DEV_SERVER_URL = fromEnv || DEV_FALLBACK;
const PROD_SERVER_URL = "https://api.goovoiture.ma";

// Use HTTP only in development LAN testing; production must stay HTTPS.
export const SERVER_URL = __DEV__ ? DEV_SERVER_URL : PROD_SERVER_URL;
export const API_URL = `${SERVER_URL}/api`;

if (__DEV__) {
  console.log("[Goovoiture] API:", API_URL, fromEnv ? "(from .env)" : "(fallback — set EXPO_PUBLIC_DEV_API_URL in .env)");
}
