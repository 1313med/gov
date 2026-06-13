/**
 * Sharded sitemap index — supports 100k+ URLs (GoVoiture SEO ecosystem).
 */
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { getAllBlogArticles } from "../src/seo/catalog/blogArticles.js";
import { getAllComparisons } from "../src/seo/catalog/comparisons.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const sitemapsDir = join(publicDir, "sitemaps");

const SITE_URL = (process.env.VITE_SITE_URL || "https://goovoiture.ma").replace(/\/+$/, "");
const API_BASE = (process.env.VITE_API_URL || "https://goovoiture-api.onrender.com/api").replace(/\/+$/, "");

const LANGS = [
  { code: "fr", prefix: "" },
  { code: "en", prefix: "/en" },
  { code: "ar", prefix: "/ar" },
];

const HREFLANG = { fr: "fr-MA", en: "en-MA", ar: "ar-MA" };

const CITIES = [
  "casablanca", "rabat", "marrakech", "fes", "tanger", "agadir", "meknes", "oujda",
  "kenitra", "tetouan", "sale", "temara", "mohammedia", "el-jadida", "nador", "beni-mellal",
  "khouribga", "safi", "essaouira", "laayoune", "dakhla", "ouarzazate", "errachidia",
  "al-hoceima", "taza", "settat", "berrechid", "khemisset", "larache", "khenifra",
  "taroudant", "tiznit", "guelmim", "ifrane", "azrou", "chefchaouen", "midelt", "tinghir",
  "zagora", "sidi-kacem", "sidi-slimane", "youssoufia", "fnideq", "martil", "ouezzane",
];

const RENTAL_CATEGORIES = [
  "voiture-economique", "suv-4x4", "voiture-luxe", "voiture-automatique",
  "voiture-7-places", "voiture-electrique", "voiture-diesel", "sans-caution", "avec-chauffeur",
];

const AIRPORTS = [
  "mohammed-v-casablanca", "rabat-sale", "marrakech-menara", "agadir-al-massira",
  "fes-saiss", "tanger-ibn-battouta", "oujda-angads", "nador-al-aaroui",
  "essaouira-mogador", "ouarzazate", "al-hoceima-cherif", "tetouan-sania-ramel",
  "laayoune-hassan", "dakhla", "guelmim", "errachidia", "beni-mellal",
];

const BRANDS = [
  "dacia", "renault", "peugeot", "hyundai", "volkswagen", "fiat", "toyota", "kia",
  "seat", "citroen", "mercedes", "bmw", "audi", "nissan", "ford", "opel", "suzuki",
  "honda", "mazda", "chevrolet", "mitsubishi", "jeep", "land-rover", "porsche", "skoda",
  "mg", "chery", "geely", "byd", "tesla",
];

const PRO_SLUGS = [
  "gestion-flotte", "crm", "reservations", "contrats", "facturation", "rapports",
  "application-mobile", "creation-site-web", "seo-agences", "hebergement", "tarifs",
  "fonctionnalites", "support",
];

const BLOG_ARTICLES = [
  { cluster: "location-voiture", slug: "location-voiture-maroc-guide-complet" },
  { cluster: "location-voiture", slug: "location-voiture-casablanca-pas-cher" },
  { cluster: "aeroports", slug: "location-voiture-aeroport-mohammed-v" },
  { cluster: "voiture-occasion", slug: "acheter-voiture-occasion-maroc" },
  { cluster: "voiture-occasion", slug: "vendre-voiture-rapidement-maroc" },
  { cluster: "conduire-au-maroc", slug: "conduire-au-maroc-guide-etrangers" },
  { cluster: "tourisme", slug: "road-trip-maroc-10-jours" },
  { cluster: "pro", slug: "logiciel-gestion-flotte-location-maroc" },
];

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/location-voiture", priority: "0.95", changefreq: "daily" },
  { path: "/voiture-occasion", priority: "0.95", changefreq: "daily" },
  { path: "/rentals", priority: "0.9", changefreq: "daily" },
  { path: "/cars", priority: "0.9", changefreq: "daily" },
  { path: "/vendre-ma-voiture", priority: "0.9", changefreq: "daily" },
  { path: "/pro", priority: "0.85", changefreq: "weekly" },
  { path: "/agences", priority: "0.85", changefreq: "weekly" },
  { path: "/concessionnaires", priority: "0.85", changefreq: "weekly" },
  { path: "/comparer", priority: "0.8", changefreq: "weekly" },
  { path: "/blog", priority: "0.7", changefreq: "weekly" },
  { path: "/a-propos", priority: "0.5", changefreq: "monthly" },
  { path: "/equipe", priority: "0.4", changefreq: "monthly" },
  { path: "/avis", priority: "0.5", changefreq: "weekly" },
  { path: "/partenaires", priority: "0.4", changefreq: "monthly" },
  { path: "/etudes-de-cas", priority: "0.5", changefreq: "monthly" },
  { path: "/buying-guide", priority: "0.5", changefreq: "monthly" },
  { path: "/conditions-utilisation", priority: "0.3", changefreq: "yearly" },
  { path: "/politique-confidentialite", priority: "0.3", changefreq: "yearly" },
];

const today = new Date().toISOString().slice(0, 10);
const MAX_URLS_PER_FILE = 45000;

function localizedPath(prefix, path) {
  if (!prefix) return path;
  return path === "/" ? prefix : `${prefix}${path}`;
}

async function fetchWithRetry(url, opts = {}, retries = 3) {
  for (let i = 0; i < retries; i += 1) {
    try {
      const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(90000) });
      if (res.ok) return res;
    } catch {
      /* retry */
    }
    if (i < retries - 1) await new Promise((r) => setTimeout(r, 15000));
  }
  return null;
}

async function fetchAllSales() {
  const items = [];
  let page = 1;
  let pages = 1;
  while (page <= pages) {
    const res = await fetchWithRetry(`${API_BASE}/sale?limit=100&page=${page}`);
    if (!res) break;
    const data = await res.json();
    items.push(...(data.items || []));
    pages = data.pages || 1;
    page += 1;
  }
  return items;
}

async function fetchAllRentals() {
  const res = await fetchWithRetry(`${API_BASE}/rental`);
  if (!res) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

function slugify(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function buildRentalPath(item) {
  const slug = [item.brand, item.model, item.year, item.city].map(slugify).filter(Boolean).join("-");
  return `/louer/${slug}-${item._id}`;
}

function buildSalePath(item) {
  const slug = [item.brand, item.model, item.year, item.city].map(slugify).filter(Boolean).join("-");
  return `/acheter/${slug}-${item._id}`;
}

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function hreflangLinks(basePath) {
  return LANGS.map(({ code, prefix }) => {
    const loc = `${SITE_URL}${localizedPath(prefix, basePath)}`;
    return `    <xhtml:link rel="alternate" hreflang="${HREFLANG[code]}" href="${xmlEscape(loc)}" />`;
  }).join("\n");
}

function urlEntry(basePath, priority, changefreq) {
  const loc = `${SITE_URL}${basePath}`;
  return `  <url>
    <loc>${xmlEscape(loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${hreflangLinks(basePath)}
    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(loc)}" />
  </url>`;
}

function listingUrlEntries(basePath, priority, changefreq) {
  return LANGS.map(({ prefix }) => urlEntry(localizedPath(prefix, basePath), priority, changefreq)).join("\n");
}

function writeShard(filename, urlBlocks) {
  const body = urlBlocks.join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;
  writeFileSync(join(sitemapsDir, filename), xml, "utf8");
  return urlBlocks.length;
}

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function main() {
  mkdirSync(sitemapsDir, { recursive: true });
  console.log("[sitemap] Site:", SITE_URL);

  const [sales, rentals] = await Promise.all([fetchAllSales(), fetchAllRentals()]);
  console.log(`[sitemap] API: ${sales.length} sales, ${rentals.length} rentals`);

  const shardFiles = [];

  // static.xml
  const staticUrls = STATIC_PAGES.map((p) => urlEntry(p.path, p.priority, p.changefreq));
  writeShard("static.xml", staticUrls);
  shardFiles.push("static.xml");

  // rentals.xml — city + category + airport programmatic
  const rentalUrls = [];
  for (const city of CITIES) {
    rentalUrls.push(urlEntry(`/location-voiture/${city}`, "0.85", "weekly"));
    for (const cat of RENTAL_CATEGORIES) {
      rentalUrls.push(urlEntry(`/location-voiture/${city}/${cat}`, "0.75", "weekly"));
    }
    for (const brand of BRANDS.slice(0, 15)) {
      rentalUrls.push(urlEntry(`/location-voiture/${city}/${brand}`, "0.7", "weekly"));
    }
  }
  for (const ap of AIRPORTS) {
    rentalUrls.push(urlEntry(`/location-voiture-aeroport/${ap}`, "0.8", "weekly"));
    for (const cat of RENTAL_CATEGORIES.slice(0, 5)) {
      rentalUrls.push(urlEntry(`/location-voiture-aeroport/${ap}/${cat}`, "0.7", "weekly"));
    }
  }
  writeShard("rentals.xml", rentalUrls);
  shardFiles.push("rentals.xml");

  // sales.xml
  const saleUrls = [];
  for (const city of CITIES) {
    saleUrls.push(urlEntry(`/voiture-occasion/${city}`, "0.8", "weekly"));
    for (const cat of RENTAL_CATEGORIES) {
      saleUrls.push(urlEntry(`/voiture-occasion/${city}/${cat}`, "0.7", "weekly"));
    }
  }
  writeShard("sales.xml", saleUrls);
  shardFiles.push("sales.xml");

  // brands.xml
  const brandUrls = BRANDS.map((b) => urlEntry(`/marque/${b}`, "0.65", "weekly"));
  writeShard("brands.xml", brandUrls);
  shardFiles.push("brands.xml");

  // models.xml — top models per brand (sample)
  const modelUrls = [];
  const TOP_MODELS = {
    dacia: ["logan", "duster"], renault: ["clio", "symbol"], peugeot: ["208", "3008"],
    hyundai: ["i10", "tucson"], toyota: ["yaris", "corolla"],
  };
  for (const [brand, models] of Object.entries(TOP_MODELS)) {
    for (const m of models) {
      modelUrls.push(urlEntry(`/marque/${brand}/${m}`, "0.6", "weekly"));
    }
  }
  writeShard("models.xml", modelUrls);
  shardFiles.push("models.xml");

  // pro.xml
  const proUrls = [urlEntry("/pro", "0.85", "weekly"), ...PRO_SLUGS.map((s) => urlEntry(`/pro/${s}`, "0.7", "weekly"))];
  writeShard("pro.xml", proUrls);
  shardFiles.push("pro.xml");

  // blog.xml
  const allArticles = getAllBlogArticles();
  const blogUrls = [urlEntry("/blog", "0.7", "weekly"), ...allArticles.map((a) => urlEntry(`/blog/${a.cluster}/${a.slug}`, "0.6", "monthly"))];
  writeShard("blog.xml", blogUrls);
  shardFiles.push("blog.xml");

  const compUrls = getAllComparisons().map((c) => urlEntry(c.path, "0.65", "monthly"));
  writeShard("comparisons.xml", compUrls);
  shardFiles.push("comparisons.xml");

  // listings-rental.xml (sharded if needed)
  const rentalListingBlocks = [];
  for (const r of rentals) {
    if (r._id) rentalListingBlocks.push(listingUrlEntries(buildRentalPath(r), "0.65", "weekly"));
  }
  const rentalChunks = chunkArray(rentalListingBlocks, MAX_URLS_PER_FILE);
  rentalChunks.forEach((chunk, i) => {
    const name = rentalChunks.length > 1 ? `listings-rental-${i + 1}.xml` : "listings-rental.xml";
    writeShard(name, chunk);
    shardFiles.push(name);
  });
  if (rentalChunks.length === 0) {
    writeShard("listings-rental.xml", []);
    shardFiles.push("listings-rental.xml");
  }

  // listings-sale.xml
  const saleListingBlocks = [];
  for (const s of sales) {
    if (s._id) saleListingBlocks.push(listingUrlEntries(buildSalePath(s), "0.65", "weekly"));
  }
  const saleChunks = chunkArray(saleListingBlocks, MAX_URLS_PER_FILE);
  saleChunks.forEach((chunk, i) => {
    const name = saleChunks.length > 1 ? `listings-sale-${i + 1}.xml` : "listings-sale.xml";
    writeShard(name, chunk);
    shardFiles.push(name);
  });
  if (saleChunks.length === 0) {
    writeShard("listings-sale.xml", []);
    shardFiles.push("listings-sale.xml");
  }

  // agencies.xml / dealers.xml
  let agencyUrls = [
    urlEntry("/agences", "0.85", "weekly"),
    ...CITIES.slice(0, 15).map((c) => urlEntry(`/agences/${c}`, "0.8", "weekly")),
  ];
  let dealerUrls = [
    urlEntry("/concessionnaires", "0.85", "weekly"),
    ...CITIES.slice(0, 15).map((c) => urlEntry(`/concessionnaires/${c}`, "0.8", "weekly")),
  ];
  try {
    const [agRes, deRes] = await Promise.all([
      fetch(`${API_BASE}/user/agencies`),
      fetch(`${API_BASE}/user/dealers`),
    ]);
    if (agRes.ok) {
      const { agencies } = await agRes.json();
      for (const a of agencies || []) {
        if (a.path) agencyUrls.push(urlEntry(a.path, "0.75", "weekly"));
      }
    }
    if (deRes.ok) {
      const { dealers } = await deRes.json();
      for (const d of dealers || []) {
        if (d.path) dealerUrls.push(urlEntry(d.path, "0.75", "weekly"));
      }
    }
  } catch {
    /* API optional at build time */
  }
  writeShard("agencies.xml", agencyUrls);
  writeShard("dealers.xml", dealerUrls);
  shardFiles.push("agencies.xml", "dealers.xml");

  const indexEntries = shardFiles.map(
    (f) => `  <sitemap>
    <loc>${xmlEscape(`${SITE_URL}/sitemaps/${f}`)}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`
  );

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexEntries.join("\n")}
</sitemapindex>
`;
  writeFileSync(join(publicDir, "sitemap-index.xml"), sitemapIndex, "utf8");

  // Legacy sitemap.xml points to index for older crawlers
  writeFileSync(
    join(publicDir, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${SITE_URL}/sitemap-index.xml</loc><lastmod>${today}</lastmod></sitemap>
</sitemapindex>
`,
    "utf8"
  );

  const robots = `# GoVoiture — SEO ecosystem (fr / en / ar)
User-agent: *
Allow: /
Allow: /en/
Allow: /ar/
Allow: /location-voiture
Allow: /location-voiture-aeroport
Allow: /voiture-occasion
Allow: /louer/
Allow: /acheter/
Allow: /marque/
Allow: /agences/
Allow: /concessionnaires/
Allow: /pro
Allow: /blog
Allow: /cars
Allow: /rentals
Allow: /vendre-ma-voiture

Disallow: /admin
Disallow: /owner
Disallow: /dashboard
Disallow: /my-fleet
Disallow: /my-rentals
Disallow: /my-sales
Disallow: /my-bookings
Disallow: /add-rental
Disallow: /owner-bookings
Disallow: /garage
Disallow: /messages
Disallow: /profile
Disallow: /notifications
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /verify-email
Disallow: /saved
Disallow: /kyc
Disallow: /referral
Disallow: /credit-check
Disallow: /fuel-tracker
Disallow: /car-worth
Disallow: /travel-ready
Disallow: /accident
Disallow: /estimate
Disallow: /price-alerts
Disallow: /verify-cin
Disallow: /profile-documents

Sitemap: ${SITE_URL}/sitemap-index.xml
Sitemap: ${SITE_URL}/sitemap.xml
`;

  writeFileSync(join(publicDir, "robots.txt"), robots, "utf8");

  const totalUrls =
    staticUrls.length +
    rentalUrls.length +
    saleUrls.length +
    brandUrls.length +
    modelUrls.length +
    proUrls.length +
    blogUrls.length +
    rentalListingBlocks.length +
    saleListingBlocks.length;

  console.log(`[sitemap] Wrote sitemap-index.xml + ${shardFiles.length} shards (~${totalUrls} URL groups)`);
}

main().catch((err) => {
  console.warn("[sitemap] Warning:", err.message);
  process.exit(0);
});
