import { getCityBySlug, getCityName } from "./catalog/cities.js";
import { getAirportBySlug, getAirportName } from "./catalog/airports.js";
import { getBrandBySlug, getModelBySlugs } from "./catalog/brands.js";
import { getRentalCategoryBySlug, getSaleCategoryBySlug } from "./catalog/categories.js";

function facetName(facet, lang) {
  return facet?.name?.[lang] || facet?.name?.fr || "";
}

function brandDisplay(brand, lang) {
  return brand?.name?.[lang] || brand?.name?.fr || brand?.slug || "";
}

export function buildCityCategorySeo(lang, citySlug, categorySlug, intent = "rental") {
  const city = getCityBySlug(citySlug);
  const cat =
    intent === "sale" ? getSaleCategoryBySlug(categorySlug) : getRentalCategoryBySlug(categorySlug);
  if (!city || !cat) return null;
  const cityN = getCityName(city, lang);
  const catN = facetName(cat, lang);
  const templates = {
    fr: {
      title:
        intent === "sale"
          ? `${catN} ${cityN} — Voiture occasion | Goovoiture`
          : `${catN} ${cityN} — Location voiture | Goovoiture`,
      description:
        intent === "sale"
          ? `Achetez une ${catN.toLowerCase()} à ${cityN}. Annonces vérifiées, prix transparents sur Goovoiture.`
          : `Louez une ${catN.toLowerCase()} à ${cityN}. Comparez les offres, réservez en ligne sur Goovoiture.`,
      h1:
        intent === "sale"
          ? `${catN} à ${cityN} — Voitures d'occasion`
          : `${catN} à ${cityN} — Location de voiture`,
      intro:
        intent === "sale"
          ? `Parcourez les annonces ${catN.toLowerCase()} à ${cityN} sur Goovoiture. Véhicules vérifiés, contact direct avec les vendeurs et transaction sécurisée.`
          : `Comparez les offres de ${catN.toLowerCase()} à ${cityN}. Tarifs journaliers transparents, agences vérifiées et réservation en ligne sur Goovoiture.`,
      keywords: cat.keywords?.[lang] || cat.keywords?.fr || "",
    },
    en: {
      title:
        intent === "sale"
          ? `${catN} ${cityN} — Used cars | Goovoiture`
          : `${catN} ${cityN} — Car rental | Goovoiture`,
      description:
        intent === "sale"
          ? `Buy a ${catN.toLowerCase()} in ${cityN}. Verified listings on Goovoiture.`
          : `Rent a ${catN.toLowerCase()} in ${cityN}. Book online on Goovoiture.`,
      h1: intent === "sale" ? `${catN} in ${cityN}` : `${catN} rental in ${cityN}`,
      intro:
        intent === "sale"
          ? `Browse ${catN.toLowerCase()} listings in ${cityN} on Goovoiture.`
          : `Compare ${catN.toLowerCase()} rental offers in ${cityN}.`,
      keywords: cat.keywords?.en || "",
    },
    ar: {
      title:
        intent === "sale"
          ? `${catN} ${cityN} — سيارات مستعملة | Goovoiture`
          : `${catN} ${cityN} — تأجير سيارات | Goovoiture`,
      description:
        intent === "sale"
          ? `اشترِ ${catN} في ${cityN} على Goovoiture.`
          : `استأجر ${catN} في ${cityN} على Goovoiture.`,
      h1: intent === "sale" ? `${catN} في ${cityN}` : `${catN} في ${cityN}`,
      intro:
        intent === "sale"
          ? `تصفح إعلانات ${catN} في ${cityN}.`
          : `قارن عروض ${catN} في ${cityN}.`,
      keywords: cat.keywords?.ar || "",
    },
  };
  return { ...templates[lang], lang, path: intent === "sale" ? `/voiture-occasion/${citySlug}/${categorySlug}` : `/location-voiture/${citySlug}/${categorySlug}` };
}

export function buildCityBrandSeo(lang, citySlug, brandSlug, intent = "rental") {
  const city = getCityBySlug(citySlug);
  const brand = getBrandBySlug(brandSlug);
  if (!city || !brand) return null;
  const cityN = getCityName(city, lang);
  const brandN = brandDisplay(brand, lang);
  const templates = {
    fr: {
      title:
        intent === "sale"
          ? `${brandN} occasion ${cityN} | Goovoiture`
          : `Location ${brandN} ${cityN} | Goovoiture`,
      description:
        intent === "sale"
          ? `Achetez une ${brandN} d'occasion à ${cityN}. Annonces vérifiées sur Goovoiture.`
          : `Louez une ${brandN} à ${cityN}. Meilleurs tarifs et réservation en ligne.`,
      h1: intent === "sale" ? `${brandN} d'occasion à ${cityN}` : `Location ${brandN} à ${cityN}`,
      intro:
        intent === "sale"
          ? `Toutes les annonces ${brandN} à ${cityN} : comparez les prix et contactez les vendeurs vérifiés.`
          : `Toutes les offres de location ${brandN} à ${cityN} sur Goovoiture.`,
      keywords: `${brandN.toLowerCase()} ${cityN.toLowerCase()}, ${intent === "sale" ? "voiture occasion" : "location voiture"}`,
    },
    en: {
      title: intent === "sale" ? `Used ${brandN} ${cityN} | Goovoiture` : `Rent ${brandN} ${cityN} | Goovoiture`,
      description: intent === "sale" ? `Used ${brandN} in ${cityN}.` : `Rent a ${brandN} in ${cityN}.`,
      h1: intent === "sale" ? `Used ${brandN} in ${cityN}` : `${brandN} rental in ${cityN}`,
      intro: intent === "sale" ? `Browse used ${brandN} in ${cityN}.` : `Browse ${brandN} rentals in ${cityN}.`,
      keywords: `${brandN} ${cityN}`,
    },
    ar: {
      title: intent === "sale" ? `${brandN} مستعملة ${cityN} | Goovoiture` : `تأجير ${brandN} ${cityN} | Goovoiture`,
      description: intent === "sale" ? `${brandN} للبيع في ${cityN}.` : `كراء ${brandN} في ${cityN}.`,
      h1: intent === "sale" ? `${brandN} مستعملة في ${cityN}` : `كراء ${brandN} في ${cityN}`,
      intro: intent === "sale" ? `إعلانات ${brandN} في ${cityN}.` : `عروض كراء ${brandN} في ${cityN}.`,
      keywords: `${brandN} ${cityN}`,
    },
  };
  return { ...templates[lang], lang, path: intent === "sale" ? `/voiture-occasion/${citySlug}/${brandSlug}` : `/location-voiture/${citySlug}/${brandSlug}` };
}

export function buildCityModelSeo(lang, citySlug, brandSlug, modelSlug, intent = "rental") {
  const city = getCityBySlug(citySlug);
  const model = getModelBySlugs(brandSlug, modelSlug);
  if (!city || !model) return null;
  const cityN = getCityName(city, lang);
  const brandN = brandDisplay(model.brand, lang);
  const modelN = model.displayName;
  const templates = {
    fr: {
      title:
        intent === "sale"
          ? `${brandN} ${modelN} occasion ${cityN} | Goovoiture`
          : `Location ${brandN} ${modelN} ${cityN} | Goovoiture`,
      description:
        intent === "sale"
          ? `${brandN} ${modelN} à vendre à ${cityN}.`
          : `Louez un ${brandN} ${modelN} à ${cityN}.`,
      h1:
        intent === "sale"
          ? `${brandN} ${modelN} occasion à ${cityN}`
          : `Location ${brandN} ${modelN} à ${cityN}`,
      intro:
        intent === "sale"
          ? `Annonces ${brandN} ${modelN} à ${cityN} sur Goovoiture.`
          : `Offres de location ${brandN} ${modelN} à ${cityN}.`,
      keywords: `${brandN} ${modelN} ${cityN}`,
    },
    en: {
      title: intent === "sale" ? `Used ${brandN} ${modelN} ${cityN}` : `Rent ${brandN} ${modelN} ${cityN}`,
      description: `${brandN} ${modelN} in ${cityN}.`,
      h1: `${brandN} ${modelN} in ${cityN}`,
      intro: `${brandN} ${modelN} listings in ${cityN}.`,
      keywords: `${brandN} ${modelN} ${cityN}`,
    },
    ar: {
      title: `${brandN} ${modelN} ${cityN} | Goovoiture`,
      description: `${brandN} ${modelN} في ${cityN}.`,
      h1: `${brandN} ${modelN} في ${cityN}`,
      intro: `${brandN} ${modelN} في ${cityN}.`,
      keywords: `${brandN} ${modelN}`,
    },
  };
  return {
    ...templates[lang],
    lang,
    path:
      intent === "sale"
        ? `/voiture-occasion/${citySlug}/${brandSlug}/${modelSlug}`
        : `/location-voiture/${citySlug}/${brandSlug}/${modelSlug}`,
  };
}

export function buildAirportSeo(lang, airportSlug, categorySlug = null) {
  const airport = getAirportBySlug(airportSlug);
  if (!airport) return null;
  const airportN = getAirportName(airport, lang);
  const cat = categorySlug ? getRentalCategoryBySlug(categorySlug) : null;
  const catN = cat ? facetName(cat, lang) : null;
  const templates = {
    fr: {
      title: catN
        ? `Location ${catN} ${airportN} | Goovoiture`
        : `Location voiture ${airportN} | Goovoiture`,
      description: catN
        ? `Louez une ${catN.toLowerCase()} à ${airportN}. Réservation en ligne, véhicules vérifiés.`
        : `Location de voiture à ${airportN}. Comparez les offres aéroport sur Goovoiture.`,
      h1: catN ? `${catN} — ${airportN}` : `Location voiture ${airportN}`,
      intro: catN
        ? `Trouvez une ${catN.toLowerCase()} disponible à ${airportN} avec livraison ou retrait comptoir.`
        : `Réservez votre voiture à ${airportN} : tarifs transparents, agences vérifiées.`,
      keywords: cat?.keywords?.fr || `location voiture aeroport ${airportSlug}`,
    },
    en: {
      title: catN ? `${catN} ${airportN} | Goovoiture` : `Car rental ${airportN} | Goovoiture`,
      description: catN ? `Rent ${catN} at ${airportN}.` : `Airport car rental at ${airportN}.`,
      h1: catN ? `${catN} at ${airportN}` : `Car rental ${airportN}`,
      intro: catN ? `${catN} at ${airportN}.` : `Book airport car rental at ${airportN}.`,
      keywords: cat?.keywords?.en || `airport car rental`,
    },
    ar: {
      title: catN ? `${catN} ${airportN}` : `كراء سيارات ${airportN}`,
      description: catN ? `${catN} في ${airportN}.` : `كراء سيارات في ${airportN}.`,
      h1: catN ? `${catN} — ${airportN}` : `كراء سيارات ${airportN}`,
      intro: catN ? `${catN} في ${airportN}.` : `احجز سيارة في ${airportN}.`,
      keywords: cat?.keywords?.ar || "",
    },
  };
  const path = categorySlug
    ? `/location-voiture-aeroport/${airportSlug}/${categorySlug}`
    : `/location-voiture-aeroport/${airportSlug}`;
  return { ...templates[lang], lang, path };
}

export function buildBrandHubSeo(lang, brandSlug) {
  const brand = getBrandBySlug(brandSlug);
  if (!brand) return null;
  const brandN = brandDisplay(brand, lang);
  return {
    fr: {
      title: `${brandN} Maroc — Location & occasion | Goovoiture`,
      description: `Louez ou achetez une ${brandN} au Maroc. Toutes les villes, modèles et annonces sur Goovoiture.`,
      h1: `${brandN} au Maroc`,
      intro: `Explorez les offres ${brandN} : location journalière, voitures d'occasion et concessionnaires partenaires.`,
      keywords: `${brandN.toLowerCase()} maroc, voiture ${brandN.toLowerCase()}`,
    },
    en: {
      title: `${brandN} Morocco — Rent & buy | Goovoiture`,
      description: `Rent or buy a ${brandN} in Morocco.`,
      h1: `${brandN} in Morocco`,
      intro: `Browse ${brandN} rentals and used cars nationwide.`,
      keywords: `${brandN} morocco`,
    },
    ar: {
      title: `${brandN} المغرب | Goovoiture`,
      description: `${brandN} للكراء والبيع في المغرب.`,
      h1: `${brandN} في المغرب`,
      intro: `عروض ${brandN} في جميع المدن.`,
      keywords: `${brandN} المغرب`,
    },
  }[lang];
}

export function buildHubSeo(lang, intent) {
  const hubs = {
    rental: {
      path: "/location-voiture",
      fr: {
        title: "Location de voiture au Maroc — Toutes les villes | Goovoiture",
        description: "Location voiture Maroc : Casablanca, Rabat, Marrakech, aéroports et 45 villes.",
        h1: "Location de voiture au Maroc",
        intro: "Comparez les offres dans 45 villes, les aéroports et toutes les catégories.",
        keywords: "location voiture maroc",
      },
      en: {
        title: "Car rental Morocco — All cities | Goovoiture",
        description: "Car rental in Morocco: 45 cities and airports.",
        h1: "Car rental in Morocco",
        intro: "Compare offers across Morocco.",
        keywords: "car rental morocco",
      },
      ar: {
        title: "تأجير السيارات في المغرب | Goovoiture",
        description: "تأجير السيارات في 45 مدينة ومطار.",
        h1: "تأجير السيارات في المغرب",
        intro: "قارن العروض في جميع أنحاء المغرب.",
        keywords: "تأجير سيارات المغرب",
      },
    },
    sale: {
      path: "/voiture-occasion",
      fr: {
        title: "Voiture occasion Maroc | Goovoiture",
        description: "Voitures d'occasion au Maroc par ville et catégorie.",
        h1: "Voitures d'occasion au Maroc",
        intro: "Achetez ou vendez partout au Maroc.",
        keywords: "voiture occasion maroc",
      },
      en: {
        title: "Used cars Morocco | Goovoiture",
        description: "Used cars in Morocco by city.",
        h1: "Used cars in Morocco",
        intro: "Buy or sell nationwide.",
        keywords: "used cars morocco",
      },
      ar: {
        title: "سيارات مستعملة المغرب | Goovoiture",
        description: "سيارات مستعملة في المغرب.",
        h1: "سيارات مستعملة في المغرب",
        intro: "اشترِ أو بِع في جميع أنحاء المملكة.",
        keywords: "سيارات مستعملة المغرب",
      },
    },
  };
  const hub = hubs[intent];
  if (!hub) return null;
  const t = hub[lang] || hub.fr;
  return { ...t, lang, path: hub.path };
}

export function defaultFaqs(lang, context = {}) {
  const { cityName, categoryName, intent = "rental" } = context;
  if (lang === "en") {
    return [
      { q: `How much does car rental cost in ${cityName || "Morocco"}?`, a: "Daily rates typically range from 180 to 600 MAD depending on category and season." },
      { q: "What documents are required?", a: "Valid driving licence, ID/passport, and a credit card or deposit depending on the agency." },
      { q: "Can I pick up at the airport?", a: "Many Goovoiture partners offer airport delivery or counter pickup when available." },
    ];
  }
  if (lang === "ar") {
    return [
      { q: `كم يكلف كراء السيارات في ${cityName || "المغرب"}؟`, a: "تتراوح الأسعار اليومية عادة بين 180 و600 درهم حسب الفئة." },
      { q: "ما الوثائق المطلوبة؟", a: "رخصة السياقة وبطاقة التعريف أو جواز السفر." },
    ];
  }
  return [
    {
      q: `Quel est le prix moyen d'une ${intent === "sale" ? "voiture d'occasion" : "location voiture"} à ${cityName || "au Maroc"} ?`,
      a: intent === "sale"
        ? "Les prix varient selon marque, année et kilométrage — consultez les annonces en temps réel sur Goovoiture."
        : "Comptez entre 180 et 600 MAD/jour selon la catégorie (économique, SUV, automatique).",
    },
    {
      q: categoryName
        ? `Pourquoi choisir une ${categoryName.toLowerCase()} à ${cityName} ?`
        : "Quels documents pour louer une voiture au Maroc ?",
      a: categoryName
        ? `La ${categoryName.toLowerCase()} convient aux trajets urbains et routes nationales — comparez les offres vérifiées Goovoiture.`
        : "Permis de conduire valide, CIN ou passeport, et parfois une caution selon l'agence.",
    },
    {
      q: "Puis-je réserver en ligne sur Goovoiture ?",
      a: "Oui — parcourez les annonces, comparez les tarifs et réservez ou contactez l'agence en quelques clics.",
    },
  ];
}
