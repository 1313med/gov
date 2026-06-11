import { SITE_NAME, DEFAULT_SITE_URL, getSiteUrl } from "./seoLocales";

export function organizationJsonLd(siteUrl = DEFAULT_SITE_URL) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: siteUrl,
    logo: `${siteUrl}/og-default.svg`,
    description:
      "Plateforme marocaine de location de voiture et marketplace automobile — car rental & used cars in Morocco.",
    areaServed: {
      "@type": "Country",
      name: "Morocco",
    },
    sameAs: [],
  };
}

export function webSiteJsonLd(siteUrl = DEFAULT_SITE_URL) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    inLanguage: ["fr-MA", "ar-MA", "en-MA"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/cars?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd({ name, description, image, price, currency = "MAD", url, city }) {
  const siteUrl = typeof window !== "undefined" ? getSiteUrl() : DEFAULT_SITE_URL;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: image ? (image.startsWith("http") ? image : `${siteUrl}${image}`) : `${siteUrl}/og-default.svg`,
    offers: {
      "@type": "Offer",
      price: String(price),
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
      url,
      areaServed: city || "Morocco",
    },
  };
}

export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function localBusinessJsonLd({ cityName, siteUrl, pageUrl }) {
  return {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    name: `${SITE_NAME} — ${cityName}`,
    url: pageUrl,
    areaServed: cityName,
    parentOrganization: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
    },
  };
}

export function mergeJsonLd(...graphs) {
  return graphs.filter(Boolean);
}
