import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/* ─────────────────────────────────────────────────────────────
   Global Theme Context
   - Single source of truth for the dark/light theme
   - Persists choice in localStorage under "goo-theme"
   - Mirrors the value to legacy keys so older page-level
     listeners keep working without code changes:
       cars-theme, rentals-theme, home2-theme, rental-details-theme
   - Toggles `dark` class on <html> (Tailwind class strategy)
   - Sets data-theme attribute on <html> for plain CSS
   - Dispatches a "goovoiture-theme" event for any component
     that still listens to the legacy event
   - Reacts to OS preference and cross-tab storage updates
───────────────────────────────────────────────────────────── */

export const THEME_STORAGE_KEY = "goo-theme";

const LEGACY_KEYS = [
  "goo-theme",
  "cars-theme",
  "rentals-theme",
  "home2-theme",
  "rental-details-theme",
];

const ThemeContext = createContext(null);

function readInitialTheme() {
  if (typeof window === "undefined") return false;
  try {
    for (const key of LEGACY_KEYS) {
      const v = localStorage.getItem(key);
      if (v === "dark") return true;
      if (v === "light") return false;
    }
  } catch {
    /* ignore storage errors (private mode, etc.) */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}

function applyThemeToDocument(dark) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.classList.toggle("light", !dark);
  root.setAttribute("data-theme", dark ? "dark" : "light");
  root.style.colorScheme = dark ? "dark" : "light";
}

function persistTheme(dark) {
  const value = dark ? "dark" : "light";
  try {
    for (const key of LEGACY_KEYS) {
      localStorage.setItem(key, value);
    }
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("goovoiture-theme"));
  }
}

export function ThemeProvider({ children }) {
  const [dark, setDarkState] = useState(readInitialTheme);

  useEffect(() => {
    applyThemeToDocument(dark);
    persistTheme(dark);
  }, [dark]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const onStorage = (e) => {
      if (!e.key) return;
      if (!LEGACY_KEYS.includes(e.key)) return;
      if (e.newValue === "dark" || e.newValue === "light") {
        setDarkState(e.newValue === "dark");
      }
    };
    window.addEventListener("storage", onStorage);

    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onMQ = (ev) => {
      const explicit = (() => {
        try {
          return localStorage.getItem(THEME_STORAGE_KEY);
        } catch {
          return null;
        }
      })();
      if (explicit !== "dark" && explicit !== "light") {
        setDarkState(!!ev.matches);
      }
    };
    mq?.addEventListener?.("change", onMQ);

    return () => {
      window.removeEventListener("storage", onStorage);
      mq?.removeEventListener?.("change", onMQ);
    };
  }, []);

  const setDark = useCallback((next) => {
    setDarkState((prev) =>
      typeof next === "function" ? !!next(prev) : !!next
    );
  }, []);

  const toggle = useCallback(() => setDarkState((d) => !d), []);

  const value = useMemo(
    () => ({ dark, setDark, toggle, theme: dark ? "dark" : "light" }),
    [dark, setDark, toggle]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
