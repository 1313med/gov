const KEY = "goovoiture_auth";

export function saveAuth(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function loadAuth() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}
