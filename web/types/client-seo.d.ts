declare module "@client-seo/catalog/cities" {
  export const MOROCCO_CITIES: Array<{ slug: string; name: Record<string, string> }>;
  export function getCityBySlug(slug: string): { slug: string; name: Record<string, string> } | null;
  export function getCityName(city: { name: Record<string, string> }, lang: string): string;
  export function cityRentalPath(slug: string): string;
  export function citySalePath(slug: string): string;
}

declare module "@client-seo/catalog/categories" {
  export const RENTAL_CATEGORIES: Array<{ slug: string; name: Record<string, string>; filters?: Record<string, unknown> }>;
  export function getRentalCategoryBySlug(slug: string): unknown;
  export function getSaleCategoryBySlug(slug: string): unknown;
}

declare module "@client-seo/catalog/brands" {
  export const CAR_BRANDS: Array<{ slug: string; name: Record<string, string>; models: string[] }>;
  export function getBrandBySlug(slug: string): { slug: string; name: Record<string, string>; models: string[] } | null;
  export function getModelBySlugs(
    brandSlug: string,
    modelSlug: string
  ): { brand: { name: Record<string, string> }; modelSlug: string; displayName: string } | null;
  export function resolveCityFacetSlug(
    slug: string,
    intent: string
  ): { type: "brand" | "category"; data: { name?: Record<string, string>; filters?: Record<string, unknown> } } | null;
  export function brandPath(brandSlug: string): string;
  export function modelPath(brandSlug: string, modelSlug: string): string;
  export function cityBrandRentalPath(citySlug: string, brandSlug: string): string;
  export function cityBrandSalePath(citySlug: string, brandSlug: string): string;
}

declare module "@client-seo/catalog/airports" {
  export const MOROCCO_AIRPORTS: Array<{ slug: string; citySlug: string }>;
  export function getAirportBySlug(slug: string): { slug: string; citySlug: string } | null;
  export function getAirportName(airport: unknown, lang: string): string;
}

declare module "@client-seo/catalog/proPages" {
  export const PRO_PAGES: Array<{
    slug: string;
    title: Record<string, string>;
    description: Record<string, string>;
    keyword?: Record<string, string>;
    price: number | null;
  }>;
  export function getProPage(slug: string): {
    slug: string;
    title: Record<string, string>;
    description: Record<string, string>;
    keyword?: Record<string, string>;
    price: number | null;
  } | null;
  export function proPagePath(slug: string): string;
}

declare module "@client-seo/catalog/blogArticles" {
  export const BLOG_CLUSTERS: Array<{ slug: string; name: Record<string, string> }>;
  export const BLOG_ARTICLES: Array<{
    slug: string;
    cluster: string;
    title: Record<string, string>;
    description: Record<string, string>;
    keyword?: Record<string, string>;
    body: Record<string, string>;
  }>;
  export function getBlogArticle(slug: string): {
    slug: string;
    cluster: string;
    title: Record<string, string>;
    description: Record<string, string>;
    keyword?: Record<string, string>;
    body: Record<string, string>;
  } | null;
  export function blogArticlePath(slug: string): string;
  export function blogClusterPath(clusterSlug: string): string;
}

declare module "@client-seo/programmaticSeo" {
  export type SeoPage = {
    title: string;
    description: string;
    h1: string;
    intro: string;
    keywords: string;
    path: string;
    lang?: string;
  };
  export function buildHubSeo(lang: string, intent: string): SeoPage | null;
  export function buildCityCategorySeo(lang: string, citySlug: string, categorySlug: string, intent?: string): SeoPage | null;
  export function buildCityBrandSeo(lang: string, citySlug: string, brandSlug: string, intent?: string): SeoPage | null;
  export function buildCityModelSeo(lang: string, citySlug: string, brandSlug: string, modelSlug: string, intent?: string): SeoPage | null;
  export function buildAirportSeo(lang: string, airportSlug: string, categorySlug?: string | null): SeoPage | null;
  export function buildBrandHubSeo(lang: string, brandSlug: string): Omit<SeoPage, "path"> | null;
  export function defaultFaqs(lang: string, context?: Record<string, unknown>): Array<{ q: string; a: string }>;
}

declare module "@client-seo/seoLocales" {
  export type SeoPage = {
    title: string;
    description: string;
    h1?: string;
    intro?: string;
    keywords?: string;
    path?: string;
  };
  export function getSeoForPath(path: string): SeoPage | null;
}

declare module "@client-seo/seoPaths" {
  export function buildSeoPath(lang: string, path: string): string;
  export function getAlternateUrls(siteUrl: string, path: string): Array<{ lang: string; href: string }>;
  export const HREFLANG_MAP: Record<string, string>;
}

declare module "@client-seo/jsonLd" {
  export function graphJsonLd(...graphs: unknown[]): object | null;
  export function collectionPageJsonLd(opts: Record<string, unknown>): object;
  export function faqPageJsonLd(faqs: unknown): object | null;
  export function breadcrumbJsonLd(items: unknown): object;
  export function localBusinessJsonLd(opts: Record<string, unknown>): object;
  export function autoDealerJsonLd(opts: Record<string, unknown>): object;
  export function softwareApplicationJsonLd(opts: Record<string, unknown>): object;
  export function articleJsonLd(opts: Record<string, unknown>): object;
  export function organizationJsonLd(siteUrl?: string): object;
  export function webSiteJsonLd(siteUrl?: string): object;
  export function vehicleJsonLd(opts: Record<string, unknown>): object;
}

declare module "@client-seo/slugUtils" {
  export function parseSemanticListingParam(param: string): { id: string | null; slug: string | null };
  export function parseAgencySlug(param: string): { id: string | null; slug: string | null };
  export function buildRentalListingPath(listing: Record<string, unknown>): string;
  export function buildSaleListingPath(listing: Record<string, unknown>): string;
  export function buildAgencyPath(citySlug: string, name: string, id: string): string;
  export function buildDealerPath(citySlug: string, name: string, id: string): string;
}

declare module "@client-seo/internalLinks" {
  export const SEO_FOOTER_LINKS: unknown;
}

declare module "@client-seo/catalog/hubs" {
  export const TRUST_PAGES: unknown;
}
