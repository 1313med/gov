/** Morocco city landing pages — slug is Latin for stable URLs. */
export const MOROCCO_CITIES = [
  {
    slug: "casablanca",
    name: { fr: "Casablanca", en: "Casablanca", ar: "الدار البيضاء" },
    region: { fr: "Grand Casablanca", en: "Grand Casablanca", ar: "الدار البيضاء سطات" },
    airport: { fr: "Aéroport Mohammed V", en: "Mohammed V Airport", ar: "مطار محمد الخامس" },
  },
  {
    slug: "rabat",
    name: { fr: "Rabat", en: "Rabat", ar: "الرباط" },
    region: { fr: "Rabat-Salé-Kénitra", en: "Rabat-Salé-Kénitra", ar: "الرباط سلا القنيطرة" },
    airport: { fr: "Aéroport Rabat-Salé", en: "Rabat-Salé Airport", ar: "مطار الرباط سلا" },
  },
  {
    slug: "marrakech",
    name: { fr: "Marrakech", en: "Marrakech", ar: "مراكش" },
    region: { fr: "Marrakech-Safi", en: "Marrakech-Safi", ar: "مراكش آسفي" },
  },
  {
    slug: "fes",
    name: { fr: "Fès", en: "Fes", ar: "فاس" },
    region: { fr: "Fès-Meknès", en: "Fès-Meknès", ar: "فاس مكناس" },
  },
  {
    slug: "tanger",
    name: { fr: "Tanger", en: "Tangier", ar: "طنجة" },
    region: { fr: "Tanger-Tétouan-Al Hoceïma", en: "Tangier-Tétouan-Al Hoceima", ar: "طنجة تطوان الحسيمة" },
  },
  {
    slug: "agadir",
    name: { fr: "Agadir", en: "Agadir", ar: "أكادير" },
    region: { fr: "Souss-Massa", en: "Souss-Massa", ar: "سوس ماسة" },
  },
  {
    slug: "meknes",
    name: { fr: "Meknès", en: "Meknes", ar: "مكناس" },
    region: { fr: "Fès-Meknès", en: "Fès-Meknès", ar: "فاس مكناس" },
  },
  {
    slug: "oujda",
    name: { fr: "Oujda", en: "Oujda", ar: "وجدة" },
    region: { fr: "Oriental", en: "Oriental", ar: "الشرق" },
  },
];

export function getCityBySlug(slug) {
  return MOROCCO_CITIES.find((c) => c.slug === slug) || null;
}

export function cityRentalPath(slug) {
  return `/location-voiture/${slug}`;
}

export function citySalePath(slug) {
  return `/location-voiture-occasion/${slug}`;
}
