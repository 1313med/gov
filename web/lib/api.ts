import { API_BASE } from "./site";

export async function fetchRentals(city?: string) {
  const url = city ? `${API_BASE}/rental?city=${encodeURIComponent(city)}` : `${API_BASE}/rental`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : data?.rentals || [];
}

export async function fetchSales(city?: string, limit = 100) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (city) params.set("city", city);
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

export async function fetchSellerProfile(id: string) {
  const res = await fetch(`${API_BASE}/user/seller/${id}`, { next: { revalidate: 600 } });
  if (!res.ok) return null;
  return res.json();
}
