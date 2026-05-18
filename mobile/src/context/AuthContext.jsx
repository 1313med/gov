import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { clearAuth, loadAuth, saveAuth } from "../utils/authStorage";
import { getUserRoles, getPrimaryRole, isAdminOnlyUser } from "../utils/userRoles";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuth().then((data) => {
      if (!data) {
        setAuth(null);
        setLoading(false);
        return;
      }
      const roles =
        Array.isArray(data.roles) && data.roles.length ? data.roles : getUserRoles(data);
      setAuth({
        ...data,
        roles,
        role: getPrimaryRole({ ...data, roles }),
      });
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (data, options = {}) => {
    const remember = options?.remember !== false;
    const roles = Array.isArray(data?.roles) && data.roles.length ? data.roles : getUserRoles(data);
    const enriched = {
      ...data,
      roles,
      role: getPrimaryRole({ ...data, roles }),
    };
    if (enriched._id) {
      const modeKey = `goovoiture-active-mode:${enriched._id}`;
      if (roles.includes("car_owner")) {
        await AsyncStorage.setItem(modeKey, "car_owner");
      } else if (roles.includes("rental_owner")) {
        await AsyncStorage.setItem(modeKey, "rental_owner");
      } else if (isAdminOnlyUser({ roles })) {
        await AsyncStorage.setItem(modeKey, "admin");
      } else {
        await AsyncStorage.setItem(modeKey, "customer");
        await AsyncStorage.setItem(`goovoiture-customer-explore:${enriched._id}`, "rent");
      }
    }
    if (remember) await saveAuth(enriched);
    else await clearAuth();
    setAuth(enriched);
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
