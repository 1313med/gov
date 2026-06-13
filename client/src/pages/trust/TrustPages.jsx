import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import SeoHead from "../../components/SeoHead";
import { buildSeoPath, parseSeoPath } from "../../seo/seoPaths";
import { getSiteUrl } from "../../seo/seoLocales";
import { graphJsonLd, organizationJsonLd } from "../../seo/jsonLd";

const TEAM = [
  { slug: "yassine-bensalem", name: "Yassine Bensalem", role: { fr: "CEO & Fondateur", en: "CEO & Founder", ar: "المؤسس" } },
  { slug: "nora-haddad", name: "Nora Haddad", role: { fr: "Directrice Produit", en: "Head of Product", ar: "مديرة المنتج" } },
  { slug: "adam-el-amrani", name: "Adam El Amrani", role: { fr: "Responsable SEO", en: "SEO Lead", ar: "مسؤول SEO" } },
];

export function AboutPage() {
  const { pathname } = useLocation();
  const { lang } = parseSeoPath(pathname);
  const siteUrl = getSiteUrl();
  return (
    <TrustShell
      title={lang === "fr" ? "À propos de Goovoiture" : "About Goovoiture"}
      description={lang === "fr" ? "L'écosystème automobile marocain : location, vente et SaaS pro." : "Morocco automotive ecosystem."}
      canonical={`${siteUrl}${buildSeoPath(lang, "/a-propos")}`}
    >
      <p className="leading-relaxed text-gray-600 dark:text-gray-400">
        {lang === "fr"
          ? "Goovoiture connecte conducteurs, acheteurs, vendeurs et agences de location à travers tout le Maroc. Notre mission : devenir la plateforme de référence pour la mobilité automobile."
          : "Goovoiture connects drivers, buyers, sellers and rental agencies across Morocco."}
      </p>
    </TrustShell>
  );
}

export function TeamPage() {
  const { pathname } = useLocation();
  const { lang } = parseSeoPath(pathname);
  return (
    <TrustShell title={lang === "fr" ? "Notre équipe" : "Our team"} description="Goovoiture team" canonical={`${getSiteUrl()}${buildSeoPath(lang, "/equipe")}`}>
      <ul className="grid sm:grid-cols-3 gap-6">
        {TEAM.map((m) => (
          <li key={m.slug} className="p-4 rounded-xl border border-gray-200 dark:border-white/10">
            <h2 className="font-semibold">{m.name}</h2>
            <p className="text-sm text-gray-500">{m.role[lang] || m.role.fr}</p>
          </li>
        ))}
      </ul>
    </TrustShell>
  );
}

export function ReviewsPage() {
  const { pathname } = useLocation();
  const { lang } = parseSeoPath(pathname);
  return (
    <TrustShell title={lang === "fr" ? "Avis clients" : "Customer reviews"} description="Goovoiture reviews" canonical={`${getSiteUrl()}${buildSeoPath(lang, "/avis")}`}>
      <div className="space-y-6">
        {[
          { name: "Adam B.", text: lang === "fr" ? "Réservation premium en quelques minutes." : "Premium booking in minutes." },
          { name: "Nora H.", text: lang === "fr" ? "Vendre ma voiture a été simple et sécurisé." : "Selling was simple and secure." },
        ].map((r) => (
          <blockquote key={r.name} className="border-l-4 border-violet-400 pl-4">
            <p>{r.text}</p>
            <footer className="text-sm text-gray-500 mt-2">— {r.name}</footer>
          </blockquote>
        ))}
      </div>
    </TrustShell>
  );
}

export function PartnersPage() {
  const { pathname } = useLocation();
  const { lang } = parseSeoPath(pathname);
  return (
    <TrustShell title={lang === "fr" ? "Partenaires" : "Partners"} description="Goovoiture partners" canonical={`${getSiteUrl()}${buildSeoPath(lang, "/partenaires")}`}>
      <p className="text-gray-600 dark:text-gray-400">
        {lang === "fr" ? "Agences de location, hôtels, tour-opérateurs et médias — rejoignez l'écosystème Goovoiture." : "Join the Goovoiture partner ecosystem."}
      </p>
      <Link to={buildSeoPath(lang, "/pro")} className="inline-block mt-6 text-violet-600 font-medium">Goovoiture Pro →</Link>
    </TrustShell>
  );
}

export function CaseStudiesPage() {
  const { pathname } = useLocation();
  const { lang } = parseSeoPath(pathname);
  return (
    <TrustShell title={lang === "fr" ? "Études de cas" : "Case studies"} description="Goovoiture Pro case studies" canonical={`${getSiteUrl()}${buildSeoPath(lang, "/etudes-de-cas")}`}>
      <article className="mb-8 p-6 rounded-xl border border-gray-200 dark:border-white/10">
        <h2 className="font-semibold text-lg">{lang === "fr" ? "Agence Casablanca +40% réservations" : "Casablanca agency +40% bookings"}</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{lang === "fr" ? "Migration vers Goovoiture Pro : CRM, site web et SEO local." : "Migration to Goovoiture Pro."}</p>
      </article>
    </TrustShell>
  );
}

function TrustShell({ title, description, canonical, children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05060f]">
      <SeoHead override={{ title: `${title} | Goovoiture`, description, canonical }} jsonLdExtra={organizationJsonLd()} />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">{title}</h1>
        {children}
      </div>
    </div>
  );
}
