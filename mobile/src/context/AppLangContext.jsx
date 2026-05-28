import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { appLocales } from "../locales/appLocales";
import { arOverrides } from "../locales/arOverrides";
import { localeArMap } from "../locales/localeArMap";

/** Locale tree strings + manual overrides (overrides win on conflict). */
const fullArOverrides = { ...localeArMap, ...arOverrides };
import {
  normalizeLang,
  pickLang,
  SUPPORTED_LANGS,
  numberLocaleTag,
  dateLocaleTag,
  formatNumber as fmtNumber,
  formatDate as fmtDate,
} from "../utils/i18n";

const STORAGE_KEY = "goovoiture-lang";
const AppLangContext = createContext(null);

export function AppLangProvider({ children }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY).then((saved) => {
      setLangState(normalizeLang(saved));
    });
  }, []);

  const setLang = useCallback(async (next) => {
    const code = normalizeLang(next);
    if (!SUPPORTED_LANGS.includes(code)) return;
    setLangState(code);
    await SecureStore.setItemAsync(STORAGE_KEY, code);
  }, []);

  const pick = useCallback(
    (en, fr, ar) => pickLang(lang, en, fr, ar, fullArOverrides),
    [lang]
  );

  const pickEnFr = useCallback((en, fr) => (lang === "fr" ? fr : en), [lang]);

  const formatNumber = useCallback((value, options) => fmtNumber(value, lang, options), [lang]);

  const formatDate = useCallback((value, options) => fmtDate(value, lang, options), [lang]);

  const copy = useMemo(() => appLocales[lang] || appLocales.en, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      copy,
      pick,
      pickEnFr,
      formatNumber,
      formatDate,
      numberLocale: numberLocaleTag(lang),
      dateLocale: dateLocaleTag(lang),
      isFr: lang === "fr",
      isAr: lang === "ar",
      isEn: lang === "en",
    }),
    [lang, setLang, copy, pick, pickEnFr, formatNumber, formatDate]
  );

  return <AppLangContext.Provider value={value}>{children}</AppLangContext.Provider>;
}

export function useAppLang() {
  const ctx = useContext(AppLangContext);
  if (!ctx) throw new Error("useAppLang must be used within AppLangProvider");
  return ctx;
}
