/** Slug helpers for semantic SEO URLs (50k+ page scale). */

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;
const LISTING_SUFFIX_RE = /^(.+)-([a-f0-9]{24})$/i;

export function slugify(text) {
  if (!text) return "";
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildListingSlug({ brand, model, year, city }) {
  return [brand, model, year, city].filter(Boolean).map(slugify).filter(Boolean).join("-");
}

export function buildRentalListingPath(listing, langPrefix = "") {
  const slug = buildListingSlug({
    brand: listing.brand,
    model: listing.model,
    year: listing.year,
    city: listing.city,
  });
  const base = `/louer/${slug}-${listing._id}`;
  return langPrefix ? `/${langPrefix}${base}` : base;
}

export function buildSaleListingPath(listing, langPrefix = "") {
  const slug = buildListingSlug({
    brand: listing.brand,
    model: listing.model,
    year: listing.year,
    city: listing.city,
  });
  const base = `/acheter/${slug}-${listing._id}`;
  return langPrefix ? `/${langPrefix}${base}` : base;
}

/** Parse `/louer/dacia-logan-2023-casa-507f...` → { id, slug } */
export function parseSemanticListingParam(param) {
  if (!param) return { id: null, slug: null };
  if (OBJECT_ID_RE.test(param)) return { id: param, slug: null };
  const m = param.match(LISTING_SUFFIX_RE);
  if (m) return { id: m[2], slug: m[1] };
  return { id: null, slug: param };
}

export function buildAgencySlug(name, id) {
  const base = slugify(name) || "agence";
  return `${base}-${String(id).slice(-8)}`;
}

export function buildAgencyPath(citySlug, name, id) {
  return `/agences/${slugify(citySlug)}/${buildAgencySlug(name, id)}`;
}

export function buildDealerPath(citySlug, name, id) {
  return `/concessionnaires/${slugify(citySlug)}/${buildAgencySlug(name, id)}`;
}

export function parseAgencySlug(param) {
  const parts = param.split("-");
  const suffix = parts[parts.length - 1];
  return { suffix, slug: param };
}

export function matchesListingSlug(listing, slugPart) {
  if (!slugPart || !listing) return true;
  const expected = buildListingSlug(listing);
  return slugPart === expected || slugPart.startsWith(expected);
}
