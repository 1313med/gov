/** Blog articles for topical authority (expand to 200+). */
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

export function getBlogArticle(slug) {
  return BLOG_ARTICLES.find((a) => a.slug === slug) || null;
}

export function getClusterArticles(clusterSlug) {
  return BLOG_ARTICLES.filter((a) => a.cluster === clusterSlug);
}

export function blogArticlePath(slug) {
  const a = getBlogArticle(slug);
  return a ? `/blog/${a.cluster}/${slug}` : "/blog";
}
