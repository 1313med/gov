import { useLocation, useNavigate } from "react-router-dom";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { appLocales } from "../locales/appLocales";
import { buildSeoPath, parseSeoPath, isPublicSeoPath } from "../seo/seoPaths";

export const STORAGE_KEY = "goovoiture-home-lang";

const AppLangContext = createContext(null);

function detectBrowserLang() {
  if (typeof navigator === "undefined") return "fr";
  const raw = (navigator.language || "").toLowerCase();
  if (raw.startsWith("ar")) return "ar";
  if (raw.startsWith("fr")) return "fr";
  return "en";
}

export function AppLangProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [lang, setLangState] = useState(() => {
    const fromPath = parseSeoPath(location.pathname).lang;
    if (fromPath) return fromPath;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "fr" || saved === "ar") return saved;
    } catch {
      /* ignore */
    }
    return detectBrowserLang();
  });

  useEffect(() => {
    const { lang: pathLang } = parseSeoPath(location.pathname);
    if (pathLang && pathLang !== lang) {
      setLangState(pathLang);
    }
  }, [location.pathname]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang === "ar" ? "ar" : lang === "fr" ? "fr" : "en";
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  }, [lang]);

  const setLang = useCallback(
    (next) => {
      if (next !== "en" && next !== "fr" && next !== "ar") return;
      setLangState(next);
      const { basePath } = parseSeoPath(location.pathname);
      if (isPublicSeoPath(location.pathname)) {
        navigate(buildSeoPath(next, basePath));
      }
    },
    [location.pathname, navigate]
  );

  const copy = useMemo(() => appLocales[lang] || appLocales.fr, [lang]);

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
