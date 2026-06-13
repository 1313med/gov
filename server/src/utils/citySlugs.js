/** City slug ↔ display name (mirrors client SEO catalog). */
const CITIES = [
  { slug: "casablanca", fr: "Casablanca" },
  { slug: "rabat", fr: "Rabat" },
  { slug: "marrakech", fr: "Marrakech" },
  { slug: "fes", fr: "Fès" },
  { slug: "tanger", fr: "Tanger" },
  { slug: "agadir", fr: "Agadir" },
  { slug: "meknes", fr: "Meknès" },
  { slug: "oujda", fr: "Oujda" },
  { slug: "kenitra", fr: "Kénitra" },
  { slug: "tetouan", fr: "Tétouan" },
  { slug: "sale", fr: "Salé" },
  { slug: "mohammedia", fr: "Mohammedia" },
  { slug: "el-jadida", fr: "El Jadida" },
  { slug: "nador", fr: "Nador" },
  { slug: "beni-mellal", fr: "Béni Mellal" },
  { slug: "essaouira", fr: "Essaouira" },
];

const SLUG_TO_NAME = Object.fromEntries(CITIES.map((c) => [c.slug, c.fr]));
const NAME_TO_SLUG = Object.fromEntries(
  CITIES.flatMap((c) => [
    [c.fr.toLowerCase(), c.slug],
    [c.slug, c.slug],
  ])
);

function normalizeCityKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

exports.getCityNameFromSlug = (slug) => SLUG_TO_NAME[slug] || null;

exports.getCitySlugFromName = (cityName) => {
  const key = normalizeCityKey(cityName);
  if (NAME_TO_SLUG[key]) return NAME_TO_SLUG[key];
  for (const c of CITIES) {
    if (key.includes(normalizeCityKey(c.fr)) || normalizeCityKey(c.fr).includes(key)) {
      return c.slug;
    }
  }
  return null;
};

exports.cityNameMatchesSlug = (cityName, slug) => {
  const expected = SLUG_TO_NAME[slug];
  if (!expected || !cityName) return false;
  return normalizeCityKey(cityName).includes(normalizeCityKey(expected));
};

exports.TOP_CITY_SLUGS = CITIES.map((c) => c.slug);
