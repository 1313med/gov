import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  getSiteUrl,
  getStaticSeoForPath,
  isNoIndexPath,
  SITE_NAME,
  DEFAULT_LOCALE,
} from "../seo/publicSeo";

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Sets document title, meta description, Open Graph, canonical, and robots.
 * Pass `override` on listing/detail pages for dynamic French titles.
 */
export default function SeoHead({ override = null }) {
  const { pathname } = useLocation();
  const siteUrl = getSiteUrl();
  const noindex = isNoIndexPath(pathname);
  const staticSeo = getStaticSeoForPath(pathname);

  const title = override?.title || staticSeo?.title || `${SITE_NAME} — Auto au Maroc`;
  const description =
    override?.description ||
    staticSeo?.description ||
    "Location de voiture et marketplace automobile au Maroc.";
  const canonical = override?.canonical || `${siteUrl}${pathname.split("?")[0]}`;
  const ogImage = override?.image || `${siteUrl}/vite.svg`;

  useEffect(() => {
    document.documentElement.lang = "fr";

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    upsertMeta("property", "og:locale", DEFAULT_LOCALE);
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", override?.type || "website");
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:image", ogImage);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertLink("canonical", noindex ? undefined : canonical);
  }, [title, description, canonical, ogImage, noindex, override?.type]);

  return null;
}
