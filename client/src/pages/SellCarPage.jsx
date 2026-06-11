import { Link } from "react-router-dom";
import { useAppLang } from "../context/AppLangContext";
import { loadAuth } from "../utils/authStorage";
import SeoHead from "../components/SeoHead";
import SeoContentBlock from "../components/SeoContentBlock";
import { buildSeoPath } from "../seo/seoPaths";
import { breadcrumbJsonLd } from "../seo/jsonLd";
import { getSiteUrl } from "../seo/seoLocales";

const COPY = {
  fr: {
    kicker: "Marketplace auto Maroc",
    cta: "Publier mon annonce",
    login: "J'ai déjà un compte",
    register: "Créer un compte gratuit",
    stepsTitle: "Comment vendre votre voiture",
    steps: [
      { n: "1", t: "Inscrivez-vous", d: "Créez votre compte Goovoiture en 2 minutes." },
      { n: "2", t: "Publiez l'annonce", d: "Photos, prix, ville — voiture occasion visible partout au Maroc." },
      { n: "3", t: "Contactez les acheteurs", d: "Messagerie sécurisée, vendez à Casablanca, Rabat, Marrakech…" },
    ],
    faqTitle: "Questions fréquentes",
    faqs: [
      {
        q: "Comment vendre ma voiture rapidement au Maroc ?",
        a: "Publiez une annonce détaillée avec photos de qualité, un prix compétitif et votre ville. Goovoiture vous met en relation avec des acheteurs actifs.",
      },
      {
        q: "Estimation voiture occasion Maroc",
        a: "Fixez votre prix en comparant les annonces similaires sur Goovoiture. Utilisez aussi notre simulateur budget pour rester compétitif.",
      },
      {
        q: "Puis-je vendre depuis Casablanca, Rabat ou Marrakech ?",
        a: "Oui — votre annonce est visible dans toutes les villes du Maroc, avec un ciblage local pour les acheteurs près de chez vous.",
      },
    ],
    browse: "Voir les voitures à vendre",
  },
  en: {
    kicker: "Morocco auto marketplace",
    cta: "List my car",
    login: "I have an account",
    register: "Create free account",
    stepsTitle: "How to sell your car",
    steps: [
      { n: "1", t: "Sign up", d: "Create your Goovoiture account in minutes." },
      { n: "2", t: "Publish listing", d: "Photos, price, city — visible across Morocco." },
      { n: "3", t: "Connect with buyers", d: "Secure messaging in Casablanca, Rabat, Marrakech and more." },
    ],
    faqTitle: "FAQ",
    faqs: [
      {
        q: "How to sell my car fast in Morocco?",
        a: "Publish a detailed listing with quality photos and a competitive price. Goovoiture connects you with active buyers.",
      },
      {
        q: "Used car valuation in Morocco",
        a: "Compare similar listings on Goovoiture to set the right price for your vehicle.",
      },
      {
        q: "Can I sell from Casablanca, Rabat or Marrakech?",
        a: "Yes — your listing is visible nationwide with local discovery for nearby buyers.",
      },
    ],
    browse: "Browse cars for sale",
  },
  ar: {
    kicker: "سوق السيارات في المغرب",
    cta: "نشر إعلاني",
    login: "لدي حساب",
    register: "إنشاء حساب مجاني",
    stepsTitle: "كيف تبيع سيارتك",
    steps: [
      { n: "1", t: "سجّل", d: "أنشئ حساب Goovoiture في دقائق." },
      { n: "2", t: "انشر الإعلان", d: "صور، سعر، المدينة — ظاهر في كل المغرب." },
      { n: "3", t: "تواصل مع المشترين", d: "رسائل آمنة في الدار البيضاء والرباط ومراكش." },
    ],
    faqTitle: "أسئلة شائعة",
    faqs: [
      {
        q: "كيف أبيع سيارتي بسرعة في المغرب؟",
        a: "انشر إعلاناً مفصلاً بصور جيدة وسعر منافس. Goovoiture يربطك بمشترين نشطين.",
      },
      {
        q: "تقييم السيارة المستعملة",
        a: "قارن مع إعلانات مشابهة على Goovoiture لتحديد السعر المناسب.",
      },
      {
        q: "هل يمكن البيع من الدار البيضاء أو الرباط؟",
        a: "نعم — إعلانك ظاهر في جميع مدن المغرب.",
      },
    ],
    browse: "تصفح السيارات للبيع",
  },
};

export default function SellCarPage() {
  const { lang } = useAppLang();
  const auth = loadAuth();
  const C = COPY[lang] || COPY.fr;
  const siteUrl = getSiteUrl();
  const listPath = buildSeoPath(lang, auth ? "/my-sales/new" : "/register");
  const loginPath = buildSeoPath(lang, "/login");

  const jsonLdExtra = {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbJsonLd([
        { name: "Goovoiture", url: siteUrl },
        { name: C.stepsTitle, url: `${siteUrl}${buildSeoPath(lang, "/vendre-ma-voiture")}` },
      ]),
      {
        "@type": "FAQPage",
        mainEntity: C.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05060f]">
      <SeoHead jsonLdExtra={jsonLdExtra} />

      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-2">
          {C.kicker}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <Link
            to={listPath}
            className="inline-flex justify-center rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
          >
            {C.cta}
          </Link>
          {!auth && (
            <Link
              to={loginPath}
              className="inline-flex justify-center rounded-xl border border-gray-300 dark:border-white/20 px-6 py-3 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              {C.login}
            </Link>
          )}
        </div>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{C.stepsTitle}</h2>
        <ol className="space-y-4 mb-10">
          {C.steps.map((s) => (
            <li key={s.n} className="flex gap-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/40 text-sm font-bold text-violet-700 dark:text-violet-300">
                {s.n}
              </span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{s.t}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{C.faqTitle}</h2>
        <div className="space-y-4 mb-8">
          {C.faqs.map((f) => (
            <details
              key={f.q}
              className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 group"
            >
              <summary className="cursor-pointer font-medium text-gray-900 dark:text-gray-100 list-none flex justify-between gap-2">
                {f.q}
                <span className="text-violet-500 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>

        <Link
          to={buildSeoPath(lang, "/cars")}
          className="text-sm text-violet-600 dark:text-violet-400 hover:underline"
        >
          {C.browse} →
        </Link>
      </div>

      <SeoContentBlock />
    </div>
  );
}
