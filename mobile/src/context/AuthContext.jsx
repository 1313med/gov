import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { clearAuth, loadAuth, saveAuth } from "../utils/authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuth().then((data) => {
      setAuth(data);
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (data, options = {}) => {
    const remember = options?.remember !== false;
    if (remember) await saveAuth(data);
    else await clearAuth();
    setAuth(data);
  }, []);

  const logout = useCallback(async () => {
    await clearAuth();
    setAuth(null);
  }, []);

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
