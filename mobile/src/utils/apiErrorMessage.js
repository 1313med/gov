/** Map axios / network failures to a user-visible string. */
export function getApiErrorMessage(error, fallback) {
  const serverMsg = error?.response?.data?.message;
  if (serverMsg) return serverMsg;
  const m = (error?.message || "").toLowerCase();
  if (
    m.includes("network") ||
    m.includes("timeout") ||
    m.includes("econnrefused") ||
    m === "network error"
  ) {
    return "Can't reach the server. On your PC: start the API, run ipconfig for your new Wi‑Fi IPv4, set EXPO_PUBLIC_DEV_API_URL in mobile/.env (or mobile/src/config), restart Expo. Phone and PC must use the same Wi‑Fi.";
  }
  return fallback;
}
