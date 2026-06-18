/** Normalize listing display text and filter placeholder / junk descriptions. */

const JUNK_DESCRIPTION =
  /^(test|xxx|aaa|asd|xfrf|n\/a|na|\.+|todo|null|undefined|abc|123|qwerty|lorem|sample|demo)$/i;

function titleCaseWord(word) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function formatBrandName(brand) {
  return String(brand || "")
    .trim()
    .split(/\s+/)
    .map(titleCaseWord)
    .join(" ");
}

export function formatModelName(model) {
  return String(model || "")
    .trim()
    .split(/\s+/)
    .map(titleCaseWord)
    .join(" ");
}

export function formatListingTitle(listing) {
  const brand = formatBrandName(listing?.brand);
  const model = formatModelName(listing?.model);
  const year = listing?.year ? String(listing.year) : "";
  return [brand, model, year].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

export function isLowQualityDescription(text) {
  if (text == null) return true;
  const trimmed = String(text).trim();
  if (!trimmed) return true;
  if (trimmed.length < 20) return true;
  if (JUNK_DESCRIPTION.test(trimmed)) return true;
  if (/^[\W\d_]+$/.test(trimmed)) return true;
  if (/^[a-z]{2,8}$/i.test(trimmed) && !/\s/.test(trimmed)) return true;
  return false;
}

function specLine(listing, lang) {
  const parts = [];
  if (listing.fuel) parts.push(String(listing.fuel));
  if (listing.gearbox) parts.push(String(listing.gearbox));
  if (listing.mileage) {
    const km = Number(listing.mileage).toLocaleString(lang === "ar" ? "ar-MA" : lang === "en" ? "en-US" : "fr-MA");
    parts.push(`${km} km`);
  }
  if (listing.seats) parts.push(`${listing.seats} places`);
  return parts.join(", ");
}

export function buildFallbackListingDescription(listing, intent = "sale", lang = "fr") {
  const title = formatListingTitle(listing);
  const city = listing?.city ? String(listing.city) : lang === "fr" ? "Maroc" : lang === "ar" ? "المغرب" : "Morocco";
  const specs = specLine(listing, lang);

  if (intent === "rental") {
    const price = listing?.pricePerDay
      ? Number(listing.pricePerDay).toLocaleString(lang === "ar" ? "ar-MA" : lang === "en" ? "en-US" : "fr-MA")
      : null;
    if (lang === "en") {
      return `${title} available for rent in ${city}${price ? ` from ${price} MAD/day` : ""}${specs ? `. ${specs}.` : "."} Verified listing on Goovoiture.`;
    }
    if (lang === "ar") {
      return `${title} للكراء في ${city}${price ? ` من ${price} درهم/اليوم` : ""}${specs ? `. ${specs}.` : "."} إعلان على Goovoiture.`;
    }
    return `${title} disponible à la location à ${city}${price ? ` à partir de ${price} MAD/jour` : ""}${specs ? `. ${specs}.` : "."} Annonce vérifiée sur Goovoiture.`;
  }

  const price = listing?.price
    ? Number(listing.price).toLocaleString(lang === "ar" ? "ar-MA" : lang === "en" ? "en-US" : "fr-MA")
    : null;
  if (lang === "en") {
    return `${title} for sale in ${city}${price ? ` — ${price} MAD` : ""}${specs ? `. ${specs}.` : "."} Contact the seller on Goovoiture.`;
  }
  if (lang === "ar") {
    return `${title} للبيع في ${city}${price ? ` — ${price} درهم` : ""}${specs ? `. ${specs}.` : "."} تواصل مع البائع على Goovoiture.`;
  }
  return `${title} à vendre à ${city}${price ? ` — ${price} MAD` : ""}${specs ? `. ${specs}.` : "."} Contactez le vendeur sur Goovoiture.`;
}

export function resolveListingDescription(listing, intent = "sale", lang = "fr") {
  const raw = listing?.description;
  if (!isLowQualityDescription(raw)) return String(raw).trim();
  return buildFallbackListingDescription(listing, intent, lang);
}
