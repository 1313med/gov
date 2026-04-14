import { useState } from "react";
import { clearAuth, loadAuth, saveAuth } from "../utils/authStorage";
import { api } from "../api/axios";

export function useAuth() {
  const [auth, setAuth] = useState(() => loadAuth());

  function login(data) {
    // data comes from server: { _id, name, role, token }
    // saveAuth strips the token before persisting (stored in httpOnly cookie)
    saveAuth(data);
    setAuth(loadAuth()); // load back what was actually saved (no token)
  }

  async function logout() {
    try {
      // Ask server to clear the httpOnly cookie
      await api.post("/auth/logout");
    } catch {
      // Even if the request fails, clear local state
    }
    clearAuth();
    setAuth(null);
  }

  return { auth, login, logout };
}
