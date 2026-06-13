/** 18 Morocco airports for programmatic rental SEO. */
export const MOROCCO_AIRPORTS = [
  { slug: "mohammed-v-casablanca", iata: "CMN", citySlug: "casablanca", name: { fr: "Aéroport Mohammed V (Casablanca)", en: "Mohammed V Airport (Casablanca)", ar: "مطار محمد الخامس الدار البيضاء" } },
  { slug: "rabat-sale", iata: "RBA", citySlug: "rabat", name: { fr: "Aéroport Rabat-Salé", en: "Rabat-Salé Airport", ar: "مطار الرباط سلا" } },
  { slug: "marrakech-menara", iata: "RAK", citySlug: "marrakech", name: { fr: "Aéroport Marrakech Menara", en: "Marrakech Menara Airport", ar: "مطار مراكش المنara" } },
  { slug: "agadir-al-massira", iata: "AGA", citySlug: "agadir", name: { fr: "Aéroport Agadir Al Massira", en: "Agadir Al Massira Airport", ar: "مطار أكادير المسيرة" } },
  { slug: "fes-saiss", iata: "FEZ", citySlug: "fes", name: { fr: "Aéroport Fès Saïss", en: "Fes Saiss Airport", ar: "مطار فاس سايس" } },
  { slug: "tanger-ibn-battouta", iata: "TNG", citySlug: "tanger", name: { fr: "Aéroport Tanger Ibn Battouta", en: "Tangier Ibn Battouta Airport", ar: "مطار طنجة ابن بطوطة" } },
  { slug: "oujda-angads", iata: "OUD", citySlug: "oujda", name: { fr: "Aéroport Oujda Angads", en: "Oujda Angads Airport", ar: "مطار وجدة أنجاد" } },
  { slug: "nador-al-aaroui", iata: "NDR", citySlug: "nador", name: { fr: "Aéroport Nador Al Aaroui", en: "Nador Al Aaroui Airport", ar: "مطار الناظور العروي" } },
  { slug: "essaouira-mogador", iata: "ESU", citySlug: "essaouira", name: { fr: "Aéroport Essaouira Mogador", en: "Essaouira Mogador Airport", ar: "مطار الصويرة موكادور" } },
  { slug: "ouarzazate", iata: "OZZ", citySlug: "ouarzazate", name: { fr: "Aéroport Ouarzazate", en: "Ouarzazate Airport", ar: "مطار ورزازات" } },
  { slug: "al-hoceima-cherif", iata: "AHU", citySlug: "al-hoceima", name: { fr: "Aéroport Al Hoceïma Chérif Al Idrissi", en: "Al Hoceima Airport", ar: "مطار الحسيمة" } },
  { slug: "tetouan-sania-ramel", iata: "TTU", citySlug: "tetouan", name: { fr: "Aéroport Tétouan Sania Ramel", en: "Tetouan Sania Ramel Airport", ar: "مطار تطوان سانية الرمل" } },
  { slug: "laayoune-hassan", iata: "EUN", citySlug: "laayoune", name: { fr: "Aéroport Laâyoune Hassan I", en: "Laayoune Hassan I Airport", ar: "مطار العيون الحسن الأول" } },
  { slug: "dakhla", iata: "VIL", citySlug: "dakhla", name: { fr: "Aéroport Dakhla", en: "Dakhla Airport", ar: "مطار الداخلة" } },
  { slug: "guelmim", iata: "GLN", citySlug: "guelmim", name: { fr: "Aéroport Guelmim", en: "Guelmim Airport", ar: "مطار كلميم" } },
  { slug: "errachidia", iata: "ERH", citySlug: "errachidia", name: { fr: "Aéroport Errachidia Moulay Ali Cherif", en: "Errachidia Airport", ar: "مطار الرشيدية" } },
  { slug: "beni-mellal", iata: "BEM", citySlug: "beni-mellal", name: { fr: "Aéroport Béni Mellal", en: "Beni Mellal Airport", ar: "مطار بني ملال" } },
  { slug: "marrakech-ral", iata: "RAK", citySlug: "marrakech", name: { fr: "Location voiture aéroport Marrakech", en: "Marrakech airport car rental", ar: "كراء سيارات مطار مراكش" } },
];

export function getAirportBySlug(slug) {
  return MOROCCO_AIRPORTS.find((a) => a.slug === slug) || null;
}

export function getAirportName(airport, lang = "fr") {
  return airport?.name?.[lang] || airport?.name?.fr || airport?.slug || "";
}

export function airportRentalPath(slug) {
  return `/location-voiture-aeroport/${slug}`;
}
