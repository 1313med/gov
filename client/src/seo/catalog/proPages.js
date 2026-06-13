/** GoVoiture Pro SaaS landing pages. */
export const PRO_PAGES = [
  {
    slug: "gestion-flotte",
    title: { fr: "Gestion de flotte", en: "Fleet management", ar: "إدارة الأسطول" },
    keyword: { fr: "logiciel gestion flotte maroc", en: "fleet management software morocco", ar: "برنامج إدارة الأسطول" },
    description: {
      fr: "Gérez votre parc automobile : disponibilité, maintenance, assurances et alertes en temps réel.",
      en: "Manage your fleet: availability, maintenance, insurance and real-time alerts.",
      ar: "أدر أسطولك: التوفر والصيانة والتأمين والتنبيهات.",
    },
    price: 499,
  },
  {
    slug: "crm",
    title: { fr: "CRM agence", en: "Agency CRM", ar: "CRM للوكالات" },
    keyword: { fr: "crm agence location voiture", en: "car rental crm", ar: "CRM تأجير السيارات" },
    description: {
      fr: "Centralisez prospects, clients et historique des réservations.",
      en: "Centralize leads, customers and booking history.",
      ar: "مركزية العملاء والحجوزات.",
    },
    price: 399,
  },
  {
    slug: "reservations",
    title: { fr: "Réservations", en: "Reservations", ar: "الحجوزات" },
    keyword: { fr: "logiciel reservation location voiture", en: "car rental booking software", ar: "برنامج حجز السيارات" },
    description: {
      fr: "Calendrier, disponibilités, confirmations et paiements en ligne.",
      en: "Calendar, availability, confirmations and online payments.",
      ar: "تقويم وتوفر وتأكيدات ومدفوعات.",
    },
    price: 349,
  },
  {
    slug: "contrats",
    title: { fr: "Contrats", en: "Contracts", ar: "العقود" },
    keyword: { fr: "contrat location voiture digital", en: "digital rental contracts", ar: "عقود رقمية" },
    description: { fr: "Générez et signez des contrats de location conformes.", en: "Generate compliant rental contracts.", ar: "عقود متوافقة." },
    price: 199,
  },
  {
    slug: "facturation",
    title: { fr: "Facturation", en: "Billing", ar: "الفوترة" },
    keyword: { fr: "facturation agence location", en: "rental agency billing", ar: "فوترة الوكالات" },
    description: { fr: "Devis, factures et suivi des encaissements.", en: "Quotes, invoices and payment tracking.", ar: "عروض أسعار وفواتير." },
    price: 249,
  },
  {
    slug: "rapports",
    title: { fr: "Rapports", en: "Reports", ar: "التقارير" },
    keyword: { fr: "rapports location voiture", en: "rental analytics reports", ar: "تقارير التأجير" },
    description: { fr: "Analytics revenus, taux d'occupation et performance flotte.", en: "Revenue and fleet utilization analytics.", ar: "تحليلات الإيرادات." },
    price: 149,
  },
  {
    slug: "application-mobile",
    title: { fr: "Application mobile", en: "Mobile app", ar: "تطبيق الجوال" },
    keyword: { fr: "application agence location voiture", en: "rental agency mobile app", ar: "تطبيق الوكالة" },
    description: { fr: "App iOS/Android pour gérer votre agence en mobilité.", en: "iOS/Android app for your agency.", ar: "تطبيق iOS و Android." },
    price: 599,
  },
  {
    slug: "creation-site-web",
    title: { fr: "Création site web", en: "Website creation", ar: "إنشاء موقع" },
    keyword: { fr: "site web agence location voiture", en: "rental agency website", ar: "موقع وكالة تأجير" },
    description: { fr: "Site vitrine optimisé SEO pour votre agence.", en: "SEO-optimized agency website.", ar: "موقع محسّن للSEO." },
    price: 2999,
  },
  {
    slug: "seo-agences",
    title: { fr: "SEO pour agences", en: "SEO for agencies", ar: "SEO للوكالات" },
    keyword: { fr: "seo agence location voiture maroc", en: "car rental seo morocco", ar: "SEO تأجير السيارات" },
    description: { fr: "Référencement local et pages ville pour votre agence.", en: "Local SEO and city landing pages.", ar: "SEO محلي." },
    price: 799,
  },
  {
    slug: "hebergement",
    title: { fr: "Hébergement", en: "Hosting", ar: "الاستضافة" },
    keyword: { fr: "hebergement site agence auto", en: "auto agency hosting", ar: "استضافة المواقع" },
    description: { fr: "Hébergement rapide et sécurisé au Maroc.", en: "Fast secure hosting in Morocco.", ar: "استضافة آمنة." },
    price: 99,
  },
  {
    slug: "tarifs",
    title: { fr: "Tarifs", en: "Pricing", ar: "الأسعار" },
    keyword: { fr: "tarif logiciel location voiture", en: "rental software pricing", ar: "أسعار البرنامج" },
    description: { fr: "Plans flexibles pour agences de toutes tailles.", en: "Flexible plans for all agency sizes.", ar: "خطط مرنة." },
    price: null,
  },
  {
    slug: "fonctionnalites",
    title: { fr: "Fonctionnalités", en: "Features", ar: "الميزات" },
    keyword: { fr: "fonctionnalites logiciel location", en: "rental software features", ar: "ميزات البرنامج" },
    description: { fr: "Découvrez toute la plateforme GoVoiture Pro.", en: "Discover the full GoVoiture Pro platform.", ar: "اكتشف المنصة." },
    price: null,
  },
  {
    slug: "support",
    title: { fr: "Support", en: "Support", ar: "الدعم" },
    keyword: { fr: "support goovoiture pro", en: "goovoiture pro support", ar: "دعم GoVoiture" },
    description: { fr: "Assistance prioritaire 7j/7 pour les agences partenaires.", en: "Priority 7-day support for partner agencies.", ar: "دعم أولوية." },
    price: null,
  },
];

export function getProPage(slug) {
  return PRO_PAGES.find((p) => p.slug === slug) || null;
}

export function proPagePath(slug) {
  return slug ? `/pro/${slug}` : "/pro";
}
