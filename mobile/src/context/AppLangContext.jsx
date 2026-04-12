import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { appLocales } from "../locales/appLocales";

const STORAGE_KEY = "goovoiture-lang";
const AppLangContext = createContext(null);

export function AppLangProvider({ children }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY).then((saved) => {
      if (saved === "en" || saved === "fr") setLangState(saved);
    });
  }, []);

  const setLang = useCallback(async (next) => {
    if (next === "en" || next === "fr") {
      setLangState(next);
      await SecureStore.setItemAsync(STORAGE_KEY, next);
    }
  }, []);

  const copy = useMemo(() => appLocales[lang] || appLocales.en, [lang]);
  const value = useMemo(() => ({ lang, setLang, copy }), [lang, setLang, copy]);

  return (
    <AppLangContext.Provider value={value}>{children}</AppLangContext.Provider>
  );
}

export function useAppLang() {
  const ctx = useContext(AppLangContext);
  if (!ctx) throw new Error("useAppLang must be used within AppLangProvider");
  return ctx;
}
