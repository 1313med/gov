import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import SeoPageShell from "@/components/layout/SeoPageShell";
import JsonLd from "@/components/ssr/JsonLd";
import { RelatedLinksSection } from "@/components/ui/PremiumCTA";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, organizationJsonLd, breadcrumbJsonLd } from "@client-seo/jsonLd";

export type TrustPageSlug = "a-propos" | "equipe" | "avis" | "partenaires";

const TEAM = [
  {
    name: "Yassine Bensalem",
    role: { fr: "CEO & Fondateur", en: "CEO & Founder", ar: "المؤسس والرئيس التنفيذي" },
    bio: {
      fr: "Entrepreneur marocain passionné par la mobilité et la digitalisation du secteur automobile.",
      en: "Moroccan entrepreneur focused on mobility and automotive digitization.",
      ar: "رائد أعمال مغربي متخصص في التنقل والتحول الرقمي للسيارات.",
    },
  },
  {
    name: "Nora Haddad",
    role: { fr: "Directrice Produit", en: "Head of Product", ar: "مديرة المنتج" },
    bio: {
      fr: "Pilote l'expérience utilisateur, la marketplace et Goovoiture Pro pour les agences.",
      en: "Leads user experience, marketplace and Goovoiture Pro for agencies.",
      ar: "تقود تجربة المستخدم والسوق وGoovoiture Pro للوكالات.",
    },
  },
  {
    name: "Adam El Amrani",
    role: { fr: "Responsable SEO & Contenu", en: "SEO & Content Lead", ar: "مسؤول SEO والمحتوى" },
    bio: {
      fr: "Construit l'écosystème éditorial auto Maroc : guides, comparatifs et pages villes.",
      en: "Builds Morocco automotive content: guides, comparisons and city pages.",
      ar: "يبني المحتوى السيارات في المغرب: أدلة ومقارنات وصفحات المدن.",
    },
  },
];

const REVIEWS = [
  {
    name: "Adam B.",
    role: { fr: "Client location", en: "Rental customer", ar: "عميل كراء" },
    text: {
      fr: "Réservation simple et rapide. J'ai trouvé une voiture à Casablanca en quelques minutes avec des tarifs clairs.",
      en: "Simple and fast booking. I found a car in Casablanca within minutes with transparent pricing.",
      ar: "حجز سريع وبسيط. وجدت سيارة في الدار البيضاء خلال دقائق بأسعار واضحة.",
    },
  },
  {
    name: "Nora H.",
    role: { fr: "Vendeuse particulière", en: "Private seller", ar: "بائعة" },
    text: {
      fr: "Vendre ma voiture sur Goovoiture a été fluide : annonce modérée, acheteurs sérieux et messagerie intégrée.",
      en: "Selling my car on Goovoiture was smooth: moderated listing, serious buyers and built-in messaging.",
      ar: "بيع سيارتي على Goovoiture كان سلساً: إعلان موثوق ومشترون جادون.",
    },
  },
  {
    name: "Karim T.",
    role: { fr: "Agence de location, Rabat", en: "Rental agency, Rabat", ar: "وكالة كراء، الرباط" },
    text: {
      fr: "Goovoiture Pro nous aide à gérer les réservations et à être visibles sur les recherches locales.",
      en: "Goovoiture Pro helps us manage bookings and local search visibility.",
      ar: "Goovoiture Pro يساعدنا على إدارة الحجوزات والظهور في البحث المحلي.",
    },
  },
];

function metaFor(slug: TrustPageSlug, lang: SeoLang) {
  const map: Record<TrustPageSlug, Record<SeoLang, { title: string; description: string; h1: string; intro: string }>> = {
    "a-propos": {
      fr: {
        title: "À propos de Goovoiture | Goovoiture",
        description:
          "Goovoiture est la plateforme automobile marocaine pour louer, acheter, vendre et gérer votre véhicule. Découvrez notre mission et notre équipe.",
        h1: "À propos de Goovoiture",
        intro:
          "Goovoiture connecte conducteurs, acheteurs, vendeurs et agences de location à travers tout le Maroc.",
      },
      en: {
        title: "About Goovoiture | Goovoiture",
        description: "Goovoiture is Morocco's automotive platform to rent, buy, sell and manage vehicles.",
        h1: "About Goovoiture",
        intro: "Goovoiture connects drivers, buyers, sellers and rental agencies across Morocco.",
      },
      ar: {
        title: "عن Goovoiture | Goovoiture",
        description: "Goovoiture منصة السيارات في المغرب للكراء والبيع وإدارة المركبات.",
        h1: "عن Goovoiture",
        intro: "Goovoiture تربط السائقين والمشترين والبائعين ووكالات الكراء في المغرب.",
      },
    },
    equipe: {
      fr: {
        title: "Notre équipe | Goovoiture",
        description: "L'équipe Goovoiture : fondateurs, produit et SEO au service de la mobilité au Maroc.",
        h1: "Notre équipe",
        intro: "Des professionnels basés au Maroc, au service de la confiance et de la transparence automobile.",
      },
      en: {
        title: "Our team | Goovoiture",
        description: "The Goovoiture team building Morocco's automotive marketplace.",
        h1: "Our team",
        intro: "Morocco-based professionals focused on trust and transparency in automotive.",
      },
      ar: {
        title: "فريقنا | Goovoiture",
        description: "فريق Goovoiture الذي يبني سوق السيارات في المغرب.",
        h1: "فريقنا",
        intro: "محترفون مغاربة يركزون على الثقة والشفافية في قطاع السيارات.",
      },
    },
    avis: {
      fr: {
        title: "Avis clients Goovoiture | Goovoiture",
        description: "Avis et retours d'expérience de clients et agences sur Goovoiture au Maroc.",
        h1: "Avis clients",
        intro: "Ce que disent nos utilisateurs sur la location, la vente et Goovoiture Pro.",
      },
      en: {
        title: "Goovoiture customer reviews | Goovoiture",
        description: "Customer and agency feedback on Goovoiture in Morocco.",
        h1: "Customer reviews",
        intro: "What our users say about rentals, sales and Goovoiture Pro.",
      },
      ar: {
        title: "آراء العملاء | Goovoiture",
        description: "آراء العملاء والوكالات على Goovoiture في المغرب.",
        h1: "آراء العملاء",
        intro: "ما يقوله مستخدمونا عن الكراء والبيع وGoovoiture Pro.",
      },
    },
    partenaires: {
      fr: {
        title: "Partenaires Goovoiture | Goovoiture",
        description: "Agences de location, concessionnaires, hôtels et médias — rejoignez l'écosystème Goovoiture.",
        h1: "Partenaires",
        intro: "Goovoiture collabore avec des acteurs de la mobilité et du tourisme au Maroc.",
      },
      en: {
        title: "Goovoiture partners | Goovoiture",
        description: "Rental agencies, dealers, hotels and media — join the Goovoiture ecosystem.",
        h1: "Partners",
        intro: "Goovoiture partners with mobility and tourism players in Morocco.",
      },
      ar: {
        title: "شركاؤنا | Goovoiture",
        description: "وكالات الكراء والوكلاء والفنادق — انضم إلى منظومة Goovoiture.",
        h1: "شركاؤنا",
        intro: "Goovoiture تتعاون مع فاعلين في التنقل والسياحة في المغرب.",
      },
    },
  };
  return map[slug][lang];
}

export function trustMetadata(slug: TrustPageSlug, lang: SeoLang) {
  const meta = metaFor(slug, lang);
  return { basePath: `/${slug}`, title: meta.title, description: meta.description };
}

export default function TrustView({ lang, slug }: { lang: SeoLang; slug: TrustPageSlug }) {
  const siteUrl = getSiteUrl();
  const basePath = `/${slug}`;
  const meta = metaFor(slug, lang);
  const pageUrl = `${siteUrl}${buildSeoPath(lang, basePath)}`;

  const relatedLinks = [
    { label: lang === "fr" ? "Location voiture" : "Car rental", href: buildSeoPath(lang, "/location-voiture") },
    { label: lang === "fr" ? "Voiture occasion" : "Used cars", href: buildSeoPath(lang, "/voiture-occasion") },
    { label: "Goovoiture Pro", href: buildSeoPath(lang, "/pro") },
    { label: lang === "fr" ? "Blog & guides" : "Guides", href: buildSeoPath(lang, "/blog") },
  ];

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: meta.h1, href: undefined },
      ]}
      hero={{ kicker: "Goovoiture", title: meta.h1, description: meta.intro }}
      related={{ showListings: true, showBrands: false, showBlog: true }}
      jsonLd={
        <JsonLd
          data={graphJsonLd(
            organizationJsonLd(siteUrl),
            breadcrumbJsonLd([
              { name: "Goovoiture", url: siteUrl },
              { name: meta.h1, url: pageUrl },
            ])
          )}
        />
      }
    >
      {slug === "a-propos" ? (
        <div className="space-y-8 max-w-3xl">
          <section>
            <h2 className="gv-h2 mb-3">{lang === "fr" ? "Notre mission" : lang === "ar" ? "مهمتنا" : "Our mission"}</h2>
            <p className="text-[var(--gv-ink2)] leading-relaxed">
              {lang === "fr"
                ? "Goovoiture a pour ambition de devenir la plateforme de référence pour la mobilité automobile au Maroc : location de voiture, achat et vente d'occasion, outils pour propriétaires (Mon Garage) et solutions professionnelles pour les agences (Goovoiture Pro)."
                : lang === "ar"
                  ? "Goovoiture تهدف إلى أن تصبح المنصة المرجعية للتنقل السيارات في المغرب: الكراء، البيع والشراء، أدوات المالكين وGoovoiture Pro للوكالات."
                  : "Goovoiture aims to become Morocco's reference platform for automotive mobility: car rental, used-car sales, owner tools (My Garage) and professional solutions for agencies (Goovoiture Pro)."}
            </p>
          </section>
          <section>
            <h2 className="gv-h2 mb-3">{lang === "fr" ? "Ce que nous proposons" : "What we offer"}</h2>
            <ul className="list-disc pl-5 space-y-2 text-[var(--gv-ink2)]">
              <li>{lang === "fr" ? "Marketplace location & occasion dans 45 villes marocaines" : "Rental & used-car marketplace in 45 Moroccan cities"}</li>
              <li>{lang === "fr" ? "Annonces modérées et profils vérifiés" : "Moderated listings and verified profiles"}</li>
              <li>{lang === "fr" ? "Guides, comparatifs et indices prix par modèle" : "Guides, comparisons and price indices by model"}</li>
              <li>{lang === "fr" ? "Goovoiture Pro : CRM, flotte et SEO pour agences" : "Goovoiture Pro: CRM, fleet and SEO for agencies"}</li>
            </ul>
          </section>
          <section>
            <h2 className="gv-h2 mb-3">{lang === "fr" ? "Contact" : "Contact"}</h2>
            <p className="text-[var(--gv-ink2)]">
              {lang === "fr" ? "E-mail :" : "Email:"}{" "}
              <a href="mailto:contact@goovoiture.ma" className="text-violet-600 hover:underline">
                contact@goovoiture.ma
              </a>
            </p>
            <p className="text-sm text-[var(--gv-mut)] mt-2">
              {lang === "fr" ? "Casablanca, Maroc — plateforme en ligne couvrant tout le royaume." : "Casablanca, Morocco — online platform serving the entire kingdom."}
            </p>
          </section>
        </div>
      ) : null}

      {slug === "equipe" ? (
        <ul className="grid sm:grid-cols-3 gap-6">
          {TEAM.map((m) => (
            <li key={m.name} className="gv-card gv-card-static p-6">
              <h2 className="font-semibold text-lg">{m.name}</h2>
              <p className="text-sm text-violet-600 dark:text-violet-400 mt-1">{m.role[lang] || m.role.fr}</p>
              <p className="text-sm text-[var(--gv-mut)] mt-3 leading-relaxed">{m.bio[lang] || m.bio.fr}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {slug === "avis" ? (
        <div className="space-y-6 max-w-3xl">
          {REVIEWS.map((r) => (
            <blockquote key={r.name} className="gv-card gv-card-static p-6 border-l-4 border-violet-500">
              <p className="text-[var(--gv-ink2)] leading-relaxed">{r.text[lang] || r.text.fr}</p>
              <footer className="mt-4 text-sm text-[var(--gv-mut)]">
                — <strong>{r.name}</strong>, {r.role[lang] || r.role.fr}
              </footer>
            </blockquote>
          ))}
          <p className="text-sm text-[var(--gv-mut)]">
            {lang === "fr"
              ? "Les avis proviennent d'utilisateurs et partenaires Goovoiture. Les notes détaillées apparaissent sur chaque annonce lorsqu'elles sont disponibles."
              : "Reviews come from Goovoiture users and partners. Detailed ratings appear on listings when available."}
          </p>
        </div>
      ) : null}

      {slug === "partenaires" ? (
        <div className="space-y-8 max-w-3xl">
          <section>
            <h2 className="gv-h2 mb-3">{lang === "fr" ? "Types de partenaires" : "Partner types"}</h2>
            <ul className="grid sm:grid-cols-2 gap-4">
              {[
                lang === "fr" ? "Agences de location de voitures" : "Car rental agencies",
                lang === "fr" ? "Concessionnaires & vendeurs" : "Dealers & sellers",
                lang === "fr" ? "Hôtels & tour-opérateurs" : "Hotels & tour operators",
                lang === "fr" ? "Médias & créateurs auto" : "Media & automotive creators",
              ].map((label) => (
                <li key={label} className="gv-card gv-card-static p-4 text-[var(--gv-ink2)]">
                  {label}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="gv-h2 mb-3">{lang === "fr" ? "Devenir partenaire" : "Become a partner"}</h2>
            <p className="text-[var(--gv-ink2)] leading-relaxed mb-4">
              {lang === "fr"
                ? "Rejoignez Goovoiture Pro pour digitaliser votre agence ou contactez-nous pour des partenariats médias et distribution."
                : "Join Goovoiture Pro to digitize your agency or contact us for media and distribution partnerships."}
            </p>
            <a href="mailto:contact@goovoiture.ma" className="gv-btn gv-btn-primary inline-flex">
              contact@goovoiture.ma
            </a>
          </section>
        </div>
      ) : null}

      <RelatedLinksSection title={lang === "fr" ? "Explorer Goovoiture" : "Explore Goovoiture"} links={relatedLinks} />
    </SeoPageShell>
  );
}
