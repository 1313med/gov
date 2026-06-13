/**
 * Post-build prerender — injects per-route meta into static HTML for crawlers.
 * Generates dist subfolder index.html shells alongside the SPA bundle.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "..", "dist");
const SITE_URL = (process.env.VITE_SITE_URL || "https://goovoiture.ma").replace(/\/+$/, "");

const PRERENDER_ROUTES = [
  { path: "/", title: "Goovoiture — Location de voiture & vente auto au Maroc", description: "Louez ou achetez une voiture au Maroc." },
  { path: "/location-voiture", title: "Location de voiture au Maroc | GoVoiture", description: "Hub location — 45 villes, aéroports et catégories." },
  { path: "/voiture-occasion", title: "Voiture occasion Maroc | GoVoiture", description: "Acheter et vendre des voitures d'occasion au Maroc." },
  { path: "/location-voiture/casablanca", title: "Location voiture Casablanca | GoVoiture", description: "Louer une voiture à Casablanca pas cher." },
  { path: "/location-voiture/casablanca/suv-4x4", title: "Location SUV Casablanca | GoVoiture", description: "Louez un SUV à Casablanca." },
  { path: "/location-voiture-aeroport/mohammed-v-casablanca", title: "Location voiture aéroport Mohammed V | GoVoiture", description: "Voiture à l'aéroport CMN." },
  { path: "/voiture-occasion/casablanca", title: "Voiture occasion Casablanca | GoVoiture", description: "Annonces occasion à Casablanca." },
  { path: "/marque/dacia", title: "Dacia Maroc — Location & occasion | GoVoiture", description: "Dacia au Maroc." },
  { path: "/pro", title: "GoVoiture Pro — Logiciel agence location", description: "SaaS pour agences de location au Maroc." },
  { path: "/pro/crm", title: "CRM agence location | GoVoiture Pro", description: "CRM pour agences de location." },
  { path: "/blog", title: "Blog automobile Maroc | GoVoiture", description: "Guides location et occasion." },
  { path: "/blog/location-voiture/location-voiture-maroc-guide-complet", title: "Location voiture Maroc guide 2026", description: "Guide complet location voiture." },
  { path: "/a-propos", title: "À propos | GoVoiture", description: "Écosystème automobile marocain." },
];

function injectHead(html, { title, description, canonical }) {
  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  if (out.includes('name="description"')) {
    out = out.replace(/name="description" content="[^"]*"/, `name="description" content="${description.replace(/"/g, "&quot;")}"`);
  }
  const canonicalTag = `<link rel="canonical" href="${canonical}" />`;
  if (out.includes('rel="canonical"')) {
    out = out.replace(/<link rel="canonical" href="[^"]*" \/>/, canonicalTag);
  } else {
    out = out.replace("</head>", `    ${canonicalTag}\n  </head>`);
  }
  return out;
}

function main() {
  const indexPath = join(distDir, "index.html");
  if (!existsSync(indexPath)) {
    console.warn("[prerender] dist/index.html not found — skip");
    return;
  }
  const template = readFileSync(indexPath, "utf8");
  let count = 0;
  for (const route of PRERENDER_ROUTES) {
    const canonical = `${SITE_URL}${route.path}`;
    const html = injectHead(template, { ...route, canonical });
    if (route.path === "/") continue;
    const dir = join(distDir, route.path.replace(/^\//, ""));
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), html, "utf8");
    count += 1;
  }
  writeFileSync(indexPath, injectHead(template, { ...PRERENDER_ROUTES[0], canonical: SITE_URL }), "utf8");
  console.log(`[prerender] Wrote ${count + 1} HTML shells with injected meta`);
}

main();
