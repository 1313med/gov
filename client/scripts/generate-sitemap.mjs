/**
 * Build-time sitemap + robots.txt for public French SEO pages.
 * Run: node scripts/generate-sitemap.mjs (before vite build)
 *
 * Env (Vercel): VITE_SITE_URL, VITE_API_URL
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const SITE_URL = (process.env.VITE_SITE_URL || "https://goovoiture.ma").replace(/\/+$/, "");
const API_BASE = (process.env.VITE_API_URL || "https://goovoiture-api.onrender.com/api").replace(/\/+$/, "");

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/rentals", priority: "0.9", changefreq: "daily" },
  { path: "/cars", priority: "0.9", changefreq: "daily" },
  { path: "/buying-guide", priority: "0.5", changefreq: "monthly" },
  { path: "/mechanic-prices", priority: "0.5", changefreq: "monthly" },
  { path: "/community", priority: "0.5", changefreq: "weekly" },
  { path: "/afford-car", priority: "0.4", changefreq: "monthly" },
  { path: "/emergency", priority: "0.4", changefreq: "monthly" },
];

const today = new Date().toISOString().slice(0, 10);

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

function urlEntry(loc, priority, changefreq) {
  return `  <url>
    <loc>${xmlEscape(loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function main() {
  console.log("[sitemap] Site:", SITE_URL);
  console.log("[sitemap] API:", API_BASE);

  const [sales, rentals] = await Promise.all([fetchAllSales(), fetchAllRentals()]);
  console.log(`[sitemap] Listings: ${sales.length} sales, ${rentals.length} rentals`);

  const urls = [];

  for (const p of STATIC_PAGES) {
    urls.push(urlEntry(`${SITE_URL}${p.path}`, p.priority, p.changefreq));
  }

  for (const s of sales) {
    if (s._id) urls.push(urlEntry(`${SITE_URL}/cars/${s._id}`, "0.7", "weekly"));
  }

  for (const r of rentals) {
    if (r._id) urls.push(urlEntry(`${SITE_URL}/rentals/${r._id}`, "0.7", "weekly"));
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

  writeFileSync(join(publicDir, "sitemap.xml"), sitemap, "utf8");

  const robots = `# Goovoiture — SEO (pages publiques)
User-agent: *
Allow: /
Allow: /cars
Allow: /rentals
Allow: /buying-guide
Allow: /mechanic-prices
Allow: /community
Allow: /afford-car
Allow: /emergency

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
  console.log(`[sitemap] Wrote sitemap.xml (${urls.length} URLs) and robots.txt`);
}

main().catch((err) => {
  console.warn("[sitemap] Warning:", err.message);
  process.exit(0);
});
