import { API_BASE } from "./site";

export async function fetchRentals(city?: string, brand?: string, limit = 12) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (city) params.set("city", city);
  if (brand) params.set("brand", brand);
  const res = await fetch(`${API_BASE}/rental?${params}`, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : data?.rentals || [];
}

export async function fetchSales(city?: string, brand?: string, limit = 12) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (city) params.set("city", city);
  if (brand) params.set("brand", brand);
  const res = await fetch(`${API_BASE}/sale?${params}`, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.items || [];
}

export async function fetchRentalById(id: string) {
  const res = await fetch(`${API_BASE}/rental/${id}`, { next: { revalidate: 300 } });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchSaleById(id: string) {
  const res = await fetch(`${API_BASE}/sale/${id}`, { next: { revalidate: 300 } });
  if (!res.ok) return null;
  return res.json();
}

export type ProfessionalSummary = {
  _id: string;
  name: string;
  city?: string;
  citySlug?: string;
  bio?: string;
  avatar?: string;
  phone?: string;
  email?: string;
  fleetSize: number;
  path: string;
  avgRating: number;
  reviewCount: number;
  verified?: boolean;
};

export async function fetchAgencies(cityName?: string, citySlug?: string) {
  const params = new URLSearchParams();
  if (citySlug) params.set("city", citySlug);
  else if (cityName) params.set("city", cityName);
  const res = await fetch(`${API_BASE}/user/agencies?${params}`, { next: { revalidate: 600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.agencies || []) as ProfessionalSummary[];
}

export async function fetchDealers(cityName?: string, citySlug?: string) {
  const params = new URLSearchParams();
  if (citySlug) params.set("city", citySlug);
  else if (cityName) params.set("city", cityName);
  const res = await fetch(`${API_BASE}/user/dealers?${params}`, { next: { revalidate: 600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.dealers || []) as ProfessionalSummary[];
}

export type SellerProfilePayload = Awaited<ReturnType<typeof fetchSellerProfile>>;

export async function fetchSellerProfile(id: string) {
  const res = await fetch(`${API_BASE}/user/seller/${id}`, { next: { revalidate: 600 } });
  if (!res.ok) return null;
  return res.json();
}

export type ReviewPayload = {
  reviews: Array<{
    _id: string;
    rating: number;
    comment?: string;
    authorId?: { name?: string };
    createdAt?: string;
    verified?: boolean;
  }>;
  avgRating: number;
  total: number;
};

export async function fetchReviews(targetModel: string, targetId: string): Promise<ReviewPayload> {
  const res = await fetch(`${API_BASE}/reviews/${targetModel}/${targetId}`, { next: { revalidate: 600 } });
  if (!res.ok) return { reviews: [], avgRating: 0, total: 0 };
  return res.json();
}

export type MarketPricesPayload = {
  brand: string;
  model: string;
  sale: {
    available: boolean;
    activeListings: number;
    soldListings: number;
    market: { sampleSize: number; average: number; median: number; min: number; max: number } | null;
    cityBreakdown: Array<{ city: string; sampleSize: number; median: number; average: number }>;
    yearBreakdown: Array<{ year: number; sampleSize: number; median: number }>;
  };
  rental: {
    available: boolean;
    activeListings: number;
    market: { sampleSize: number; average: number; median: number; min: number; max: number } | null;
    cityBreakdown: Array<{ city: string; sampleSize: number; median: number }>;
  };
  methodology?: string;
  source?: string;
};

export async function fetchMarketPrices(brand: string, model: string): Promise<MarketPricesPayload | null> {
  const params = new URLSearchParams({ brand, model });
  const res = await fetch(`${API_BASE}/market/prices?${params}`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchMarketTrends(brand: string, model: string) {
  const params = new URLSearchParams({ brand, model });
  const res = await fetch(`${API_BASE}/market/trends?${params}`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

export type QuestionItem = {
  slug: string;
  question: string;
  body?: string;
  topic?: string;
  brand?: string;
  model?: string;
  answers?: Array<{ body: string; authorName?: string; authorId?: { name?: string }; verifiedExpert?: boolean; accepted?: boolean }>;
};

export async function fetchQuestions(limit = 20): Promise<QuestionItem[]> {
  const res = await fetch(`${API_BASE}/qa?limit=${limit}`, { next: { revalidate: 600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.questions || [];
}

export type SearchDemandItem = {
  brand: string;
  model: string;
  views: number;
  listings: number;
  sold?: number;
  demandScore?: number;
};

export async function fetchSearchDemand(brand?: string, model?: string, limit = 20) {
  const params = new URLSearchParams();
  if (brand) params.set("brand", brand);
  if (model) params.set("model", model);
  if (!brand) params.set("limit", String(limit));
  const res = await fetch(`${API_BASE}/intelligence/search-demand?${params}`, { next: { revalidate: 3600 } });
  if (!res.ok) return brand && model ? null : { top: [] as SearchDemandItem[] };
  return res.json();
}

export type ReliabilityPayload = {
  brand: string;
  model: string;
  score: number;
  grade: string;
  avgListingRating: number | null;
  reviewSampleSize: number;
  insights: Array<{ title: string; body: string; type?: string }>;
  commonIssues: Array<{ title: string; body: string }>;
  maintenanceTips: Array<{ title: string; body: string }>;
  methodology?: string;
};

export async function fetchReliability(brand: string, model: string): Promise<ReliabilityPayload | null> {
  const params = new URLSearchParams({ brand, model });
  const res = await fetch(`${API_BASE}/intelligence/reliability?${params}`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

export type MarketIntelPayload = {
  brand: string;
  model: string;
  demand: SearchDemandItem & { activeSaleListings?: number; activeRentalListings?: number };
  reliability: { score: number; grade: string; commonIssues: Array<{ title: string; body: string }> };
  links?: Record<string, string>;
};

export async function fetchMarketIntel(brand: string, model: string): Promise<MarketIntelPayload | null> {
  const params = new URLSearchParams({ brand, model });
  const res = await fetch(`${API_BASE}/intelligence/market?${params}`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

export type TcoPayload = {
  brand: string;
  model: string;
  year: number;
  kmPerYear: number;
  purchasePriceMad: number;
  yearly: { fuel: number; insurance: number; maintenance: number; papers: number; depreciation: number; total: number };
  monthly: { total: number };
  costPerKm: number;
  assumptions?: Record<string, unknown>;
  methodology?: string;
};

export async function fetchTco(brand: string, model: string, year?: number, kmPerYear?: number, purchasePrice?: number) {
  const params = new URLSearchParams({ brand, model });
  if (year) params.set("year", String(year));
  if (kmPerYear) params.set("kmPerYear", String(kmPerYear));
  if (purchasePrice) params.set("purchasePrice", String(purchasePrice));
  const res = await fetch(`${API_BASE}/intelligence/tco?${params}`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json() as Promise<TcoPayload | null>;
}

export type ReputationPayload = {
  userId: string;
  name: string;
  city?: string;
  avatar?: string;
  score: number;
  grade: string;
  avgRating: number;
  reviewCount: number;
  verifiedReviewCount: number;
  identityVerified: boolean;
  inventoryCount: number;
  fleetSize: number;
  soldCount: number;
  badges: Array<{ id: string; label: string }>;
  memberSince?: string;
  methodology?: string;
};

export async function fetchReputation(userId: string): Promise<ReputationPayload | null> {
  const res = await fetch(`${API_BASE}/intelligence/reputation/${userId}`, { next: { revalidate: 600 } });
  if (!res.ok) return null;
  return res.json();
}
