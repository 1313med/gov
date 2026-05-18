import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { clearAuth, loadAuth, saveAuth } from "../utils/authStorage";
import { getUserRoles, getPrimaryRole, isAdminOnlyUser, isRentalOwnerUser, isCarOwnerUser } from "../utils/userRoles";
import { getMyProfile } from "../api/user";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await loadAuth();
      if (!stored) {
        setAuth(null);
        setLoading(false);
        return;
      }

      let snapshot = { ...stored };
      try {
        const { data: profile } = await getMyProfile();
        if (profile?._id) {
          snapshot = { ...snapshot, ...profile };
        }
      } catch {
        /* use stored session if profile fetch fails */
      }

      const roles =
        Array.isArray(snapshot.roles) && snapshot.roles.length
          ? snapshot.roles
          : getUserRoles(snapshot);
      const enriched = {
        ...snapshot,
        roles,
        role: getPrimaryRole({ ...snapshot, roles }),
      };

      if (enriched._id) {
        const modeKey = `goovoiture-active-mode:${enriched._id}`;
        if (isCarOwnerUser(enriched)) {
          await AsyncStorage.setItem(modeKey, "car_owner");
        } else if (isRentalOwnerUser(enriched)) {
          const saved = await AsyncStorage.getItem(modeKey);
          if (!saved || saved === "admin" || saved === "customer") {
            await AsyncStorage.setItem(modeKey, "rental_owner");
          }
        }
      }

      setAuth(enriched);
      setLoading(false);
    })();
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
