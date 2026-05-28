const CURRENT_YEAR = new Date().getFullYear();

export const DEBOUNCE_MS = 640;

export const FUEL_OPTIONS = [
  { id: "", fr: "Tous carburants", en: "All fuels", ar: "كل أنواع الوقود" },
  { id: "essence", fr: "Essence", en: "Petrol", ar: "بنزين" },
  { id: "diesel", fr: "Diesel", en: "Diesel", ar: "ديزل" },
  { id: "hybride", fr: "Hybride", en: "Hybrid", ar: "هجين" },
  { id: "electrique", fr: "Électrique", en: "Electric", ar: "كهربائي" },
];

export const GEARBOX_OPTIONS = [
  { id: "", fr: "Toutes boîtes", en: "All gearboxes", ar: "كل أنواع ناقل الحركة" },
  { id: "manuelle", fr: "Manuelle", en: "Manual", ar: "يدوي" },
  { id: "automatique", fr: "Automatique", en: "Automatic", ar: "أوتوماتيك" },
];

export const BRAND_OPTIONS = [
  "Dacia",
  "Renault",
  "Peugeot",
  "Citroën",
  "Volkswagen",
  "Toyota",
  "Hyundai",
  "Kia",
  "BMW",
  "Mercedes",
  "Audi",
  "Ford",
  "Fiat",
  "Seat",
  "Opel",
];

export const MOROCCO_CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fès",
  "Tanger",
  "Agadir",
  "Meknès",
  "Oujda",
  "Kenitra",
  "Tétouan",
  "Salé",
  "Nador",
  "Mohammedia",
];

export const SALE_PRICE_BANDS = [
  { key: "any", fr: "Tous prix", en: "Any price" },
  { key: "u80", fr: "< 80k MAD", en: "< 80k MAD", max: 80000 },
  { key: "80_150", fr: "80–150k", en: "80–150k", min: 80000, max: 150000 },
  { key: "150_250", fr: "150–250k", en: "150–250k", min: 150000, max: 250000 },
  { key: "250_500", fr: "250–500k", en: "250–500k", min: 250000, max: 500000 },
  { key: "p500", fr: "500k+", en: "500k+", min: 500000 },
];

export const RENT_PRICE_BANDS = [
  { key: "any", fr: "Tous tarifs", en: "Any rate" },
  { key: "u300", fr: "< 300 MAD/j", en: "< 300 MAD/day", max: 300 },
  { key: "300_600", fr: "300–600", en: "300–600", min: 300, max: 600 },
  { key: "600_1000", fr: "600–1000", en: "600–1000", min: 600, max: 1000 },
  { key: "p1000", fr: "1000+ MAD/j", en: "1000+ MAD/day", min: 1000 },
];

export const YEAR_BANDS = [
  { key: "any", fr: "Toutes années", en: "All years" },
  { key: "new", fr: `${CURRENT_YEAR - 2}+`, en: `${CURRENT_YEAR - 2}+`, minYear: CURRENT_YEAR - 2 },
  { key: "recent", fr: `${CURRENT_YEAR - 7}–${CURRENT_YEAR - 3}`, en: `${CURRENT_YEAR - 7}–${CURRENT_YEAR - 3}`, minYear: CURRENT_YEAR - 7, maxYear: CURRENT_YEAR - 3 },
  { key: "mid", fr: `${CURRENT_YEAR - 14}–${CURRENT_YEAR - 8}`, en: `${CURRENT_YEAR - 14}–${CURRENT_YEAR - 8}`, minYear: CURRENT_YEAR - 14, maxYear: CURRENT_YEAR - 8 },
  { key: "classic", fr: `Avant ${CURRENT_YEAR - 14}`, en: `Before ${CURRENT_YEAR - 14}`, maxYear: CURRENT_YEAR - 15 },
];

export const EMPTY_FILTERS = {
  city: "",
  brand: "",
  fuel: "",
  gearbox: "",
  priceKey: "any",
  yearKey: "any",
  airportOnly: false,
  startDate: null,
  endDate: null,
};

export function countActiveFilters(filters, mode) {
  let n = 0;
  if (filters.city?.trim()) n++;
  if (filters.brand?.trim()) n++;
  if (filters.fuel) n++;
  if (filters.gearbox) n++;
  if (filters.priceKey && filters.priceKey !== "any") n++;
  if (mode === "buy" && filters.yearKey && filters.yearKey !== "any") n++;
  if (mode === "rent" && filters.airportOnly) n++;
  if (mode === "rent" && filters.startDate && filters.endDate) n++;
  return n;
}

export function buildMarketplaceParams(mode, filters, search) {
  const params = {};
  const q = search?.trim();
  if (q) params.search = q;
  if (filters.city?.trim()) params.city = filters.city.trim();
  if (filters.brand?.trim()) params.brand = filters.brand.trim();
  if (filters.fuel) params.fuel = filters.fuel;
  if (filters.gearbox) params.gearbox = filters.gearbox;

  const bands = mode === "rent" ? RENT_PRICE_BANDS : SALE_PRICE_BANDS;
  const pr = bands.find((b) => b.key === filters.priceKey);
  if (pr?.min != null) params.minPrice = pr.min;
  if (pr?.max != null) params.maxPrice = pr.max;

  if (mode === "buy") {
    const yr = YEAR_BANDS.find((b) => b.key === filters.yearKey);
    if (yr?.minYear != null) params.minYear = yr.minYear;
    if (yr?.maxYear != null) params.maxYear = yr.maxYear;
  }

  if (mode === "rent") {
    if (filters.airportOnly) params.airport = 1;
    if (filters.startDate && filters.endDate) {
      params.startDate = filters.startDate;
      params.endDate = filters.endDate;
    }
  }

  return params;
}

/** Human-readable chips for active filters (excluding search). */
export function activeFilterChips(filters, mode, fr) {
  const chips = [];
  if (filters.city?.trim()) chips.push({ key: "city", label: filters.city.trim() });
  if (filters.brand?.trim()) chips.push({ key: "brand", label: filters.brand.trim() });
  if (filters.fuel) {
    const f = FUEL_OPTIONS.find((o) => o.id === filters.fuel);
    chips.push({ key: "fuel", label: fr ? f?.fr : f?.en });
  }
  if (filters.gearbox) {
    const g = GEARBOX_OPTIONS.find((o) => o.id === filters.gearbox);
    chips.push({ key: "gearbox", label: fr ? g?.fr : g?.en });
  }
  const bands = mode === "rent" ? RENT_PRICE_BANDS : SALE_PRICE_BANDS;
  const pr = bands.find((b) => b.key === filters.priceKey);
  if (pr && pr.key !== "any") chips.push({ key: "priceKey", label: fr ? pr.fr : pr.en });
  if (mode === "buy") {
    const yr = YEAR_BANDS.find((b) => b.key === filters.yearKey);
    if (yr && yr.key !== "any") chips.push({ key: "yearKey", label: fr ? yr.fr : yr.en });
  }
  if (mode === "rent" && filters.airportOnly) {
    chips.push({ key: "airportOnly", label: fr ? "Livraison aéroport" : "Airport delivery" });
  }
  if (mode === "rent" && filters.startDate && filters.endDate) {
    const a = new Date(filters.startDate).toLocaleDateString(fr ? "fr-FR" : "en-GB", { day: "numeric", month: "short" });
    const b = new Date(filters.endDate).toLocaleDateString(fr ? "fr-FR" : "en-GB", { day: "numeric", month: "short" });
    chips.push({ key: "dates", label: `${a} → ${b}` });
  }
  return chips;
}

function stripAccents(s) {
  return String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function normalizeGearboxValue(val) {
  const g = stripAccents(String(val || "").trim().toLowerCase());
  if (!g) return "";
  if (/^(manuelle|manual|manuell?e|manu)\b/.test(g) || g.includes("manual")) return "manuelle";
  if (/^(automatique|automatic|auto)\b/.test(g) || g.includes("automatic")) return "automatique";
  return g;
}

export function normalizeFuelValue(val) {
  const f = stripAccents(String(val || "").trim().toLowerCase());
  if (!f) return "";
  if (/^(essence|petrol|gasoline|gas)\b/.test(f)) return "essence";
  if (/^diesel\b/.test(f)) return "diesel";
  if (/^(hybride|hybrid)\b/.test(f)) return "hybride";
  if (/^(electrique|electric)\b/.test(f)) return "electrique";
  return f;
}

/** Client-side safety net when API stores free-text gearbox/fuel values. */
export function itemMatchesFilters(item, filters) {
  if (filters.city?.trim()) {
    const want = filters.city.trim().toLowerCase();
    const got = String(item.city || "")
      .trim()
      .toLowerCase();
    if (!got.includes(want)) return false;
  }
  if (filters.brand?.trim()) {
    const want = filters.brand.trim().toLowerCase();
    const got = String(item.brand || "")
      .trim()
      .toLowerCase();
    if (!got.includes(want)) return false;
  }
  if (filters.fuel) {
    if (normalizeFuelValue(item.fuel) !== filters.fuel) return false;
  }
  if (filters.gearbox) {
    if (normalizeGearboxValue(item.gearbox) !== filters.gearbox) return false;
  }
  return true;
}

export function clearFilterKey(filters, key) {
  const next = { ...filters };
  if (key === "city") next.city = "";
  else if (key === "brand") next.brand = "";
  else if (key === "fuel") next.fuel = "";
  else if (key === "gearbox") next.gearbox = "";
  else if (key === "priceKey") next.priceKey = "any";
  else if (key === "yearKey") next.yearKey = "any";
  else if (key === "airportOnly") next.airportOnly = false;
  else if (key === "dates") {
    next.startDate = null;
    next.endDate = null;
  }
  return next;
}
