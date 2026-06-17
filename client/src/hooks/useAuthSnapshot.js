import { useEffect, useState } from "react";
import { loadAuth } from "../utils/authStorage";

/** Reactive auth snapshot for header/nav — updates after login/logout in the same tab. */
export function useAuthSnapshot() {
  const [auth, setAuth] = useState(() => loadAuth());

  useEffect(() => {
    const sync = () => setAuth(loadAuth());
    window.addEventListener("goovoiture-auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("goovoiture-auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return auth;
}
