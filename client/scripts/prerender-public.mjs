/**
 * Post-build prerender — injects per-route meta + static SEO body for crawlers (view-source).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "..", "dist");
const SITE_URL = (process.env.VITE_SITE_URL || "https://goovoiture.ma").replace(/\/+$/, "");

const HOME = {
  title: "Goovoiture — Location de voiture & vente auto au Maroc",
  description:
    "Louez ou achetez une voiture au Maroc. Location de voiture, marketplace automobile et annonces vérifiées à Casablanca, Rabat, Marrakech et partout au Maroc.",
  h1: "Location de voiture et vente automobile au Maroc",
  intro:
    "Goovoiture est la plateforme marocaine pour louer une voiture ou acheter un véhicule d'occasion. Comparez les offres dans 45 villes, les aéroports et toutes les catégories — location, occasion, GoVoiture Pro pour les agences.",
  keywords:
    "location voiture maroc, voiture occasion maroc, goovoiture, location voiture casablanca",
};

const HOME_FAQS = [
  {
    q: "Quel est le prix moyen d'une location voiture au Maroc ?",
    a: "Comptez entre 180 et 600 MAD/jour selon la catégorie (économique, SUV, automatique).",
  },
  {
    q: "Quels documents pour louer une voiture au Maroc ?",
    a: "Permis de conduire valide, CIN ou passeport, et parfois une caution selon l'agence.",
  },
  {
    q: "Puis-je réserver en ligne sur GoVoiture ?",
    a: "Oui — parcourez les annonces, comparez les tarifs et réservez ou contactez l'agence en quelques clics.",
  },
];

const PRERENDER_ROUTES = [
  { path: "/", ...HOME },
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

const HREFLANG = [
  { lang: "fr-MA", href: SITE_URL },
  { lang: "en-MA", href: `${SITE_URL}/en` },
  { lang: "ar-MA", href: `${SITE_URL}/ar` },
  { lang: "x-default", href: SITE_URL },
];

function jsonLdGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Goovoiture",
        url: SITE_URL,
        logo: `${SITE_URL}/og-default.svg`,
        description: HOME.intro,
        areaServed: { "@type": "Country", name: "Morocco" },
      },
      {
        "@type": "WebSite",
        name: "Goovoiture",
        url: SITE_URL,
        inLanguage: ["fr-MA", "ar-MA", "en-MA"],
      },
      {
        "@type": "FAQPage",
        mainEntity: HOME_FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [{ "@type": "ListItem", position: 1, name: "Goovoiture", item: SITE_URL }],
      },
    ],
  };
}

function injectHead(html, { title, description, canonical, keywords }) {
  let out = html;
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  if (out.includes('name="description"')) {
    out = out.replace(/name="description" content="[^"]*"/, `name="description" content="${description.replace(/"/g, "&quot;")}"`);
  }
  if (keywords && out.includes('name="keywords"')) {
    out = out.replace(/name="keywords" content="[^"]*"/, `name="keywords" content="${keywords.replace(/"/g, "&quot;")}"`);
  }
  const canonicalTag = `<link rel="canonical" href="${canonical}" />`;
  if (out.includes('rel="canonical"')) {
    out = out.replace(/<link rel="canonical" href="[^"]*" \/>/, canonicalTag);
  } else {
    out = out.replace("</head>", `    ${canonicalTag}\n  </head>`);
  }
  const altLinks = HREFLANG.map((h) => {
    const href =
      h.lang === "en-MA" ? `${SITE_URL}/en` : h.lang === "ar-MA" ? `${SITE_URL}/ar` : canonical;
    return `<link rel="alternate" hreflang="${h.lang}" href="${href}" />`;
  }).join("\n    ");
  out = out.replace("</head>", `    ${altLinks}\n    <script type="application/ld+json">${JSON.stringify(jsonLdGraph())}</script>\n  </head>`);
  return out;
}

function injectHomeBody(html) {
  const faqHtml = HOME_FAQS.map(
    (f) => `<div><dt>${f.q}</dt><dd>${f.a}</dd></div>`
  ).join("");
  const block = `
    <div id="goovoiture-seo-prerender">
      <nav aria-label="Breadcrumb"><ol><li>Goovoiture</li></ol></nav>
      <h1>${HOME.h1}</h1>
      <p>${HOME.intro}</p>
      <section aria-label="Questions fréquentes">
        <h2>Questions fréquentes</h2>
        <dl>${faqHtml}</dl>
      </section>
    </div>`;
  return html.replace("<div id=\"root\">", `${block}\n    <div id="root">`);
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
    const canonical = `${SITE_URL}${route.path === "/" ? "" : route.path}`;
    let html = injectHead(template, { ...route, canonical });
    if (route.path === "/") html = injectHomeBody(html);
    if (route.path === "/") {
      writeFileSync(indexPath, html, "utf8");
      count += 1;
      continue;
    }
    const dir = join(distDir, route.path.replace(/^\//, ""));
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), html, "utf8");
    count += 1;
  }
  console.log(`[prerender] Wrote ${count} HTML shells with SEO meta + homepage body`);
}

main();
