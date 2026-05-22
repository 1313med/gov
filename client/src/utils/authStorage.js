/**
 * authStorage — stores only non-sensitive user info in localStorage.
 * The JWT lives exclusively in an httpOnly cookie set by the server.
 */
const KEY = "goovoiture_auth";

const PERSIST_KEYS = [
  "_id", "name", "role", "roles", "phone", "city", "avatar",
  "staffForOwnerId", "staffPermissions",
];

function notifyAuthChange() {
  try {
    window.dispatchEvent(new Event("goovoiture-auth"));
  } catch {
    /* ignore */
  }
}

export function saveAuth(data) {
  const payload = {};
  for (const k of PERSIST_KEYS) {
    if (data[k] !== undefined) payload[k] = data[k];
  }
  localStorage.setItem(KEY, JSON.stringify(payload));
  notifyAuthChange();
}

export function loadAuth() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearAuth() {
  localStorage.removeItem(KEY);
  notifyAuthChange();
}
