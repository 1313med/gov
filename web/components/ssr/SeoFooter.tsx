import type { SeoLang } from "@/lib/site";
import { buildSeoPath } from "@client-seo/seoPaths";
import { MOROCCO_CITIES, cityRentalPath, citySalePath } from "@client-seo/catalog/cities";
import { CAR_BRANDS } from "@client-seo/catalog/brands";
import { PRO_PAGES } from "@client-seo/catalog/proPages";

export default function SeoFooter({ lang }: { lang: SeoLang }) {
  const L = {
    fr: { rental: "Location", sale: "Occasion", pro: "Pro", brands: "Marques", agencies: "Agences", dealers: "Concessionnaires", compare: "Comparatifs", blog: "Blog" },
    en: { rental: "Rental", sale: "Used cars", pro: "Pro", brands: "Brands", agencies: "Agencies", dealers: "Dealers", compare: "Compare", blog: "Blog" },
    ar: { rental: "تأجير", sale: "مستعملة", pro: "Pro", brands: "ماركات", agencies: "وكالات", dealers: "وكلاء", compare: "مقارنة", blog: "مدونة" },
  }[lang];

  return (
    <footer className="gv-footer">
      <div className="gv-wrap grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8 text-sm">
        <div>
          <h2>{L.rental}</h2>
          <ul className="space-y-1.5 list-none m-0 p-0">
            <li><a href={buildSeoPath(lang, "/location-voiture")}>Hub</a></li>
            {MOROCCO_CITIES.slice(0, 8).map((c) => (
              <li key={c.slug}><a href={buildSeoPath(lang, cityRentalPath(c.slug))}>{c.name[lang] || c.name.fr}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h2>{L.sale}</h2>
          <ul className="space-y-1.5 list-none m-0 p-0">
            <li><a href={buildSeoPath(lang, "/voiture-occasion")}>Hub</a></li>
            {MOROCCO_CITIES.slice(0, 6).map((c) => (
              <li key={c.slug}><a href={buildSeoPath(lang, citySalePath(c.slug))}>{c.name[lang] || c.name.fr}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h2>{L.brands}</h2>
          <ul className="space-y-1.5 list-none m-0 p-0">
            {CAR_BRANDS.slice(0, 6).map((b) => (
              <li key={b.slug}><a href={buildSeoPath(lang, `/marque/${b.slug}`)}>{b.name[lang] || b.name.fr}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h2>{L.pro}</h2>
          <ul className="space-y-1.5 list-none m-0 p-0">
            {PRO_PAGES.slice(0, 4).map((p) => (
              <li key={p.slug}><a href={buildSeoPath(lang, `/pro/${p.slug}`)}>{p.title[lang] || p.title.fr}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h2>{L.agencies}</h2>
          <ul className="space-y-1.5 list-none m-0 p-0">
            <li><a href={buildSeoPath(lang, "/agences")}>Hub</a></li>
            {MOROCCO_CITIES.slice(0, 5).map((c) => (
              <li key={c.slug}><a href={buildSeoPath(lang, `/agences/${c.slug}`)}>{c.name[lang] || c.name.fr}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h2>{L.dealers}</h2>
          <ul className="space-y-1.5 list-none m-0 p-0">
            <li><a href={buildSeoPath(lang, "/concessionnaires")}>Hub</a></li>
            {MOROCCO_CITIES.slice(0, 5).map((c) => (
              <li key={c.slug}><a href={buildSeoPath(lang, `/concessionnaires/${c.slug}`)}>{c.name[lang] || c.name.fr}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="gv-wrap mt-10 pt-8 border-t border-[var(--gv-bdr)] grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-sm">
        <div>
          <h2>Prix & données</h2>
          <ul className="space-y-1.5 list-none m-0 p-0">
            <li><a href={buildSeoPath(lang, "/marche")}>Intelligence marché</a></li>
            <li><a href={buildSeoPath(lang, "/prix/dacia/logan")}>Prix Dacia Logan</a></li>
            <li><a href={buildSeoPath(lang, "/fiche-technique/dacia/logan")}>Fiche technique</a></li>
          </ul>
        </div>
        <div>
          <h2>Fiabilité & TCO</h2>
          <ul className="space-y-1.5 list-none m-0 p-0">
            <li><a href={buildSeoPath(lang, "/fiabilite")}>Indice fiabilité</a></li>
            <li><a href={buildSeoPath(lang, "/recherches")}>Recherches</a></li>
            <li><a href={buildSeoPath(lang, "/cout-possession/dacia/logan")}>Coût possession</a></li>
          </ul>
        </div>
        <div>
          <h2>Assurance</h2>
          <ul className="space-y-1.5 list-none m-0 p-0">
            <li><a href={buildSeoPath(lang, "/assurance")}>Hub</a></li>
            <li><a href={buildSeoPath(lang, "/assurance/assurance-automobile-maroc")}>RC & tous risques</a></li>
          </ul>
        </div>
        <div>
          <h2>Financement</h2>
          <ul className="space-y-1.5 list-none m-0 p-0">
            <li><a href={buildSeoPath(lang, "/financement")}>Hub</a></li>
            <li><a href={buildSeoPath(lang, "/financement/credit-auto-maroc")}>Crédit auto</a></li>
          </ul>
        </div>
        <div>
          <h2>Possession</h2>
          <ul className="space-y-1.5 list-none m-0 p-0">
            <li><a href={buildSeoPath(lang, "/possession")}>Timelines</a></li>
            <li><a href={buildSeoPath(lang, "/demarches")}>Transfert & CT</a></li>
          </ul>
        </div>
        <div>
          <h2>Communauté</h2>
          <ul className="space-y-1.5 list-none m-0 p-0">
            <li><a href={buildSeoPath(lang, "/questions")}>Q&A expert</a></li>
            <li><a href={buildSeoPath(lang, "/assistant-achat")}>Assistant achat</a></li>
          </ul>
        </div>
      </div>
      <div className="gv-wrap mt-8 pt-6 border-t border-[var(--gv-bdr)] text-center text-xs text-[var(--gv-mut)]">
        <p>
          <strong className="text-[var(--gv-brand)] font-[family-name:var(--gv-disp)]">GoVoiture</strong> — écosystème automobile Maroc
        </p>
      </div>
    </footer>
  );
}
