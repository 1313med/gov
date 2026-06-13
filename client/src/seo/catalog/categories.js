/** Vehicle categories for rental & sale programmatic pages. */
export const RENTAL_CATEGORIES = [
  { slug: "voiture-economique", name: { fr: "Voiture économique", en: "Economy car", ar: "سيارة اقتصادية" }, keywords: { fr: "location voiture pas cher", en: "cheap car rental", ar: "كراء سيارات رخيص" }, filters: { tier: "economy" } },
  { slug: "suv-4x4", name: { fr: "SUV & 4x4", en: "SUV & 4x4", ar: "SUV و 4x4" }, keywords: { fr: "location suv maroc", en: "suv rental morocco", ar: "كراء SUV" }, filters: { body: "suv" } },
  { slug: "voiture-luxe", name: { fr: "Voiture de luxe", en: "Luxury car", ar: "سيارة فاخرة" }, keywords: { fr: "location voiture luxe maroc", en: "luxury car rental morocco", ar: "تأجير سيارات فاخرة" }, filters: { tier: "luxury" } },
  { slug: "voiture-automatique", name: { fr: "Voiture automatique", en: "Automatic car", ar: "سيارة أوتوماتيك" }, keywords: { fr: "location voiture automatique", en: "automatic car rental", ar: "كراء سيارات أوتوماتيك" }, filters: { gearbox: "automatic" } },
  { slug: "voiture-7-places", name: { fr: "Voiture 7 places", en: "7-seat car", ar: "سيارة 7 مقاعد" }, keywords: { fr: "location voiture 7 places", en: "7 seater rental", ar: "كراء سيارة 7 مقاعد" }, filters: { seatsMin: 7 } },
  { slug: "voiture-electrique", name: { fr: "Voiture électrique", en: "Electric car", ar: "سيارة كهربائية" }, keywords: { fr: "location voiture électrique maroc", en: "electric car rental morocco", ar: "تأجير سيارات كهربائية" }, filters: { fuel: "electric" } },
  { slug: "voiture-diesel", name: { fr: "Voiture diesel", en: "Diesel car", ar: "سيارة ديزل" }, keywords: { fr: "location voiture diesel", en: "diesel car rental", ar: "كراء سيارات ديزل" }, filters: { fuel: "diesel" } },
  { slug: "sans-caution", name: { fr: "Sans caution", en: "No deposit", ar: "بدون ضمان" }, keywords: { fr: "location voiture sans caution maroc", en: "car rental no deposit morocco", ar: "كراء بدون ضمان" }, filters: { noDeposit: true } },
  { slug: "avec-chauffeur", name: { fr: "Avec chauffeur", en: "With driver", ar: "مع سائق" }, keywords: { fr: "location voiture avec chauffeur", en: "car rental with driver", ar: "كراء سيارة مع سائق" }, filters: { withDriver: true } },
];

export const SALE_CATEGORIES = [
  { slug: "voiture-economique", name: { fr: "Voiture pas chère", en: "Budget car", ar: "سيارة رخيصة" }, keywords: { fr: "voiture pas cher maroc", en: "cheap used car morocco", ar: "سيارات رخيصة" } },
  { slug: "suv-4x4", name: { fr: "SUV & 4x4", en: "SUV & 4x4", ar: "SUV و 4x4" }, keywords: { fr: "suv occasion maroc", en: "used suv morocco", ar: "SUV مستعمل" } },
  { slug: "voiture-luxe", name: { fr: "Voiture premium", en: "Premium car", ar: "سيارة فاخرة" }, keywords: { fr: "voiture luxe occasion maroc", en: "luxury used car morocco", ar: "سيارات فاخرة مستعملة" } },
  { slug: "voiture-automatique", name: { fr: "Automatique", en: "Automatic", ar: "أوتوماتيك" }, keywords: { fr: "voiture automatique occasion", en: "used automatic car", ar: "سيارات أوتوماتيك مستعملة" } },
  { slug: "voiture-7-places", name: { fr: "7 places", en: "7 seats", ar: "7 مقاعد" }, keywords: { fr: "voiture 7 places occasion", en: "used 7 seater", ar: "سيارة 7 مقاعد" } },
  { slug: "voiture-electrique", name: { fr: "Électrique", en: "Electric", ar: "كهربائية" }, keywords: { fr: "voiture électrique occasion maroc", en: "used electric car morocco", ar: "سيارات كهربائية مستعملة" } },
  { slug: "voiture-diesel", name: { fr: "Diesel", en: "Diesel", ar: "ديزل" }, keywords: { fr: "voiture diesel occasion", en: "used diesel car", ar: "سيارات ديزل مستعملة" } },
  { slug: "voiture-familiale", name: { fr: "Voiture familiale", en: "Family car", ar: "سيارة عائلية" }, keywords: { fr: "voiture familiale occasion", en: "used family car", ar: "سيارة عائلية مستعملة" } },
  { slug: "voiture-citadine", name: { fr: "Citadine", en: "City car", ar: "سيارة صغيرة" }, keywords: { fr: "citadine occasion maroc", en: "used city car morocco", ar: "سيارات صغيرة مستعملة" } },
];

export function getRentalCategoryBySlug(slug) {
  return RENTAL_CATEGORIES.find((c) => c.slug === slug) || null;
}

export function getSaleCategoryBySlug(slug) {
  return SALE_CATEGORIES.find((c) => c.slug === slug) || null;
}

export function rentalCategoryPath(citySlug, categorySlug) {
  return `/location-voiture/${citySlug}/${categorySlug}`;
}

export function saleCategoryPath(citySlug, categorySlug) {
  return `/voiture-occasion/${citySlug}/${categorySlug}`;
}
