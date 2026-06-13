import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  getSiteUrl,
  getSeoForPath,
  isNoIndexPath,
  SITE_NAME,
} from "../seo/seoLocales";
import { getAlternateUrls, parseSeoPath, isPublicSeoPath, buildSeoPath } from "../seo/seoPaths";
import { mergeJsonLd, organizationJsonLd, webSiteJsonLd } from "../seo/jsonLd";

const OG_LOCALE = { fr: "fr_MA", en: "en_MA", ar: "ar_MA" };
const OG_ALT = { fr: ["en_MA", "ar_MA"], en: ["fr_MA", "ar_MA"], ar: ["fr_MA", "en_MA"] };

function upsertMeta(attr, key, content) {
  if (content == null || content === "") return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeMeta(attr, key) {
  document.querySelector(`meta[${attr}="${key}"]`)?.remove();
}

function upsertLink(rel, href, extra = {}) {
  if (!href) return;
  const selector = extra.hreflang
    ? `link[rel="${rel}"][hreflang="${extra.hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
  if (extra.hreflang) el.setAttribute("hreflang", extra.hreflang);
}

function clearHreflangLinks() {
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
}

function upsertJsonLd(data) {
  const id = "goovoiture-jsonld";
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * Sets document title, meta, hreflang, Open Graph, canonical, robots, JSON-LD.
 * Pass `override` on listing/detail pages for dynamic titles.
 */
export default function SeoHead({ override = null, jsonLdExtra = null }) {
  const { pathname } = useLocation();
  const siteUrl = getSiteUrl();
  const { lang } = parseSeoPath(pathname);
  const noindex = isNoIndexPath(pathname);
  const pageSeo = getSeoForPath(pathname);

  const title = override?.title || pageSeo?.title || `${SITE_NAME} — Auto au Maroc`;
  const description =
    override?.description ||
    pageSeo?.description ||
    "Location de voiture et marketplace automobile au Maroc.";
  const keywords = override?.keywords || pageSeo?.keywords || "";
  const canonical = override?.canonical || `${siteUrl}${pathname.split("?")[0]}`;
  const ogImage = override?.image || `${siteUrl}/og-default.svg`;
  const htmlLang = lang === "ar" ? "ar" : lang === "en" ? "en" : "fr";

  useEffect(() => {
    document.documentElement.lang = htmlLang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("name", "keywords", keywords);
    upsertMeta("name", "robots", override?.robots || (noindex ? "noindex, nofollow" : "index, follow"));
    upsertMeta("name", "geo.region", "MA");
    upsertMeta("name", "geo.placename", "Morocco");
    upsertMeta("name", "language", htmlLang);

    upsertMeta("property", "og:locale", OG_LOCALE[lang] || "fr_MA");
    OG_ALT[lang]?.forEach((loc) => upsertMeta("property", "og:locale:alternate", loc));
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", override?.type || "website");
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:image", ogImage);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", ogImage);

    if (noindex) {
      document.querySelector('link[rel="canonical"]')?.remove();
    } else {
      upsertLink("canonical", canonical);
    }

    clearHreflangLinks();
    if (!noindex && isPublicSeoPath(pathname)) {
      const alternates = getAlternateUrls(siteUrl, pathname);
      alternates.forEach(({ lang: hreflang, href }) => {
        upsertLink("alternate", href, { hreflang });
      });
      upsertLink("alternate", `${siteUrl}${buildSeoPath("fr", parseSeoPath(pathname).basePath)}`, {
        hreflang: "x-default",
      });
    }

    if (!noindex) {
      const graphs = mergeJsonLd(
        organizationJsonLd(siteUrl),
        pathname === "/" || parseSeoPath(pathname).basePath === "/"
          ? webSiteJsonLd(siteUrl)
          : null,
        jsonLdExtra
      );
      upsertJsonLd(graphs.length === 1 ? graphs[0] : { "@context": "https://schema.org", "@graph": graphs });
    } else {
      document.getElementById("goovoiture-jsonld")?.remove();
    }
  }, [title, description, keywords, canonical, ogImage, noindex, override?.type, override?.robots, jsonLdExtra, pathname, siteUrl, lang, htmlLang]);

  return null;
}
