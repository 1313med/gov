import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { appLocales } from "../locales/appLocales";

export const STORAGE_KEY = "goovoiture-home-lang";

const AppLangContext = createContext(null);

function detectBrowserLang() {
  if (typeof navigator === "undefined") return "en";
  const raw = (navigator.language || "").toLowerCase();
  return raw.startsWith("fr") ? "fr" : "en";
}

export function AppLangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "fr") return saved;
    } catch {
      /* ignore */
    }
    return detectBrowserLang();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang === "fr" ? "fr" : "en";
    }
  }, [lang]);

  const setLang = useCallback((next) => {
    if (next === "en" || next === "fr") setLangState(next);
  }, []);

  const copy = useMemo(() => appLocales[lang] || appLocales.en, [lang]);

  const value = useMemo(
    () => ({ lang, setLang, copy }),
    [lang, setLang, copy]
  );

  return (
    <AppLangContext.Provider value={value}>{children}</AppLangContext.Provider>
  );
}

export function useAppLang() {
  const ctx = useContext(AppLangContext);
  if (!ctx) {
    throw new Error("useAppLang must be used within AppLangProvider");
  }
  return ctx;
}

/** @deprecated use useAppLang */
export const useHomeLang = useAppLang;

/** @deprecated use AppLangProvider */
export const HomeLangProvider = AppLangProvider;
