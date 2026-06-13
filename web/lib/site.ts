export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://goovoiture.ma").replace(/\/+$/, "");
export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://goovoiture-api.onrender.com/api").replace(/\/+$/, "");

export type SeoLang = "fr" | "en" | "ar";

export function getSiteUrl() {
  return SITE_URL;
}
