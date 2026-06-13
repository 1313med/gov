import { MOROCCO_CITIES, getCityBySlug, getCityName } from "./cities.js";

export function buildAgencyHubSeo(lang, citySlug = null) {
  if (citySlug) {
    const city = getCityBySlug(citySlug);
    if (!city) return null;
    const cityN = getCityName(city, lang);
    const templates = {
      fr: {
        title: `Agence location voiture ${cityN} — Comparez | Goovoiture`,
        description: `Trouvez une agence de location voiture à ${cityN}. Flottes vérifiées, avis clients et réservation en ligne sur Goovoiture.`,
        h1: `Agences de location voiture à ${cityN}`,
        intro: `Comparez les agences de location à ${cityN} : tarifs, flottes, avis et contact direct sur Goovoiture.`,
        keywords: `agence location voiture ${cityN.toLowerCase()}, location voiture ${cityN.toLowerCase()}`,
      },
      en: {
        title: `Car rental agencies ${cityN} | Goovoiture`,
        description: `Find car rental agencies in ${cityN}. Verified fleets and reviews.`,
        h1: `Car rental agencies in ${cityN}`,
        intro: `Compare rental agencies in ${cityN} on Goovoiture.`,
        keywords: `car rental agency ${cityN}`,
      },
      ar: {
        title: `وكالات كراء السيارات ${cityN} | Goovoiture`,
        description: `اعثر على وكالة كراء سيارات في ${cityN}.`,
        h1: `وكالات كراء السيارات في ${cityN}`,
        intro: `قارن وكالات الكراء في ${cityN} على Goovoiture.`,
        keywords: `وكالة كراء سيارات ${cityN}`,
      },
    };
    return { ...templates[lang], lang, path: `/agences/${citySlug}` };
  }

  const templates = {
    fr: {
      title: "Agences de location voiture au Maroc | Goovoiture",
      description:
        "Annuaire des agences de location voiture au Maroc : Casablanca, Rabat, Marrakech et 45 villes. Avis, flottes et contact.",
      h1: "Agences de location voiture au Maroc",
      intro:
        "Trouvez une agence de location près de chez vous — comparez flottes, tarifs et avis clients sur Goovoiture.",
      keywords: "agence location voiture maroc, location voiture casablanca, agence rabat",
    },
    en: {
      title: "Car rental agencies Morocco | Goovoiture",
      description: "Directory of car rental agencies across Morocco.",
      h1: "Car rental agencies in Morocco",
      intro: "Find and compare rental agencies nationwide.",
      keywords: "car rental agency morocco",
    },
    ar: {
      title: "وكالات كراء السيارات في المغرب | Goovoiture",
      description: "دليل وكالات كراء السيارات في المغرب.",
      h1: "وكالات كراء السيارات في المغرب",
      intro: "اعثر على وكالة كراء قريبة منك.",
      keywords: "وكالة كراء سيارات المغرب",
    },
  };
  return { ...templates[lang], lang, path: "/agences" };
}

export function buildDealerHubSeo(lang, citySlug = null) {
  if (citySlug) {
    const city = getCityBySlug(citySlug);
    if (!city) return null;
    const cityN = getCityName(city, lang);
    const templates = {
      fr: {
        title: `Concessionnaire & voiture occasion ${cityN} | Goovoiture`,
        description: `Concessionnaires et vendeurs auto à ${cityN}. Inventaire occasion vérifié sur Goovoiture.`,
        h1: `Concessionnaires à ${cityN}`,
        intro: `Parcourez les concessionnaires et vendeurs professionnels à ${cityN}.`,
        keywords: `concessionnaire ${cityN.toLowerCase()}, voiture occasion ${cityN.toLowerCase()}`,
      },
      en: {
        title: `Dealers & used cars ${cityN} | Goovoiture`,
        description: `Auto dealers in ${cityN}.`,
        h1: `Dealers in ${cityN}`,
        intro: `Browse professional sellers in ${cityN}.`,
        keywords: `dealer ${cityN}, used cars ${cityN}`,
      },
      ar: {
        title: `وكلاء السيارات ${cityN} | Goovoiture`,
        description: `وكلاء وبيع سيارات في ${cityN}.`,
        h1: `وكلاء السيارات في ${cityN}`,
        intro: `تصفح الوكلاء في ${cityN}.`,
        keywords: `وكيل سيارات ${cityN}`,
      },
    };
    return { ...templates[lang], lang, path: `/concessionnaires/${citySlug}` };
  }

  const templates = {
    fr: {
      title: "Concessionnaires & vendeurs auto au Maroc | Goovoiture",
      description:
        "Concessionnaires et professionnels de l'occasion au Maroc — Casablanca, Rabat, Marrakech.",
      h1: "Concessionnaires au Maroc",
      intro: "Achetez auprès de vendeurs vérifiés partout au Maroc.",
      keywords: "concessionnaire maroc, voiture occasion casablanca, concessionnaire rabat",
    },
    en: {
      title: "Auto dealers Morocco | Goovoiture",
      description: "Verified dealers and used car sellers in Morocco.",
      h1: "Auto dealers in Morocco",
      intro: "Buy from verified professionals nationwide.",
      keywords: "auto dealer morocco",
    },
    ar: {
      title: "وكلاء السيارات في المغرب | Goovoiture",
      description: "وكلاء وبائعون محترفون في المغرب.",
      h1: "وكلاء السيارات في المغرب",
      intro: "اشترِ من بائعين موثوقين.",
      keywords: "وكيل سيارات المغرب",
    },
  };
  return { ...templates[lang], lang, path: "/concessionnaires" };
}

export function agencyFaqs(lang, cityName = "Maroc") {
  if (lang === "en") {
    return [
      { q: `How to choose a rental agency in ${cityName}?`, a: "Compare fleet size, reviews, prices and pickup options on Goovoiture." },
      { q: "Are agencies verified?", a: "Goovoiture highlights verified partners with active listings and customer reviews." },
    ];
  }
  if (lang === "ar") {
    return [
      { q: `كيف أختار وكالة كراء في ${cityName}؟`, a: "قارن الأسطول والتقييمات على Goovoiture." },
    ];
  }
  return [
    { q: `Comment choisir une agence de location à ${cityName} ?`, a: "Comparez la flotte, les avis, les tarifs et les options de retrait sur Goovoiture." },
    { q: "Les agences sont-elles vérifiées ?", a: "Goovoiture met en avant les partenaires actifs avec annonces et avis clients." },
    { q: "Puis-je contacter l'agence directement ?", a: "Oui — téléphone et WhatsApp disponibles sur chaque fiche agence." },
  ];
}

export function dealerFaqs(lang, cityName = "Maroc") {
  if (lang === "en") {
    return [
      { q: `How to buy a used car in ${cityName}?`, a: "Browse dealer inventory on Goovoiture and contact sellers directly." },
    ];
  }
  return [
    { q: `Comment acheter une voiture d'occasion à ${cityName} ?`, a: "Parcourez l'inventaire des concessionnaires sur Goovoiture." },
    { q: "Les vendeurs sont-ils vérifiés ?", a: "Les profils avec badge vérifié ont validé leur identité sur Goovoiture." },
  ];
}

export const TOP_AGENCY_CITIES = MOROCCO_CITIES.slice(0, 15);
