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
    return "Can't reach the server. Start the API, set mobile/src/config to your PC's Wi‑Fi IP, and use the same network.";
  }
  return fallback;
}
