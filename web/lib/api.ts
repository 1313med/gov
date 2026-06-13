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
  }>;
  avgRating: number;
  total: number;
};

export async function fetchReviews(targetModel: string, targetId: string): Promise<ReviewPayload> {
  const res = await fetch(`${API_BASE}/reviews/${targetModel}/${targetId}`, { next: { revalidate: 600 } });
  if (!res.ok) return { reviews: [], avgRating: 0, total: 0 };
  return res.json();
}
