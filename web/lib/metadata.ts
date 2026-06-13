import type { Metadata } from "next";
import { SITE_URL } from "./site";
import type { SeoLang } from "./site";

import { buildSeoPath, getAlternateUrls, HREFLANG_MAP } from "@client-seo/seoPaths";

type MetaInput = {
  lang: SeoLang;
  basePath: string;
  title: string;
  description: string;
  keywords?: string;
  robots?: string;
};

export function buildPageMetadata({
  lang,
  basePath,
  title,
  description,
  keywords,
  robots = "index, follow",
}: MetaInput): Metadata {
  const canonical = `${SITE_URL}${buildSeoPath(lang, basePath)}`;
  const alternates = getAlternateUrls(SITE_URL, buildSeoPath(lang, basePath));

  return {
    title,
    description,
    keywords,
    robots,
    alternates: {
      canonical,
      languages: Object.fromEntries([
        ...alternates.map((a: { lang: string; href: string }) => [a.lang, a.href]),
        ["x-default", `${SITE_URL}${buildSeoPath("fr", basePath)}`],
      ]),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Goovoiture",
      locale: HREFLANG_MAP[lang]?.replace("-", "_") || "fr_MA",
      type: "website",
    },
  };
}

export function langDir(lang: SeoLang) {
  return lang === "ar" ? "rtl" : "ltr";
}

export function langHtml(lang: SeoLang) {
  return lang === "ar" ? "ar" : lang === "en" ? "en" : "fr";
}

/** Prefix for Next.js routes: fr = '', en = '/en', ar = '/ar' */
export function langPrefix(lang: SeoLang) {
  return lang === "fr" ? "" : `/${lang}`;
}

export function parseLangFromPrefix(prefix: string): SeoLang {
  if (prefix === "en") return "en";
  if (prefix === "ar") return "ar";
  return "fr";
}
