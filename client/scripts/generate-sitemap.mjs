/**
 * Build-time sitemap + robots.txt — trilingual public SEO (fr / en / ar).
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const SITE_URL = (process.env.VITE_SITE_URL || "https://goovoiture.ma").replace(/\/+$/, "");
const API_BASE = (process.env.VITE_API_URL || "https://goovoiture-api.onrender.com/api").replace(/\/+$/, "");

const LANGS = [
  { code: "fr", prefix: "" },
  { code: "en", prefix: "/en" },
  { code: "ar", prefix: "/ar" },
];

const HREFLANG = { fr: "fr-MA", en: "en-MA", ar: "ar-MA" };

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/rentals", priority: "0.9", changefreq: "daily" },
  { path: "/cars", priority: "0.9", changefreq: "daily" },
  { path: "/buying-guide", priority: "0.5", changefreq: "monthly" },
  { path: "/mechanic-prices", priority: "0.5", changefreq: "monthly" },
  { path: "/community", priority: "0.5", changefreq: "weekly" },
  { path: "/afford-car", priority: "0.4", changefreq: "monthly" },
  { path: "/emergency", priority: "0.4", changefreq: "monthly" },
  { path: "/vendre-ma-voiture", priority: "0.9", changefreq: "daily" },
  { path: "/conditions-utilisation", priority: "0.3", changefreq: "yearly" },
  { path: "/politique-confidentialite", priority: "0.3", changefreq: "yearly" },
];

const CITIES = ["casablanca", "rabat", "marrakech", "fes", "tanger", "agadir", "meknes", "oujda"];

const today = new Date().toISOString().slice(0, 10);

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

function listingUrlEntry(basePath, priority, changefreq) {
  return LANGS.map(({ prefix }) => {
    const p = localizedPath(prefix, basePath);
    return urlEntry(p, priority, changefreq);
  }).join("\n");
}

async function main() {
  console.log("[sitemap] Site:", SITE_URL);
  console.log("[sitemap] API:", API_BASE);

  const [sales, rentals] = await Promise.all([fetchAllSales(), fetchAllRentals()]);
  console.log(`[sitemap] Listings: ${sales.length} sales, ${rentals.length} rentals`);

  const urls = [];

  for (const p of STATIC_PAGES) {
    urls.push(urlEntry(p.path, p.priority, p.changefreq));
  }

  for (const slug of CITIES) {
    urls.push(urlEntry(`/location-voiture/${slug}`, "0.8", "weekly"));
    urls.push(urlEntry(`/location-voiture-occasion/${slug}`, "0.75", "weekly"));
  }

  for (const s of sales) {
    if (s._id) urls.push(listingUrlEntry(`/cars/${s._id}`, "0.7", "weekly"));
  }

  for (const r of rentals) {
    if (r._id) urls.push(listingUrlEntry(`/rentals/${r._id}`, "0.7", "weekly"));
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;

  writeFileSync(join(publicDir, "sitemap.xml"), sitemap, "utf8");

  const robots = `# Goovoiture — SEO trilingue (fr / en / ar)
User-agent: *
Allow: /
Allow: /en/
Allow: /ar/
Allow: /cars
Allow: /rentals
Allow: /location-voiture/
Allow: /location-voiture-occasion/
Allow: /buying-guide
Allow: /mechanic-prices
Allow: /community
Allow: /afford-car
Allow: /emergency
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

Sitemap: ${SITE_URL}/sitemap.xml
`;

  writeFileSync(join(publicDir, "robots.txt"), robots, "utf8");
  console.log(`[sitemap] Wrote sitemap.xml (${urls.length} URL entries) and robots.txt`);
}

main().catch((err) => {
  console.warn("[sitemap] Warning:", err.message);
  process.exit(0);
});
