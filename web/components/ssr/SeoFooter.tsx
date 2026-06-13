import type { SeoLang } from "@/lib/site";
import { buildSeoPath } from "@client-seo/seoPaths";
import { MOROCCO_CITIES, cityRentalPath, citySalePath } from "@client-seo/catalog/cities";
import { RENTAL_CATEGORIES } from "@client-seo/catalog/categories";
import { CAR_BRANDS } from "@client-seo/catalog/brands";
import { PRO_PAGES } from "@client-seo/catalog/proPages";

export default function SeoFooter({ lang }: { lang: SeoLang }) {
  const L = {
    fr: { rental: "Location", sale: "Occasion", pro: "Pro", brands: "Marques" },
    en: { rental: "Rental", sale: "Used cars", pro: "Pro", brands: "Brands" },
    ar: { rental: "تأجير", sale: "مستعملة", pro: "Pro", brands: "ماركات" },
  }[lang];

  return (
    <footer className="border-t border-gray-200 mt-16 py-10 text-sm text-gray-600">
      <div className="mx-auto max-w-6xl px-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
            {PRO_PAGES.slice(0, 5).map((p: { slug: string; title: Record<string, string> }) => (
              <li key={p.slug}>
                <a href={buildSeoPath(lang, `/pro/${p.slug}`)} className="hover:text-violet-600">
                  {p.title[lang] || p.title.fr}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
