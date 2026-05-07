/**
 * CORS / Socket.IO origin rules.
 * Browsers send a strict Origin; React Native often omits it or sends "null".
 * Expo Metro may send http://localhost:<port> which is not in CLIENT_URL.
 */
function loadAllowedOrigins() {
  return (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

function isOriginAllowed(origin, allowedOrigins) {
  if (!origin || origin === "null") return true;
  if (allowedOrigins.includes(origin)) return true;
  if (process.env.NODE_ENV === "production") return false;
  try {
    const { hostname } = new URL(origin);
    if (hostname === "localhost" || hostname === "127.0.0.1") return true;
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
    if (/^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  } catch {
    return false;
  }
  return false;
}

module.exports = { loadAllowedOrigins, isOriginAllowed };
