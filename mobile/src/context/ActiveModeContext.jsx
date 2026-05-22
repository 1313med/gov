import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import {
  getUserRoles,
  normalizeRoleSlug,
  shellForMode,
  isAdminOnlyUser,
  isCarOwnerUser,
  isRentalOwnerUser,
  isStaffUser,
} from "../utils/userRoles";

const STORAGE_KEY = "goovoiture-active-mode";

const ActiveModeContext = createContext(null);

function pickDefaultMode(roles, user) {
  if (roles.includes("car_owner")) return "car_owner";
  if (roles.includes("rental_owner")) return "rental_owner";
  if (roles.includes("admin")) return "admin";
  if (isStaffUser(user)) return "rental_owner"; // staff uses owner shell
  return "customer";
}

function resolveStoredMode(saved, userRoles, user) {
  // Staff always lands in rental_owner mode
  if (isStaffUser(user)) return "rental_owner";

  const normalized = normalizeRoleSlug(saved);

  if (userRoles.includes("car_owner")) {
    if (!saved || normalized === "customer" || normalized === "admin") {
      return "car_owner";
    }
  }

  if (userRoles.includes("rental_owner") && !userRoles.includes("car_owner")) {
    if (!saved || normalized === "customer" || normalized === "admin") {
      return "rental_owner";
    }
  }

  if (!saved || !userRoles.includes(normalized)) {
    return pickDefaultMode(userRoles, user);
  }

  if (normalized === "admin" && !isAdminOnlyUser({ roles: userRoles })) {
    return pickDefaultMode(userRoles, user);
  }

  return normalized;
}

export function ActiveModeProvider({ children }) {
  const { auth } = useAuth();
  const [activeMode, setActiveModeState] = useState("customer");
  const [ready, setReady] = useState(false);

  const roles = useMemo(() => getUserRoles(auth), [auth]);

  useEffect(() => {
    if (!auth?._id) {
      setActiveModeState("customer");
      setReady(true);
      return;
    }
    const key = `${STORAGE_KEY}:${auth._id}`;
    AsyncStorage.getItem(key).then((saved) => {
      const userRoles = getUserRoles(auth);
      setActiveModeState(resolveStoredMode(saved, userRoles, auth));
      setReady(true);
    });
  }, [auth?._id, auth?.roles, auth?.role]);

  const setActiveMode = useCallback(
    async (mode) => {
      const next = normalizeRoleSlug(mode);
      const userRoles = getUserRoles(auth);
      if (next === "admin" && !isAdminOnlyUser(auth)) return;
      if (!userRoles.includes(next)) return;
      setActiveModeState(next);
      if (auth?._id) {
        await AsyncStorage.setItem(`${STORAGE_KEY}:${auth._id}`, next);
      }
    },
    [auth]
  );

  const ensureCarOwnerLanding = useCallback(async () => {
    if (!isCarOwnerUser(auth) || !auth?._id) return;
    await AsyncStorage.setItem(`${STORAGE_KEY}:${auth._id}`, "car_owner");
    setActiveModeState("car_owner");
  }, [auth]);

  const ensureRentalOwnerLanding = useCallback(async () => {
    if (!isRentalOwnerUser(auth) || !auth?._id) return;
    await AsyncStorage.setItem(`${STORAGE_KEY}:${auth._id}`, "rental_owner");
    setActiveModeState("rental_owner");
  }, [auth]);

  const shellHref = useMemo(() => shellForMode(activeMode), [activeMode]);

  const value = useMemo(
    () => ({
      activeMode,
      roles,
      ready,
      shellHref,
      setActiveMode,
      ensureCarOwnerLanding,
      ensureRentalOwnerLanding,
      canAccess: (mode) => {
        const m = normalizeRoleSlug(mode);
        if (m === "admin") return isAdminOnlyUser(auth);
        return roles.includes(m);
      },
    }),
    [activeMode, roles, ready, shellHref, setActiveMode, ensureCarOwnerLanding, ensureRentalOwnerLanding, auth]
  );

  return <ActiveModeContext.Provider value={value}>{children}</ActiveModeContext.Provider>;
}

export function useActiveMode() {
  const ctx = useContext(ActiveModeContext);
  if (!ctx) throw new Error("useActiveMode must be used within ActiveModeProvider");
  return ctx;
}
