import type { SeoLang } from "@/lib/site";
import { buildSeoPath } from "@client-seo/seoPaths";
import { MOROCCO_CITIES, cityRentalPath, citySalePath } from "@client-seo/catalog/cities";
import { RENTAL_CATEGORIES } from "@client-seo/catalog/categories";
import { CAR_BRANDS } from "@client-seo/catalog/brands";
import { PRO_PAGES } from "@client-seo/catalog/proPages";

export default function SeoFooter({ lang }: { lang: SeoLang }) {
  const L = {
    fr: { rental: "Location", sale: "Occasion", pro: "Pro", brands: "Marques", agencies: "Agences", dealers: "Concessionnaires", compare: "Comparatifs", blog: "Blog" },
    en: { rental: "Rental", sale: "Used cars", pro: "Pro", brands: "Brands", agencies: "Agencies", dealers: "Dealers", compare: "Compare", blog: "Blog" },
    ar: { rental: "تأجير", sale: "مستعملة", pro: "Pro", brands: "ماركات", agencies: "وكالات", dealers: "وكلاء", compare: "مقارنة", blog: "مدونة" },
  }[lang];

  return (
    <footer className="border-t border-gray-200 mt-16 py-10 text-sm text-gray-600">
      <div className="mx-auto max-w-6xl px-4 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
        <div>
          <h2 className="font-semibold text-gray-900 mb-2">{L.rental}</h2>
          <ul className="space-y-1">
            <li><a href={buildSeoPath(lang, "/location-voiture")} className="hover:text-violet-600">Hub</a></li>
            {MOROCCO_CITIES.slice(0, 8).map((c: { slug: string; name: Record<string, string> }) => (
              <li key={c.slug}>
                <a href={buildSeoPath(lang, cityRentalPath(c.slug))} className="hover:text-violet-600">
                  {c.name[lang] || c.name.fr}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 mb-2">{L.sale}</h2>
          <ul className="space-y-1">
            <li><a href={buildSeoPath(lang, "/voiture-occasion")} className="hover:text-violet-600">Hub</a></li>
            {MOROCCO_CITIES.slice(0, 6).map((c: { slug: string; name: Record<string, string> }) => (
              <li key={c.slug}>
                <a href={buildSeoPath(lang, citySalePath(c.slug))} className="hover:text-violet-600">
                  {c.name[lang] || c.name.fr}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 mb-2">{L.brands}</h2>
          <ul className="space-y-1">
            {CAR_BRANDS.slice(0, 6).map((b: { slug: string; name: Record<string, string> }) => (
              <li key={b.slug}>
                <a href={buildSeoPath(lang, `/marque/${b.slug}`)} className="hover:text-violet-600">
                  {b.name[lang] || b.name.fr}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 mb-2">{L.pro}</h2>
          <ul className="space-y-1">
            {PRO_PAGES.slice(0, 4).map((p: { slug: string; title: Record<string, string> }) => (
              <li key={p.slug}>
                <a href={buildSeoPath(lang, `/pro/${p.slug}`)} className="hover:text-violet-600">
                  {p.title[lang] || p.title.fr}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 mb-2">{L.agencies}</h2>
          <ul className="space-y-1">
            <li><a href={buildSeoPath(lang, "/agences")} className="hover:text-violet-600">Hub</a></li>
            {MOROCCO_CITIES.slice(0, 5).map((c) => (
              <li key={c.slug}>
                <a href={buildSeoPath(lang, `/agences/${c.slug}`)} className="hover:text-violet-600">
                  {c.name[lang] || c.name.fr}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 mb-2">{L.dealers}</h2>
          <ul className="space-y-1">
            <li><a href={buildSeoPath(lang, "/concessionnaires")} className="hover:text-violet-600">Hub</a></li>
            {MOROCCO_CITIES.slice(0, 5).map((c) => (
              <li key={c.slug}>
                <a href={buildSeoPath(lang, `/concessionnaires/${c.slug}`)} className="hover:text-violet-600">
                  {c.name[lang] || c.name.fr}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 mb-2">{L.compare}</h2>
          <ul className="space-y-1">
            <li><a href={buildSeoPath(lang, "/comparer")} className="hover:text-violet-600">Hub</a></li>
            <li><a href={buildSeoPath(lang, "/comparer/dacia-logan-vs-renault-clio")} className="hover:text-violet-600">Logan vs Clio</a></li>
            <li><a href={buildSeoPath(lang, "/comparer/hyundai-i10-vs-kia-picanto")} className="hover:text-violet-600">i10 vs Picanto</a></li>
            <li><a href={buildSeoPath(lang, "/blog")} className="hover:text-violet-600">{L.blog}</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 mt-8 pt-8 border-t border-gray-100 grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        <div>
          <h2 className="font-semibold text-gray-900 mb-2">Prix & données</h2>
          <ul className="space-y-1">
            <li><a href={buildSeoPath(lang, "/prix/dacia/logan")} className="hover:text-violet-600">Prix Dacia Logan</a></li>
            <li><a href={buildSeoPath(lang, "/fiche-technique/dacia/logan")} className="hover:text-violet-600">Fiche technique</a></li>
            <li><a href={buildSeoPath(lang, "/donnees/prix/dacia/logan")} className="hover:text-violet-600">Dataset prix</a></li>
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 mb-2">Assurance</h2>
          <ul className="space-y-1">
            <li><a href={buildSeoPath(lang, "/assurance")} className="hover:text-violet-600">Hub</a></li>
            <li><a href={buildSeoPath(lang, "/assurance/assurance-automobile-maroc")} className="hover:text-violet-600">RC & tous risques</a></li>
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 mb-2">Financement</h2>
          <ul className="space-y-1">
            <li><a href={buildSeoPath(lang, "/financement")} className="hover:text-violet-600">Hub</a></li>
            <li><a href={buildSeoPath(lang, "/financement/credit-auto-maroc")} className="hover:text-violet-600">Crédit auto</a></li>
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 mb-2">Démarches & Q&A</h2>
          <ul className="space-y-1">
            <li><a href={buildSeoPath(lang, "/demarches")} className="hover:text-violet-600">Transfert & CT</a></li>
            <li><a href={buildSeoPath(lang, "/questions")} className="hover:text-violet-600">Questions</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
