import { appLocales } from "./appLocales";

/** Flatten parallel en/fr/ar locale trees into EN/FR key → Arabic value map. */
function flattenStrings(enObj, frObj, arObj, out = {}) {
  if (!enObj || !arObj) return out;
  for (const key of Object.keys(enObj)) {
    const en = enObj[key];
    const fr = frObj?.[key];
    const ar = arObj[key];
    if (typeof en === "string" && typeof ar === "string") {
      out[en] = ar;
      if (typeof fr === "string") out[fr] = ar;
    } else if (en && typeof en === "object" && !Array.isArray(en)) {
      flattenStrings(en, fr, ar, out);
    }
  }
  return out;
}

export const localeArMap = flattenStrings(appLocales.en, appLocales.fr, appLocales.ar);
