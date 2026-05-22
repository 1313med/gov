import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loadAuth } from "../utils/authStorage";
import {
  getUserRoles,
  normalizeRoleSlug,
  shellPathForMode,
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
  if (isStaffUser(user)) return "rental_owner";
  return "customer";
}

function resolveStoredMode(saved, userRoles, user) {
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
  const [auth, setAuth] = useState(() => loadAuth());
  const [activeMode, setActiveModeState] = useState("customer");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setAuth(loadAuth());
    window.addEventListener("storage", sync);
    window.addEventListener("goovoiture-auth", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("goovoiture-auth", sync);
    };
  }, []);

  const roles = useMemo(() => getUserRoles(auth), [auth]);

  useEffect(() => {
    if (!auth?._id) {
      setActiveModeState("customer");
      setReady(true);
      return;
    }
    const key = `${STORAGE_KEY}:${auth._id}`;
    const saved = localStorage.getItem(key);
    const userRoles = getUserRoles(auth);
    setActiveModeState(resolveStoredMode(saved, userRoles, auth));
    setReady(true);
  }, [auth?._id, auth?.roles, auth?.role, auth?.staffForOwnerId]);

  const setActiveMode = useCallback(
    async (mode) => {
      const next = normalizeRoleSlug(mode);
      const userRoles = getUserRoles(auth);
      if (next === "admin" && !isAdminOnlyUser(auth)) return;
      if (!userRoles.includes(next) && !(next === "rental_owner" && isStaffUser(auth))) return;
      setActiveModeState(next);
      if (auth?._id) {
        localStorage.setItem(`${STORAGE_KEY}:${auth._id}`, next);
      }
    },
    [auth]
  );

  const refreshAuth = useCallback((user) => {
    setAuth(user || loadAuth());
    window.dispatchEvent(new Event("goovoiture-auth"));
  }, []);

  const shellPath = useMemo(() => shellPathForMode(activeMode), [activeMode]);

  const value = useMemo(
    () => ({
      auth,
      activeMode,
      roles,
      ready,
      shellPath,
      setActiveMode,
      refreshAuth,
      canAccess: (mode) => {
        const m = normalizeRoleSlug(mode);
        if (m === "admin") return isAdminOnlyUser(auth);
        if (m === "rental_owner") return isRentalOwnerUser(auth) || isStaffUser(auth);
        return roles.includes(m);
      },
    }),
    [auth, activeMode, roles, ready, shellPath, setActiveMode, refreshAuth]
  );

  return <ActiveModeContext.Provider value={value}>{children}</ActiveModeContext.Provider>;
}

export function useActiveMode() {
  const ctx = useContext(ActiveModeContext);
  if (!ctx) throw new Error("useActiveMode must be used within ActiveModeProvider");
  return ctx;
}
