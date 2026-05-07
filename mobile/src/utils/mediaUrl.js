import { SERVER_URL } from "../config";

/**
 * Turn stored image refs into a full URL for <Image source={{ uri }} />.
 * Supports: https://… (Cloudinary), /uploads/…, or bare filename from legacy disk uploads.
 */
export function resolveMediaUrl(ref) {
  if (ref == null || ref === "") return null;
  const s = String(ref).trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  const base = String(SERVER_URL || "").replace(/\/$/, "");
  if (s.startsWith("/")) return `${base}${s}`;
  return `${base}/uploads/${s}`;
}
