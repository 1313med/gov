import { useState } from "react";
import { clearAuth, loadAuth, saveAuth } from "../utils/authStorage";

export function useAuthState() {
  const [auth, setAuth] = useState(() => loadAuth());

  function login(data) {
    saveAuth(data);
    setAuth(data);
  }

  function logout() {
    clearAuth();
    setAuth(null);
  }

  return { auth, login, logout };
}
