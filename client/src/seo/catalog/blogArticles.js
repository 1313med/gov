/** Blog articles for topical authority (expand to 200+). */
import { CAR_BRANDS } from "./brands.js";
import { MOROCCO_CITIES } from "./cities.js";

export const BLOG_CLUSTERS = [
  { slug: "location-voiture", name: { fr: "Location voiture", en: "Car rental", ar: "تأجير السيارات" } },
  { slug: "voiture-occasion", name: { fr: "Voiture occasion", en: "Used cars", ar: "سيارات مستعملة" } },
  { slug: "conduire-au-maroc", name: { fr: "Conduire au Maroc", en: "Driving in Morocco", ar: "القيادة في المغرب" } },
  { slug: "aeroports", name: { fr: "Aéroports", en: "Airports", ar: "المطارات" } },
  { slug: "tourisme", name: { fr: "Tourisme", en: "Tourism", ar: "السياحة" } },
  { slug: "pro", name: { fr: "GoVoiture Pro", en: "GoVoiture Pro", ar: "GoVoiture Pro" } },
];

export const BLOG_ARTICLES = [
  {
    slug: "location-voiture-maroc-guide-complet",
    cluster: "location-voiture",
    title: {
      fr: "Location voiture Maroc : guide complet 2026",
      en: "Car rental Morocco: complete guide 2026",
      ar: "تأجير السيارات في المغرب: دليل شامل 2026",
    },
    description: {
      fr: "Tout savoir pour louer une voiture au Maroc : prix, documents, assurance et astuces.",
      en: "Everything about renting a car in Morocco.",
      ar: "كل ما تحتاج معرفته عن كراء السيارات في المغرب.",
    },
    keyword: { fr: "location voiture maroc", en: "car rental morocco", ar: "تأجير سيارات المغرب" },
    body: {
      fr: "Louer une voiture au Maroc est la meilleure façon de explorer le royaume. Comparez les offres sur GoVoiture, vérifiez les conditions d'assurance et réservez en ligne.",
      en: "Renting a car in Morocco is the best way to explore the country. Compare offers on GoVoiture.",
      ar: "كراء السيارة في المغرب هو أفضل طريقة لاستكشاف البلاد.",
    },
  },
  {
    slug: "location-voiture-casablanca-pas-cher",
    cluster: "location-voiture",
    title: { fr: "Location voiture Casablanca pas cher", en: "Cheap car rental Casablanca", ar: "كراء سيارات رخيص الدار البيضاء" },
    description: { fr: "Astuces pour louer pas cher à Casablanca.", en: "Tips for cheap rental in Casablanca.", ar: "نصائح للكراء الرخيص." },
    keyword: { fr: "location voiture casablanca pas cher", en: "cheap car rental casablanca", ar: "كراء سيارات الدار البيضاء" },
    body: { fr: "Casablanca concentre la plus grande offre de location du Maroc.", en: "Casablanca has the largest rental offer.", ar: "الدار البيضاء أكبر سوق للكراء." },
  },
  {
    slug: "location-voiture-aeroport-mohammed-v",
    cluster: "aeroports",
    title: { fr: "Location voiture aéroport Mohammed V", en: "Mohammed V airport car rental", ar: "كراء مطار محمد الخامس" },
    description: { fr: "Récupérez votre voiture à l'aéroport CMN.", en: "Pick up your car at CMN airport.", ar: "استلم سيارتك في مطار CMN." },
    keyword: { fr: "location voiture aeroport mohammed v", en: "mohammed v airport car rental", ar: "كراء مطار محمد الخامس" },
    body: { fr: "L'aéroport Mohammed V est le principal hub du Maroc.", en: "Mohammed V is Morocco's main hub.", ar: "مطار محمد الخامس هو المحور الرئيسي." },
  },
  {
    slug: "acheter-voiture-occasion-maroc",
    cluster: "voiture-occasion",
    title: { fr: "Acheter voiture occasion Maroc", en: "Buy used car Morocco", ar: "شراء سيارة مستعملة المغرب" },
    description: { fr: "Guide d'achat sécurisé sur GoVoiture.", en: "Safe buying guide on GoVoiture.", ar: "دليل الشراء الآمن." },
    keyword: { fr: "acheter voiture occasion maroc", en: "buy used car morocco", ar: "شراء سيارة مستعملة" },
    body: { fr: "Vérifiez le contrôle technique et l'historique avant d'acheter.", en: "Check technical inspection before buying.", ar: "تحقق من الفحص التقني قبل الشراء." },
  },
  {
    slug: "vendre-voiture-rapidement-maroc",
    cluster: "voiture-occasion",
    title: { fr: "Vendre voiture rapidement Maroc", en: "Sell car fast Morocco", ar: "بيع السيارة بسرعة" },
    description: { fr: "Publiez sur GoVoiture et touchez des acheteurs vérifiés.", en: "List on GoVoiture.", ar: "انشر على GoVoiture." },
    keyword: { fr: "vendre voiture rapidement maroc", en: "sell car fast morocco", ar: "بيع سيارة بسرعة" },
    body: { fr: "Des photos claires et un prix juste accélèrent la vente.", en: "Clear photos and fair pricing speed up sales.", ar: "صور واضحة وسعر مناسب." },
  },
  {
    slug: "conduire-au-maroc-guide-etrangers",
    cluster: "conduire-au-maroc",
    title: { fr: "Conduire au Maroc : guide étrangers", en: "Driving in Morocco for foreigners", ar: "القيادة في المغرب للأجانب" },
    description: { fr: "Code de la route, radars et conseils pratiques.", en: "Traffic rules and practical tips.", ar: "قواعد المرور ونصائح." },
    keyword: { fr: "conduire au maroc", en: "driving in morocco", ar: "القيادة في المغرب" },
    body: { fr: "Le permis international est recommandé pour les touristes.", en: "International licence recommended for tourists.", ar: "الرخصة الدولية موصى بها." },
  },
  {
    slug: "road-trip-maroc-10-jours",
    cluster: "tourisme",
    title: { fr: "Road trip Maroc 10 jours", en: "Morocco 10-day road trip", ar: "رحلة برية 10 أيام" },
    description: { fr: "Itinéraire Casablanca — Marrakech — désert.", en: "Casablanca to desert itinerary.", ar: "مسار الدار البيضاء إلى الصحراء." },
    keyword: { fr: "road trip maroc", en: "morocco road trip", ar: "رحلة برية المغرب" },
    body: { fr: "Louez un 4x4 pour Merzouga et planifiez vos étapes.", en: "Rent a 4x4 for Merzouga.", ar: "استأجر 4x4 لمرزوكة." },
  },
  {
    slug: "logiciel-gestion-flotte-location-maroc",
    cluster: "pro",
    title: { fr: "Logiciel gestion flotte location Maroc", en: "Fleet management software Morocco", ar: "برنامج إدارة الأسطول" },
    description: { fr: "GoVoiture Pro pour agences.", en: "GoVoiture Pro for agencies.", ar: "GoVoiture Pro للوكالات." },
    keyword: { fr: "logiciel gestion flotte maroc", en: "fleet management morocco", ar: "برنامج إدارة الأسطول" },
    body: { fr: "Digitalisez disponibilités, contrats et facturation.", en: "Digitize availability and billing.", ar: "رقمنة التوفر والفوترة." },
  },
];

/** Programmatic buyer/seller/insurance guides — scales toward 200+ articles. */
const GUIDE_TEMPLATES = {
  "achat-occasion": {
    cluster: "voiture-occasion",
    topics: [
      { slug: "comment-acheter-voiture-occasion-maroc", title: { fr: "Comment acheter une voiture d'occasion au Maroc" } },
      { slug: "meilleure-voiture-occasion-maroc", title: { fr: "Meilleure voiture d'occasion au Maroc" } },
      { slug: "suv-occasion-maroc", title: { fr: "SUV occasion Maroc" } },
      { slug: "citadine-occasion-maroc", title: { fr: "Citadine occasion Maroc" } },
      { slug: "checklist-achat-voiture-occasion", title: { fr: "Checklist achat voiture occasion" } },
    ],
  },
  vente: {
    cluster: "voiture-occasion",
    topics: [
      { slug: "comment-vendre-sa-voiture-maroc", title: { fr: "Comment vendre sa voiture au Maroc" } },
      { slug: "transfert-propriete-maroc", title: { fr: "Transfert de propriété Maroc" } },
      { slug: "documents-vente-voiture-maroc", title: { fr: "Documents vente voiture Maroc" } },
    ],
  },
  assurance: {
    cluster: "conduire-au-maroc",
    topics: [{ slug: "assurance-automobile-maroc", title: { fr: "Assurance automobile Maroc" } }],
  },
  financement: {
    cluster: "voiture-occasion",
    topics: [
      { slug: "credit-auto-maroc", title: { fr: "Crédit auto Maroc" } },
      { slug: "financement-voiture-maroc", title: { fr: "Financement voiture Maroc" } },
    ],
  },
  entretien: {
    cluster: "conduire-au-maroc",
    topics: [
      { slug: "controle-technique-maroc", title: { fr: "Contrôle technique Maroc" } },
      { slug: "entretien-voiture-maroc", title: { fr: "Entretien voiture Maroc" } },
    ],
  },
};

function generatedGuides() {
  const out = [];
  for (const group of Object.values(GUIDE_TEMPLATES)) {
    for (const t of group.topics) {
      const titleFr = t.title.fr;
      out.push({
        slug: t.slug,
        cluster: group.cluster,
        title: { fr: `${titleFr} | GoVoiture`, en: titleFr, ar: titleFr },
        description: {
          fr: `Guide complet : ${titleFr.toLowerCase()}. Conseils pratiques sur GoVoiture.`,
          en: `Guide: ${titleFr}.`,
          ar: `دليل: ${titleFr}.`,
        },
        keyword: { fr: t.slug.replace(/-/g, " "), en: t.slug, ar: t.slug },
        body: {
          fr: `${titleFr} : lisez notre guide pratique pour le marché automobile marocain sur GoVoiture.`,
          en: `${titleFr} — practical guide for Morocco.`,
          ar: `${titleFr} — دليل عملي للمغرب.`,
        },
      });
    }
  }
  // City × topic expansion for location cluster
  const cities = ["casablanca", "rabat", "marrakech", "tanger", "agadir", "fes"];
  for (const city of cities) {
    out.push({
      slug: `location-voiture-${city}-guide`,
      cluster: "location-voiture",
      title: { fr: `Location voiture ${city} — guide`, en: `Car rental ${city} guide`, ar: `كراء ${city}` },
      description: { fr: `Tout savoir pour louer à ${city}.`, en: `Rent in ${city}.`, ar: `كراء في ${city}.` },
      keyword: { fr: `location voiture ${city}`, en: `car rental ${city}`, ar: `كراء ${city}` },
      body: { fr: `Guide location voiture à ${city}.`, en: `Rental guide ${city}.`, ar: `دليل ${city}.` },
    });
  }

  // Brand authority guides (30 brands × 4 topics ≈ 120 articles)
  const brandTopics = [
    { suffix: "location-maroc", title: (b) => `Location ${b} Maroc`, cluster: "location-voiture" },
    { suffix: "occasion-maroc", title: (b) => `${b} occasion Maroc`, cluster: "voiture-occasion" },
    { suffix: "prix-maroc", title: (b) => `Prix ${b} au Maroc`, cluster: "voiture-occasion" },
    { suffix: "fiabilite-maroc", title: (b) => `Fiabilité ${b} au Maroc`, cluster: "conduire-au-maroc" },
  ];
  for (const brand of CAR_BRANDS) {
    const bName = brand.name.fr;
    for (const topic of brandTopics) {
      out.push({
        slug: `${brand.slug}-${topic.suffix}`,
        cluster: topic.cluster,
        title: { fr: `${topic.title(bName)} | GoVoiture`, en: topic.title(bName), ar: topic.title(bName) },
        description: {
          fr: `Guide ${bName} au Maroc : location, occasion, prix et conseils pratiques.`,
          en: `${bName} guide for Morocco.`,
          ar: `دليل ${bName} في المغرب.`,
        },
        keyword: { fr: `${bName.toLowerCase()} maroc`, en: `${brand.slug} morocco`, ar: brand.slug },
        body: {
          fr: `Tout sur ${bName} au Maroc — comparez les offres GoVoiture.`,
          en: `Everything about ${bName} in Morocco on GoVoiture.`,
          ar: `كل ما يخص ${bName} في المغرب.`,
        },
      });
    }
  }

  // City × occasion guides (45 cities)
  for (const city of MOROCCO_CITIES) {
    const cityN = city.name.fr;
    out.push({
      slug: `voiture-occasion-${city.slug}`,
      cluster: "voiture-occasion",
      title: { fr: `Voiture occasion ${cityN}`, en: `Used cars ${cityN}`, ar: `سيارات مستعملة ${cityN}` },
      description: {
        fr: `Acheter une voiture d'occasion à ${cityN} — annonces vérifiées GoVoiture.`,
        en: `Buy used cars in ${cityN}.`,
        ar: `شراء سيارة مستعملة في ${cityN}.`,
      },
      keyword: { fr: `voiture occasion ${city.slug}`, en: `used cars ${city.slug}`, ar: city.slug },
      body: {
        fr: `Parcourez les annonces occasion à ${cityN} sur GoVoiture.`,
        en: `Browse used car listings in ${cityN}.`,
        ar: `تصفح إعلانات ${cityN}.`,
      },
    });
  }

  // Model guides (top 3 models per brand)
  for (const brand of CAR_BRANDS) {
    for (const model of brand.models.slice(0, 3)) {
      const modelN = model.replace(/-/g, " ");
      out.push({
        slug: `${brand.slug}-${model}-guide`,
        cluster: "voiture-occasion",
        title: {
          fr: `${brand.name.fr} ${modelN} — guide Maroc`,
          en: `${brand.name.en} ${modelN} Morocco guide`,
          ar: `${brand.name.ar} ${modelN}`,
        },
        description: {
          fr: `Location et occasion ${brand.name.fr} ${modelN} au Maroc.`,
          en: `${brand.name.en} ${modelN} in Morocco.`,
          ar: `${brand.name.ar} ${modelN} في المغرب.`,
        },
        keyword: { fr: `${brand.name.fr} ${modelN} maroc`, en: `${brand.slug} ${model}`, ar: model },
        body: {
          fr: `Comparez ${brand.name.fr} ${modelN} — location et vente sur GoVoiture.`,
          en: `Compare ${brand.name.en} ${modelN} on GoVoiture.`,
          ar: `قارن ${brand.name.fr} ${modelN}.`,
        },
      });
    }
  }

  return out;
}

export function getAllBlogArticles() {
  const seen = new Set(BLOG_ARTICLES.map((a) => a.slug));
  const extra = generatedGuides().filter((a) => !seen.has(a.slug));
  return [...BLOG_ARTICLES, ...extra];
}

export function getBlogArticle(slug) {
  return getAllBlogArticles().find((a) => a.slug === slug) || null;
}

export function getClusterArticles(clusterSlug) {
  return getAllBlogArticles().filter((a) => a.cluster === clusterSlug);
}

export function blogArticlePath(slug) {
  const a = getBlogArticle(slug);
  return a ? `/blog/${a.cluster}/${slug}` : "/blog";
}

export function blogClusterPath(clusterSlug) {
  return `/blog/${clusterSlug}`;
}
