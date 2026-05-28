export const SUPPORTED_LANGS = ["en", "fr", "ar"];

export const LANG_LABELS = {
  en: "English",
  fr: "Français",
  ar: "العربية",
};

export const LANG_SHORT = {
  en: "EN",
  fr: "FR",
  ar: "AR",
};

/** Next language in EN → FR → Arabic cycle (for compact toggles). */
export function cycleLang(current) {
  if (current === "en") return "fr";
  if (current === "fr") return "ar";
  return "en";
}

export function normalizeLang(value) {
  const v = String(value || "en").toLowerCase();
  if (v === "dar") return "ar";
  return SUPPORTED_LANGS.includes(v) ? v : "en";
}

/**
 * Pick localized string: en / fr / ar.
 * If ar is omitted, optional `arMap` can translate from FR/EN keys.
 */
export function pickLang(lang, en, fr, ar, arMap) {
  const code = normalizeLang(lang);
  if (code === "ar") {
    if (ar != null && ar !== "") return ar;
    const enKey = en != null ? String(en).trim() : "";
    const frKey = fr != null ? String(fr).trim() : "";
    if (arMap && frKey && arMap[frKey]) return arMap[frKey];
    if (arMap && enKey && arMap[enKey]) return arMap[enKey];
    return ar ?? "";
  }
  if (code === "fr") return fr ?? en ?? "";
  return en ?? fr ?? "";
}

/**
 * Western digits (0–9) for prices, km, etc.
 * App UI may be Arabic; numbers never use Arabic-Indic numerals.
 */
export function numberLocaleTag(lang) {
  return normalizeLang(lang) === "fr" ? "fr-FR" : "en-US";
}

/**
 * Date labels in English or French format only (never ar-* locale).
 */
export function dateLocaleTag(lang) {
  return normalizeLang(lang) === "fr" ? "fr-FR" : "en-GB";
}

/** @deprecated Prefer dateLocaleTag */
export function localeTag(lang) {
  return dateLocaleTag(lang);
}

export function formatNumber(value, lang, options) {
  const n = Number(value);
  if (Number.isNaN(n)) return String(value ?? "");
  return n.toLocaleString(numberLocaleTag(lang), options);
}

export function formatDate(value, lang, options) {
  if (value == null || value === "") return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(dateLocaleTag(lang), options);
}
