import { parseSeoPath } from "./seoPaths";
import { getCityBySlug, cityRentalPath, citySalePath } from "./cityPages";
import { DARIJA, getCityDarija } from "./seoDarija";

export const SITE_NAME = "Goovoiture";
export const DEFAULT_SITE_URL = "https://goovoiture.ma";

export const NOINDEX_PREFIXES = [
  "/admin",
  "/owner",
  "/dashboard",
  "/my-fleet",
  "/my-rentals",
  "/my-sales",
  "/my-bookings",
  "/add-rental",
  "/owner-bookings",
  "/garage",
  "/messages",
  "/profile",
  "/notifications",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/saved",
  "/kyc",
  "/referral",
  "/credit-check",
  "/fuel-tracker",
  "/car-worth",
  "/travel-ready",
  "/accident",
  "/estimate",
  "/price-alerts",
  "/verify-cin",
  "/profile-documents",
];

const STATIC_PAGES = {
  "/": {
    fr: {
      title: "Goovoiture — Location de voiture & vente auto au Maroc",
      description:
        "Louez ou achetez une voiture au Maroc. Location de voiture, marketplace automobile et annonces vérifiées à Casablanca, Rabat, Marrakech et partout au Maroc.",
      keywords:
        "location voiture maroc, voiture occasion maroc, louer voiture casablanca, vente voiture maroc, achat voiture maroc, auto occasion maroc",
      h1: "Location de voiture et vente automobile au Maroc",
      intro:
        "Goovoiture est la plateforme marocaine pour louer une voiture ou acheter un véhicule d'occasion en toute confiance. Comparez les offres de location voiture pas cher à Casablanca, Rabat, Marrakech, Tanger et Agadir — location aéroport, voiture automatique ou diesel. Parcourez aussi notre marketplace de voitures d'occasion vérifiées.",
      darija: DARIJA.home,
    },
    en: {
      title: "Goovoiture — Car Rental & Auto Marketplace in Morocco",
      description:
        "Rent or buy a car in Morocco. Car rental, used car marketplace and verified listings in Casablanca, Rabat, Marrakech and nationwide.",
      keywords:
        "car rental morocco, rent car casablanca, buy car morocco, used cars morocco",
      h1: "Car rental and automotive marketplace in Morocco",
      intro:
        "Goovoiture is Morocco's platform to rent a car or buy a used vehicle with confidence. Compare rental offers in Casablanca, Rabat, Marrakech, Tangier and Agadir, or browse our verified car marketplace.",
    },
    ar: {
      title: "Goovoiture — تأجير السيارات وبيع السيارات في المغرب",
      description:
        "استأجر أو اشترِ سيارة في المغرب. تأجير السيارات، سوق السيارات المستعملة وإعلانات موثوقة في الدار البيضاء والرباط ومراكش وطنجة.",
      keywords:
        "تأجير سيارات المغرب, كراء سيارات الدار البيضاء, بيع سيارات المغرب, سيارات مستعملة المغرب",
      h1: "تأجير السيارات وسوق السيارات في المغرب",
      intro:
        "Goovoiture هي المنصة المغربية لتأجير السيارات أو شراء سيارة مستعملة بثقة. قارن عروض الكراء في الدار البيضاء والرباط ومراكش وطنجة وأكادير، أو تصفح إعلانات السيارات الموثوقة.",
    },
  },
  "/rentals": {
    fr: {
      title: "Location de voiture au Maroc | Goovoiture",
      description:
        "Location de voiture au Maroc : comparez les offres, réservez en ligne à Casablanca, Rabat, Marrakech, Fès, Tanger et dans tout le royaume.",
      keywords:
        "location voiture maroc, location voiture pas cher maroc, louer voiture maroc, location auto casablanca, location voiture aeroport casablanca, location voiture sans caution maroc, location voiture automatique maroc",
      h1: "Location de voiture au Maroc",
      intro:
        "Trouvez la location de voiture idéale au Maroc : pas cher, avec ou sans caution, à l'aéroport Mohammed V ou Rabat-Salé, automatique ou diesel. Filtrez par ville (Casablanca, Rabat, Marrakech, Fès, Tanger), réservez en ligne et profitez de tarifs transparents sur des véhicules vérifiés.",
      darija: DARIJA.rentals,
    },
    en: {
      title: "Car Rental in Morocco | Goovoiture",
      description:
        "Car rental in Morocco: compare offers and book online in Casablanca, Rabat, Marrakech, Fes, Tangier and across the country.",
      keywords:
        "car rental morocco, rent a car casablanca, cheap car hire morocco, morocco car rental",
      h1: "Car rental in Morocco",
      intro:
        "Find the ideal rental car in Morocco. Filter by city, price and category. Online booking, transparent rates and vehicles verified by our team.",
    },
    ar: {
      title: "تأجير السيارات في المغرب | Goovoiture",
      description:
        "تأجير السيارات في المغرب: قارن العروض واحجز عبر الإنترنت في الدار البيضاء والرباط ومراكش وفاس وطنجة.",
      keywords:
        "تأجير سيارات المغرب, كراء سيارات الدار البيضاء, location voiture maroc",
      h1: "تأجير السيارات في المغرب",
      intro:
        "اعثر على سيارة الإيجار المثالية في المغرب. رشّح حسب المدينة والسعر والفئة. حجز عبر الإنترنت وأسعار شفافة وسيارات موثوقة.",
    },
  },
  "/cars": {
    fr: {
      title: "Achat & vente de voitures au Maroc | Goovoiture",
      description:
        "Marketplace automobile au Maroc : achetez ou vendez votre voiture d'occasion à Casablanca, Rabat, Marrakech et partout au Maroc.",
      keywords:
        "voiture occasion maroc, voiture à vendre maroc, achat voiture maroc, vente voiture maroc, voiture pas cher maroc, auto occasion maroc, voiture occasion casablanca, acheter voiture occasion maroc",
      h1: "Achat et vente de voitures au Maroc",
      intro:
        "Parcourez des annonces voiture occasion au Maroc : berlines, SUV, citadines, automatique ou diesel, à Casablanca, Rabat, Marrakech et partout au royaume. Achetez une voiture pas cher ou vendez la vôtre rapidement — voiture familiale, 7 places ou économique carburant.",
      darija: DARIJA.cars,
    },
    en: {
      title: "Buy & Sell Cars in Morocco | Goovoiture",
      description:
        "Morocco automotive marketplace: buy or sell used cars in Casablanca, Rabat, Marrakech and nationwide.",
      keywords:
        "buy car morocco, used cars morocco, sell car casablanca, car marketplace morocco",
      h1: "Buy and sell cars in Morocco",
      intro:
        "Browse thousands of used car listings in Morocco. Sedans, SUVs, city cars — find a vehicle that fits your budget or sell yours easily.",
    },
    ar: {
      title: "بيع وشراء السيارات في المغرب | Goovoiture",
      description:
        "سوق السيارات في المغرب: اشترِ أو بِع سيارتك المستعملة في الدار البيضاء والرباط ومراكش وجميع أنحاء المملكة.",
      keywords:
        "بيع سيارات المغرب, شراء سيارة مستعملة المغرب, voiture occasion maroc",
      h1: "بيع وشراء السيارات في المغرب",
      intro:
        "تصفح إعلانات السيارات المستعملة في المغرب. سيدان، SUV، سيارات صغيرة — اعثر على سيارة تناسب ميزانيتك أو بِع سيارتك بسهولة.",
    },
  },
  "/buying-guide": {
    fr: {
      title: "Guide d'achat voiture au Maroc | Goovoiture",
      description: "Conseils pour acheter une voiture d'occasion au Maroc en toute sécurité.",
      keywords: "acheter voiture maroc, guide achat auto maroc",
      h1: "Guide d'achat voiture au Maroc",
      intro: "Nos conseils pour acheter une voiture d'occasion au Maroc sans mauvaise surprise.",
    },
    en: {
      title: "Car Buying Guide Morocco | Goovoiture",
      description: "Tips to buy a used car in Morocco safely.",
      keywords: "buy used car morocco, car buying guide morocco",
      h1: "Car buying guide for Morocco",
      intro: "Our tips for buying a used car in Morocco with confidence.",
    },
    ar: {
      title: "دليل شراء السيارات في المغرب | Goovoiture",
      description: "نصائح لشراء سيارة مستعملة في المغرب بأمان.",
      keywords: "شراء سيارة المغرب, دليل شراء سيارة",
      h1: "دليل شراء السيارات في المغرب",
      intro: "نصائحنا لشراء سيارة مستعملة في المغرب بثقة.",
    },
  },
  "/mechanic-prices": {
    fr: {
      title: "Prix réparation auto au Maroc | Goovoiture",
      description: "Estimez les prix de réparation et d'entretien automobile au Maroc.",
      keywords: "prix réparation voiture maroc, garage maroc",
      h1: "Prix réparation automobile au Maroc",
      intro: "Estimez le coût des réparations et de l'entretien auto au Maroc.",
    },
    en: {
      title: "Car Repair Prices Morocco | Goovoiture",
      description: "Estimate car repair and maintenance costs in Morocco.",
      keywords: "car repair prices morocco, mechanic morocco",
      h1: "Car repair prices in Morocco",
      intro: "Estimate repair and maintenance costs for your car in Morocco.",
    },
    ar: {
      title: "أسعار إصلاح السيارات في المغرب | Goovoiture",
      description: "قدّر أسعار إصلاح وصيانة السيارات في المغرب.",
      keywords: "أسعار إصلاح السيارات المغرب",
      h1: "أسعار إصلاح السيارات في المغرب",
      intro: "قدّر تكلفة الإصلاح والصيانة لسيارتك في المغرب.",
    },
  },
  "/community": {
    fr: {
      title: "Communauté auto Goovoiture | Avis & entraide",
      description: "Partagez vos expériences et découvrez les avis de la communauté automobile marocaine.",
      keywords: "communauté auto maroc, avis voiture maroc",
      h1: "Communauté automobile marocaine",
      intro: "Échangez avec d'autres automobilistes au Maroc.",
    },
    en: {
      title: "Goovoiture Auto Community | Reviews & Tips",
      description: "Share experiences and read reviews from Morocco's car community.",
      keywords: "morocco car community, car reviews morocco",
      h1: "Morocco automotive community",
      intro: "Connect with fellow drivers across Morocco.",
    },
    ar: {
      title: "مجتمع Goovoiture للسيارات | آراء ونصائح",
      description: "شارك تجاربك واكتشف آراء مجتمع السيارات في المغرب.",
      keywords: "مجتمع سيارات المغرب",
      h1: "مجتمع السيارات في المغرب",
      intro: "تواصل مع السائقين في جميع أنحاء المغرب.",
    },
  },
  "/afford-car": {
    fr: {
      title: "Simulateur budget voiture | Goovoiture",
      description: "Calculez votre budget pour acheter ou louer une voiture au Maroc.",
      keywords: "budget voiture maroc, simulateur auto",
      h1: "Simulateur budget automobile",
      intro: "Calculez combien vous pouvez consacrer à l'achat ou la location d'une voiture.",
    },
    en: {
      title: "Car Budget Calculator | Goovoiture",
      description: "Calculate your budget to buy or rent a car in Morocco.",
      keywords: "car budget morocco, afford car calculator",
      h1: "Car budget calculator",
      intro: "Work out how much you can spend on buying or renting a car.",
    },
    ar: {
      title: "حاسبة ميزانية السيارة | Goovoiture",
      description: "احسب ميزانيتك لشراء أو تأجير سيارة في المغرب.",
      keywords: "ميزانية سيارة المغرب",
      h1: "حاسبة ميزانية السيارة",
      intro: "احسب ما يمكنك تخصيصه لشراء أو كراء سيارة.",
    },
  },
  "/emergency": {
    fr: {
      title: "Assistance & urgence route | Goovoiture",
      description: "Numéros utiles et conseils en cas d'urgence sur la route au Maroc.",
      keywords: "urgence route maroc, assistance auto maroc",
      h1: "Assistance route au Maroc",
      intro: "Numéros utiles et conseils en cas d'urgence sur la route.",
    },
    en: {
      title: "Road Emergency Assistance | Goovoiture Morocco",
      description: "Useful numbers and tips for road emergencies in Morocco.",
      keywords: "road emergency morocco, car breakdown morocco",
      h1: "Road emergency assistance in Morocco",
      intro: "Useful contacts and tips when you need help on the road.",
    },
    ar: {
      title: "المساعدة على الطريق | Goovoiture المغرب",
      description: "أرقام مفيدة ونصائح في حالات الطوارئ على الطريق في المغرب.",
      keywords: "طوارئ الطريق المغرب",
      h1: "المساعدة على الطريق في المغرب",
      intro: "أرقام ونصائح مفيدة في حالات الطوارئ على الطريق.",
    },
  },
  "/vendre-ma-voiture": {
    fr: {
      title: "Vendre ma voiture au Maroc | Goovoiture",
      description:
        "Vendez votre voiture rapidement au Maroc. Publiez une annonce gratuite, estimation voiture occasion, reprise et visibilité à Casablanca, Rabat, Marrakech et partout au Maroc.",
      keywords:
        "vendre ma voiture maroc, vendre voiture rapidement maroc, estimation voiture maroc, publier annonce voiture, reprise voiture maroc, prix voiture occasion maroc",
      h1: "Vendre ma voiture au Maroc",
      intro:
        "Vous souhaitez vendre votre voiture d'occasion au Maroc ? Sur Goovoiture, publiez votre annonce en quelques minutes, touchez des acheteurs sérieux à Casablanca, Rabat, Marrakech, Tanger et dans tout le royaume. Annonces vérifiées, messagerie sécurisée et visibilité maximale sur notre marketplace automobile.",
      darija: DARIJA.sell,
    },
    en: {
      title: "Sell My Car in Morocco | Goovoiture",
      description:
        "Sell your car fast in Morocco. Free listing, used car valuation, and buyers in Casablanca, Rabat, Marrakech and nationwide.",
      keywords:
        "sell my car morocco, sell car fast morocco, car valuation morocco, list car for sale morocco",
      h1: "Sell your car in Morocco",
      intro:
        "Want to sell your used car in Morocco? List on Goovoiture in minutes, reach verified buyers across Casablanca, Rabat, Marrakech and nationwide. Secure messaging and maximum visibility.",
      darija: null,
    },
    ar: {
      title: "بيع سيارتي في المغرب | Goovoiture",
      description:
        "بيع سيارتك بسرعة في المغرب. انشر إعلانك مجاناً، تقييم السيارة المستعملة، ووصول للمشترين في الدار البيضاء والرباط ومراكش.",
      keywords:
        "بيع سيارتي, بيع السيارة بسرعة, تقييم السيارة المغرب, نشر إعلان سيارة, ثمن السيارة المستعملة",
      h1: "بيع سيارتي في المغرب",
      intro:
        "تريد بيع سيارتك المستعملة في المغرب؟ انشر إعلانك على Goovoiture في دقائق، وتواصل مع مشترين جادين في الدار البيضاء والرباط ومراكش وجميع أنحاء المملكة.",
      darija: "Bghiti nbi3 tomobil dyalek? Dder annonce 3la Goovoiture w wsel l-machetin f l-Maghrib.",
    },
  },
};

function cityRentalSeo(lang, city) {
  const n = city.name[lang];
  const airportFr =
    city.airport && lang === "fr"
      ? ` Location voiture ${city.airport.fr} disponible.`
      : "";
  const airportEn =
    city.airport && lang === "en" ? ` ${city.airport.en} car rental available.` : "";
  const darija = getCityDarija(city.slug, "rental");

  const templates = {
    fr: {
      title: `Location voiture ${n} — Pas cher | Goovoiture Maroc`,
      description: `Location de voiture ${n} au meilleur prix. Louer voiture ${n}, location auto pas cher, automatique et diesel.${airportFr} Réservation en ligne.`,
      keywords: `location voiture ${n.toLowerCase()}, louer voiture ${n.toLowerCase()}, location voiture pas cher ${n.toLowerCase()}, location auto maroc${city.slug === "casablanca" ? ", location voiture aeroport mohammed v" : city.slug === "rabat" ? ", location voiture aeroport rabat" : ""}`,
      h1: `Location de voiture à ${n}`,
      intro: `Comparez les offres de location de voiture à ${n} : tarifs pas cher, voiture automatique ou diesel, avec ou sans caution. Réservez en ligne sur Goovoiture — véhicules vérifiés, livraison aéroport ou hôtel selon les offres.${airportFr}`,
      darija,
    },
    en: {
      title: `Car Rental ${n} — Cheap | Goovoiture Morocco`,
      description: `Rent a car in ${n}, Morocco at the best price. Cheap car hire, automatic & diesel.${airportEn} Book online.`,
      keywords: `car rental ${city.slug}, rent car ${n}, cheap car rental morocco, car hire ${city.slug}`,
      h1: `Car rental in ${n}`,
      intro: `Compare car rental offers in ${n}: transparent pricing, automatic or diesel vehicles. Book online on Goovoiture.${airportEn}`,
      darija: null,
    },
    ar: {
      title: `كراء السيارات ${n} | Goovoiture المغرب`,
      description: `كراء وتأجير السيارات في ${n} بأفضل سعر. حجز عبر الإنترنت، سيارات موثوقة.`,
      keywords: `كراء السيارات ${n}, تأجير سيارات ${n}, kra tomobil ${city.slug}`,
      h1: `كراء وتأجير السيارات في ${n}`,
      intro: `قارن عروض كراء السيارات في ${n} على Goovoiture. أسعار شفافة، حجز سريع، سيارات موثوقة.`,
      darija: darija,
    },
  };
  return templates[lang];
}

function citySaleSeo(lang, city) {
  const n = city.name[lang];
  const darija = getCityDarija(city.slug, "sale");

  const templates = {
    fr: {
      title: `Voiture occasion ${n} — À vendre | Goovoiture`,
      description: `Voiture occasion ${n} : achetez ou vendez au Maroc. Annonces vérifiées, voiture pas cher, berlines, SUV, automatique et diesel.`,
      keywords: `voiture occasion ${n.toLowerCase()}, voiture à vendre ${n.toLowerCase()}, acheter voiture ${n.toLowerCase()}, auto occasion maroc, tomobil lil bi3 ${city.slug}`,
      h1: `Voitures d'occasion à ${n}`,
      intro: `Parcourez les annonces voiture occasion à ${n} sur Goovoiture : meilleur prix, voiture fiable, familiale ou citadine. Vendez votre auto rapidement ou achetez en toute confiance.`,
      darija,
    },
    en: {
      title: `Used Cars ${n} — For Sale | Goovoiture`,
      description: `Used cars in ${n}, Morocco. Verified listings — buy or sell sedans, SUVs and more.`,
      keywords: `used cars ${city.slug}, cars for sale ${n}, buy car ${city.slug}`,
      h1: `Used cars in ${n}`,
      intro: `Browse used car listings in ${n} on Goovoiture. Buy or sell with confidence.`,
      darija: null,
    },
    ar: {
      title: `سيارات مستعملة ${n} | Goovoiture`,
      description: `سيارات للبيع في ${n}. إعلانات موثوقة، شراء وبيع السيارات المستعملة.`,
      keywords: `سيارات للبيع ${n}, سيارات مستعملة ${n}, tomobil lil bi3 ${city.slug}`,
      h1: `سيارات مستعملة للبيع في ${n}`,
      intro: `تصفح إعلانات السيارات المستعملة في ${n} على Goovoiture.`,
      darija,
    },
  };
  return templates[lang];
}

export function getSeoLangFromPath(pathname) {
  return parseSeoPath(pathname).lang;
}

export function isNoIndexPath(pathname) {
  const { basePath } = parseSeoPath(pathname);
  return NOINDEX_PREFIXES.some(
    (p) => basePath === p || basePath.startsWith(`${p}/`)
  );
}

export function getSeoForPath(pathname, langOverride = null) {
  const { lang: pathLang, basePath } = parseSeoPath(pathname);
  const lang = langOverride || pathLang;

  const cityRentalMatch = basePath.match(/^\/location-voiture\/([^/]+)$/);
  if (cityRentalMatch) {
    const city = getCityBySlug(cityRentalMatch[1]);
    if (city) return { ...cityRentalSeo(lang, city), lang, path: basePath };
  }

  const citySaleMatch = basePath.match(/^\/location-voiture-occasion\/([^/]+)$/);
  if (citySaleMatch) {
    const city = getCityBySlug(citySaleMatch[1]);
    if (city) return { ...citySaleSeo(lang, city), lang, path: basePath };
  }

  const page = STATIC_PAGES[basePath];
  if (page) return { ...page[lang], lang, path: basePath };
  return null;
}

/** @deprecated use getSeoForPath */
export function getStaticSeoForPath(pathname) {
  const seo = getSeoForPath(pathname, "fr");
  if (!seo) return null;
  return { path: seo.path, title: seo.title, description: seo.description, priority: "0.5", changefreq: "weekly" };
}

export const STATIC_PUBLIC_PAGES = Object.keys(STATIC_PAGES).map((path) => {
  const fr = STATIC_PAGES[path].fr;
  return {
    path,
    title: fr.title,
    description: fr.description,
    priority: path === "/" ? "1.0" : path === "/rentals" || path === "/cars" || path === "/vendre-ma-voiture" ? "0.9" : "0.5",
    changefreq: path === "/" || path === "/rentals" || path === "/cars" || path === "/vendre-ma-voiture" ? "daily" : "monthly",
  };
});

export function buildSaleListingSeo(lang, car) {
  const city = car.city || "Maroc";
  const price = Number(car.price).toLocaleString(lang === "ar" ? "ar-MA" : lang === "en" ? "en-US" : "fr-MA");
  const templates = {
    fr: {
      title: `${car.brand} ${car.model} ${car.year} à vendre — ${city} | Goovoiture`,
      description: (car.description || `${car.brand} ${car.model} ${car.year} à ${city}. Prix: ${price} MAD.`).slice(0, 160),
    },
    en: {
      title: `${car.brand} ${car.model} ${car.year} for sale — ${city} | Goovoiture`,
      description: (car.description || `${car.brand} ${car.model} ${car.year} in ${city}. Price: ${price} MAD.`).slice(0, 160),
    },
    ar: {
      title: `${car.brand} ${car.model} ${car.year} للبيع — ${city} | Goovoiture`,
      description: (car.description || `${car.brand} ${car.model} ${car.year} في ${city}. السعر: ${price} درهم.`).slice(0, 160),
    },
  };
  return templates[lang] || templates.fr;
}

export function buildRentalListingSeo(lang, rental) {
  const city = rental.city || "Maroc";
  const price = Number(rental.pricePerDay).toLocaleString(lang === "ar" ? "ar-MA" : lang === "en" ? "en-US" : "fr-MA");
  const templates = {
    fr: {
      title: `Location ${rental.brand} ${rental.model} ${rental.year} — ${city} | Goovoiture`,
      description: (rental.description || `Louez une ${rental.brand} ${rental.model} à ${city}. À partir de ${price} MAD/jour.`).slice(0, 160),
    },
    en: {
      title: `Rent ${rental.brand} ${rental.model} ${rental.year} — ${city} | Goovoiture`,
      description: (rental.description || `Rent a ${rental.brand} ${rental.model} in ${city}. From ${price} MAD/day.`).slice(0, 160),
    },
    ar: {
      title: `تأجير ${rental.brand} ${rental.model} ${rental.year} — ${city} | Goovoiture`,
      description: (rental.description || `استأجر ${rental.brand} ${rental.model} في ${city}. من ${price} درهم/اليوم.`).slice(0, 160),
    },
  };
  return templates[lang] || templates.fr;
}

export function getSiteUrl() {
  const fromEnv = import.meta.env.VITE_SITE_URL;
  if (fromEnv) return String(fromEnv).replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return DEFAULT_SITE_URL;
}

export { getCityBySlug, cityRentalPath, citySalePath, MOROCCO_CITIES } from "./cityPages";
