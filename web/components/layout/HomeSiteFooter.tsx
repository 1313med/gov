import type { SeoLang } from "@/lib/site";
import { HOME_SHELL_COPY } from "@/lib/homeShellCopy";
import { buildSeoPath } from "@client-seo/seoPaths";
import { MOROCCO_CITIES, cityRentalPath, citySalePath } from "@client-seo/catalog/cities";
import { RENTAL_CATEGORIES } from "@client-seo/catalog/categories";
import { CAR_BRANDS } from "@client-seo/catalog/brands";
import { MOROCCO_AIRPORTS, airportRentalPath } from "@client-seo/catalog/airports";
import { PRO_PAGES } from "@client-seo/catalog/proPages";

const TOP_CITIES = MOROCCO_CITIES.slice(0, 12);

function HomeSeoLinkGrid({ lang }: { lang: SeoLang }) {
  const L = {
    fr: {
      rental: "Location voiture",
      sale: "Voiture occasion",
      airports: "Aéroports",
      categories: "Catégories",
      brands: "Marques",
      pro: "Goovoiture Pro",
      guides: "Guides",
      trust: "Confiance",
      allCities: "Toutes les villes →",
    },
    en: {
      rental: "Car rental",
      sale: "Used cars",
      airports: "Airports",
      categories: "Categories",
      brands: "Brands",
      pro: "Goovoiture Pro",
      guides: "Guides",
      trust: "Trust",
      allCities: "All cities →",
    },
    ar: {
      rental: "تأجير السيارات",
      sale: "سيارات مستعملة",
      airports: "المطارات",
      categories: "الفئات",
      brands: "العلامات",
      pro: "Goovoiture Pro",
      guides: "أدلة",
      trust: "الثقة",
      allCities: "كل المدن →",
    },
  }[lang];

  return (
    <footer className="seo-footer border-t border-gray-200/70 dark:border-white/10 bg-gray-50/80 dark:bg-[#080c18] mt-16">
      <div className="mx-auto max-w-6xl px-4 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{L.rental}</h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400 list-none m-0 p-0">
            <li>
              <a href={buildSeoPath(lang, "/location-voiture")} className="hover:text-violet-600">
                {lang === "fr" ? "Hub location Maroc" : lang === "ar" ? "تأجير في المغرب" : "Morocco rental hub"}
              </a>
            </li>
            {TOP_CITIES.map((c) => (
              <li key={c.slug}>
                <a href={buildSeoPath(lang, cityRentalPath(c.slug))} className="hover:text-violet-600">
                  {c.name[lang] || c.name.fr}
                </a>
              </li>
            ))}
            <li>
              <a href={buildSeoPath(lang, "/location-voiture")} className="text-violet-600 font-medium">
                {L.allCities}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{L.sale}</h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400 list-none m-0 p-0">
            <li>
              <a href={buildSeoPath(lang, "/voiture-occasion")} className="hover:text-violet-600">
                {lang === "fr" ? "Hub occasion Maroc" : "Used cars hub"}
              </a>
            </li>
            {TOP_CITIES.slice(0, 8).map((c) => (
              <li key={c.slug}>
                <a href={buildSeoPath(lang, citySalePath(c.slug))} className="hover:text-violet-600">
                  {lang === "fr" ? `Occasion ${c.name.fr}` : c.name[lang] || c.name.fr}
                </a>
              </li>
            ))}
            <li>
              <a href={buildSeoPath(lang, "/vendre-ma-voiture")} className="hover:text-violet-600">
                {HOME_SHELL_COPY[lang].footer.sellCar}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{L.categories}</h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400 mb-6 list-none m-0 p-0">
            {RENTAL_CATEGORIES.slice(0, 6).map((cat) => (
              <li key={cat.slug}>
                <a
                  href={buildSeoPath(lang, `/location-voiture/casablanca/${cat.slug}`)}
                  className="hover:text-violet-600"
                >
                  {cat.name[lang] || cat.name.fr}
                </a>
              </li>
            ))}
          </ul>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{L.airports}</h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400 list-none m-0 p-0">
            {MOROCCO_AIRPORTS.slice(0, 6).map((a) => (
              <li key={a.slug}>
                <a href={buildSeoPath(lang, airportRentalPath(a.slug))} className="hover:text-violet-600">
                  {a.iata}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{L.brands}</h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400 mb-6 list-none m-0 p-0">
            {CAR_BRANDS.slice(0, 8).map((b) => (
              <li key={b.slug}>
                <a href={buildSeoPath(lang, `/marque/${b.slug}`)} className="hover:text-violet-600">
                  {b.name[lang] || b.name.fr}
                </a>
              </li>
            ))}
          </ul>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{L.pro}</h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400 list-none m-0 p-0">
            {PRO_PAGES.slice(0, 5).map((p) => (
              <li key={p.slug}>
                <a href={buildSeoPath(lang, `/pro/${p.slug}`)} className="hover:text-violet-600">
                  {p.title[lang] || p.title.fr}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200/60 dark:border-white/10 py-6 px-4">
        <div className="mx-auto max-w-6xl flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-500">
          <a href={buildSeoPath(lang, "/a-propos")} className="hover:text-violet-600">
            {lang === "fr" ? "À propos" : "About"}
          </a>
          <a href={buildSeoPath(lang, "/blog")} className="hover:text-violet-600">
            {L.guides}
          </a>
          <a href={buildSeoPath(lang, "/avis")} className="hover:text-violet-600">
            {lang === "fr" ? "Avis clients" : "Reviews"}
          </a>
          <a href={buildSeoPath(lang, "/partenaires")} className="hover:text-violet-600">
            {lang === "fr" ? "Partenaires" : "Partners"}
          </a>
          <a href={buildSeoPath(lang, "/conditions-utilisation")} className="hover:text-violet-600">
            CGU
          </a>
          <a href={buildSeoPath(lang, "/politique-confidentialite")} className="hover:text-violet-600">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}

function BrandedFooter({ lang }: { lang: SeoLang }) {
  const copy = HOME_SHELL_COPY[lang].footer;
  const year = new Date().getFullYear();

  return (
    <footer className="hx-ft">
      <div className="hx-ft-inner">
        <div className="hx-ft-top">
          <div>
            <div className="hx-ft-logo">
              Goo<em>voiture</em>
            </div>
            <p className="hx-ft-tag">{copy.tag}</p>
          </div>
          <div>
            <p className="hx-ft-ch">{copy.platform}</p>
            <a href="/cars" className="hx-ft-link">
              {copy.buyCars}
            </a>
            <a href="/rentals" className="hx-ft-link">
              {copy.rentCars}
            </a>
            <a href="/vendre-ma-voiture" className="hx-ft-link">
              {copy.sellCar}
            </a>
            <a href="/login" className="hx-ft-link">
              {copy.signIn}
            </a>
          </div>
          <div>
            <p className="hx-ft-ch">{copy.account}</p>
            <a href="/register" className="hx-ft-link">
              {copy.register}
            </a>
            <a href="/login" className="hx-ft-link">
              {copy.login}
            </a>
          </div>
          <div>
            <p className="hx-ft-ch">{copy.legal}</p>
            <a href={buildSeoPath(lang, "/conditions-utilisation")} className="hx-ft-link">
              {copy.terms}
            </a>
            <a href={buildSeoPath(lang, "/politique-confidentialite")} className="hx-ft-link">
              {copy.privacy}
            </a>
          </div>
        </div>
        <div className="hx-ft-bot">
          <span>
            © {year} <em>Goovoiture</em> — {copy.copy}
          </span>
          <span>{copy.built}</span>
        </div>
      </div>
    </footer>
  );
}

export default function HomeSiteFooter({ lang }: { lang: SeoLang }) {
  return (
    <>
      <HomeSeoLinkGrid lang={lang} />
      <BrandedFooter lang={lang} />
    </>
  );
}
