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
  export const MOROCCO_AIRPORTS: Array<{ slug: string; iata: string; citySlug: string; name?: Record<string, string> }>;
  export function getAirportBySlug(slug: string): { slug: string; iata: string; citySlug: string } | null;
  export function getAirportName(airport: unknown, lang: string): string;
  export function airportRentalPath(slug: string): string;
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
  export function getAllBlogArticles(): Array<{
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
  export function getClusterArticles(clusterSlug: string): Array<{
    slug: string;
    cluster: string;
    title: Record<string, string>;
  }>;
  export function blogArticlePath(slug: string): string;
  export function blogClusterPath(clusterSlug: string): string;
}

declare module "@client-seo/catalog/comparisons" {
  export type ComparisonData = {
    slug: string;
    path: string;
    brandA: string;
    modelA: string;
    brandB: string;
    modelB: string;
    nameA: string;
    nameB: string;
    title: string;
    description: string;
    h1: string;
    intro: string;
    strengthsA: string[];
    strengthsB: string[];
    weaknessesA: string[];
    weaknessesB: string[];
    specs: Array<{ label: string; a: string; b: string }>;
    faqs: Array<{ q: string; a: string }>;
  };
  export function getAllComparisons(): ComparisonData[];
  export function getComparisonBySlug(slug: string): ComparisonData | null;
  export function getComparisonsForBrand(brandSlug: string, modelSlug?: string | null, limit?: number): ComparisonData[];
  export function buildComparisonData(slug: string): ComparisonData | null;
  export function buildComparisonHubSeo(lang?: string): {
    title: string;
    description: string;
    h1: string;
    intro: string;
    keywords: string;
    path: string;
  };
}

declare module "@client-seo/catalog/professionals" {
  export function buildAgencyHubSeo(
    lang: string,
    citySlug?: string | null
  ): {
    title: string;
    description: string;
    h1: string;
    intro: string;
    keywords: string;
    path: string;
  } | null;
  export function buildDealerHubSeo(
    lang: string,
    citySlug?: string | null
  ): {
    title: string;
    description: string;
    h1: string;
    intro: string;
    keywords: string;
    path: string;
  } | null;
  export function agencyFaqs(lang: string, cityName?: string): Array<{ q: string; a: string }>;
  export function dealerFaqs(lang: string, cityName?: string): Array<{ q: string; a: string }>;
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
  export function parseSeoPath(pathname: string): { lang: "fr" | "en" | "ar"; basePath: string };
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
  export function reviewJsonLd(opts: Record<string, unknown>): object;
  export function reviewsGraphJsonLd(reviews: unknown, itemReviewed: unknown): unknown;
  export function datasetJsonLd(opts: Record<string, unknown>): object;
  export function qaPageJsonLd(opts: Record<string, unknown>): object;
  export function carJsonLd(opts: Record<string, unknown>): object;
  export function howToJsonLd(opts: Record<string, unknown>): object;
  export function aggregateRatingJsonLd(opts: Record<string, unknown>): object;
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
  export const ENTITY_HUBS: Record<string, { path: string; label: Record<string, string> }>;
  export function topCityLinks(limit?: number): Array<{
    slug: string;
    name: Record<string, string>;
    rentalPath: string;
    salePath: string;
    agencyPath: string;
    dealerPath: string;
  }>;
  export function topBrandLinks(limit?: number): Array<{ slug: string; name: Record<string, string>; path: string }>;
  export function proLinks(limit?: number): Array<{ slug: string; title: Record<string, string>; path: string }>;
}

declare module "@client-seo/catalog/hubs" {
  export const TRUST_PAGES: unknown;
}

declare module "@client-seo/catalog/vehicleSpecs" {
  export function getVehicleSpec(brandSlug: string, modelSlug: string): {
    brandSlug: string;
    modelSlug: string;
    brandName: string;
    modelName: string;
    displayName: string;
    path: string;
    segment?: string;
    engine?: string;
    power?: string;
    transmission?: string;
    fuel?: string;
    consumption?: string;
    trunk?: string;
    seats?: number;
    safety?: string;
    moroccoNotes?: string;
    faqs: Array<{ q: string; a: string }>;
  } | null;
  export function getAllVehicleSpecs(): Array<NonNullable<ReturnType<typeof getVehicleSpec>>>;
  export function vehicleSpecPath(brandSlug: string, modelSlug: string): string;
  export function priceIntelPath(brandSlug: string, modelSlug: string): string;
  export function datasetPath(brandSlug: string, modelSlug: string): string;
}

declare module "@client-seo/catalog/contentClusters" {
  export const CONTENT_CLUSTERS: {
    assurance: { topics: Array<{ slug: string }> };
    financement: { topics: Array<{ slug: string }> };
    demarches: { topics: Array<{ slug: string }> };
  };
  export function getCluster(slug: string): {
    slug: string;
    hubPath: string;
    hubTitle: Record<string, string>;
    hubDescription: Record<string, string>;
    name: Record<string, string>;
    topics: Array<{ slug: string; title: Record<string, string>; description: Record<string, string> }>;
  } | null;
  export function getClusterTopic(clusterSlug: string, topicSlug: string): {
    cluster: {
      slug: string;
      hubPath: string;
      name: Record<string, string>;
    };
    topic: {
      slug: string;
      title: Record<string, string>;
      description: Record<string, string>;
      sections: Array<{ heading: string; body: string }>;
      faqs: Array<{ q: string; a: string }>;
      relatedLinks?: Array<{ label: string; path: string }>;
    };
  } | null;
  export function getAllClusterTopics(): Array<{ cluster: string; slug: string; path: string }>;
  export function clusterTopicPath(clusterSlug: string, topicSlug: string): string;
}

declare module "@client-seo/catalog/reliabilityIndex" {
  export function getReliabilityIndex(brandSlug: string, modelSlug: string): {
    brandSlug: string;
    modelSlug: string;
    displayName: string;
    score: number;
    grade: string;
    strengths: string[];
    weaknesses: string[];
    resaleIndex: number;
    partsAvailability: number;
    moroccoVerdict: string;
    faqs: Array<{ q: string; a: string }>;
  } | null;
  export function getAllReliabilityIndexes(): Array<NonNullable<ReturnType<typeof getReliabilityIndex>>>;
  export function reliabilityPath(brandSlug: string, modelSlug: string): string;
  export function reliabilityHubPath(): string;
  export function marketIntelPath(brandSlug: string, modelSlug: string): string;
  export function marketHubPath(): string;
  export function searchIntelPath(brandSlug: string, modelSlug: string): string;
  export function searchIntelHubPath(): string;
  export function tcoPath(brandSlug: string, modelSlug: string): string;
  export function buyerAssistantPath(): string;
  export function ownershipHubPath(): string;
  export function ownershipTimelinePath(topicSlug: string): string;
  export function sellerTrustPath(sellerId: string): string;
}

declare module "@client-seo/catalog/tcoBenchmarks" {
  export function getTcoBenchmark(brandSlug: string, modelSlug: string): {
    brandSlug: string;
    modelSlug: string;
    displayName: string;
    consumptionL100: number;
    fuelPricePerLiter: number;
    insuranceYear: number;
    maintenanceYear: number;
    papersYear: number;
    depreciationRate: number;
    defaultKmPerYear: number;
    defaultYear: number;
  } | null;
  export function getAllTcoBenchmarks(): Array<NonNullable<ReturnType<typeof getTcoBenchmark>>>;
}

declare module "@client-seo/catalog/ownershipTimelines" {
  export function getOwnershipTimeline(topicSlug: string): {
    slug: string;
    title: string;
    description: string;
    durationWeeks: number;
    steps: Array<{ title: string; body: string; week?: number; day?: number; checklist?: string[] }>;
    faqs: Array<{ q: string; a: string }>;
    relatedLinks?: Array<{ label: string; path: string }>;
  } | null;
  export function getAllOwnershipTimelines(): Array<NonNullable<ReturnType<typeof getOwnershipTimeline>>>;
  export function ownershipHubPath(): string;
  export function ownershipTimelinePath(topicSlug: string): string;
}

declare module "@client-seo/catalog/buyerAssistant" {
  export const ASSISTANT_STEPS: Array<{
    id: string;
    question: string;
    options: Array<{ value: string; label: string }>;
  }>;
  export function buyerAssistantPath(): string;
  export function resolveRecommendations(answers: Record<string, string>): Array<{
    brandSlug: string;
    modelSlug: string;
    reason: string;
  }>;
}

declare module "@client-seo/catalog/questionSeeds" {
  export function getQuestionSeed(slug: string): {
    slug: string;
    question: string;
    body?: string;
    topic?: string;
    answers?: Array<{ body: string; authorName?: string; verifiedExpert?: boolean; accepted?: boolean; upvotes?: number }>;
  } | null;
  export function getAllQuestionSeeds(): Array<NonNullable<ReturnType<typeof getQuestionSeed>>>;
  export function questionPath(slug: string): string;
  export function questionsHubPath(): string;
}

declare module "@client-seo/catalog/modelsAuthority" {
  export function modelAuthorityPath(brandSlug: string, modelSlug: string): string;
  export function getModelAuthority(
    brandSlug: string,
    modelSlug: string
  ): {
    brandSlug: string;
    modelSlug: string;
    displayName: string;
    listingTerms: string[];
    subtitle: string;
    introduction: string;
    popularity: string;
    engines: { diesel: string; essence: string; automatic: string; manual: string };
    consumption: { city: string; highway: string };
    reliability: { strengths: string[]; weaknesses: string[] };
    prices: { occasion: string; recent: string; popularVersions: string[] };
    maintenance: string;
    audience: { youngDrivers: string; families: string; professionals: string; longDistance: string };
    faqs: { q: string; a: string }[];
  } | null;
  export function getAllAuthorityModels(): NonNullable<ReturnType<typeof getModelAuthority>>[];
  export function getAuthorityModelsByBrand(brandSlug: string): NonNullable<ReturnType<typeof getModelAuthority>>[];
  export function matchesListingModel(
    listingModel: string | undefined,
    authority: NonNullable<ReturnType<typeof getModelAuthority>>
  ): boolean;
  export function authorityMetadata(model: NonNullable<ReturnType<typeof getModelAuthority>>): {
    basePath: string;
    title: string;
    description: string;
    keywords: string;
  };
}
