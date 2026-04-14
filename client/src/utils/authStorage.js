/**
 * authStorage — stores only non-sensitive user info in localStorage.
 * The JWT lives exclusively in an httpOnly cookie set by the server.
 * We deliberately omit `token` from persisted data (XSS protection).
 */
const KEY = "goovoiture_auth";

export function saveAuth({ _id, name, role, phone, city, avatar }) {
  // Accept the full server response but strip the token before persisting
  localStorage.setItem(KEY, JSON.stringify({ _id, name, role, phone, city, avatar }));
}

export function loadAuth() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}
