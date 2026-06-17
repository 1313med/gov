/** @type {import("../index.js").AuthorityModel[]} */
export const MERCEDES_MODELS = [
  {
    brandSlug: "mercedes",
    modelSlug: "classe-c",
    displayName: "Mercedes Classe C",
    listingTerms: ["classe c", "class c", "c 180", "c 200", "c 220", "c180", "c200"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "La Mercedes Classe C incarne la berline premium allemande au Maroc. Présente dans les quartiers d'affaires de Casablanca Marina, Anfa et les résidences de Rabat, elle allie statut social, confort autoroute et technologies MBUX sur les générations récentes.",
    popularity:
      "En occasion, la Classe C diesel CDI et les essence turbo équipent cadres, médecins et dirigeants. Le réseau Mercedes-Benz Morocco assure un SAV structuré ; le coût d'entretien reste le principal frein pour l'acheteur moyen.",
    engines: {
      diesel: "C 220 d et C 200 d — couple et sobriété autoroute Casa–Rabat.",
      essence: "C 180 et C 200 — fluides en ville, entretien premium.",
      automatic: "9G-Tronic quasi systématique — référence fluidité.",
      manual: "Quasi absente sur C récente au Maroc.",
    },
    consumption: { city: "7,5–9,5 L/100 km", highway: "5,0–6,5 L/100 km" },
    reliability: {
      strengths: [
        "Finitions et confort haut de gamme",
        "Sécurité et assistance conduite MB",
        "Image et revente dans le premium",
      ],
      weaknesses: [
        "Coût entretien et pièces élevé",
        "Électronique complexe hors garantie",
        "Décote importante première année",
      ],
    },
    prices: {
      occasion: "220 000 – 350 000 MAD selon génération W205/W206.",
      recent: "360 000 – 480 000 MAD pour C récente faible km.",
      popularVersions: ["C 180", "C 200", "C 220 d", "C 300 AMG Line"],
    },
    maintenance:
      "12 000–25 000 MAD/an possible. Entretien Mercedes obligatoire pour valeur. Pneus runflat coûteux.",
    audience: {
      youngDrivers: "Rare — budget assurance et crédit élevé.",
      families: "Possible — coffre correct, 2 enfants confortables.",
      professionals: "Cible principale — image executive.",
      longDistance: "CDI idéal pour liaisons inter-villes fréquentes.",
    },
    faqs: [
      { q: "Classe C ou Série 3 ?", a: "C plus confortable ; BMW 3 plus sportive. Entretien comparable premium." },
      { q: "C 220 d consommation ?", a: "5,5–6 L/100 km autoroute ; 8 L ville." },
      { q: "Prix C 200 2018 ?", a: "260 000–310 000 MAD selon finition et km." },
      { q: "Entretien Mercedes hors garantie ?", a: "Budget sérieux — contrats maintenance recommandés." },
      { q: "Classe C en location ?", a: "Loueurs luxe aéroport — Goovoiture premium." },
      { q: "Fiabilité W205 ?", a: "Correcte avec entretien ; vigilance AdBlue, capteurs, boîte 9G." },
      { q: "C 180 suffisante ?", a: "Oui en usage urbain Casa/Rabat ; C 200 plus à l'aise autoroute." },
      { q: "Assurance Classe C ?", a: "Prime haute — tous risques quasi standard." },
      { q: "Occasion importée ?", a: "Vérifier homologation, historique et équipements Maroc." },
      { q: "Contrôle avant achat ?", a: "9G-Tronic, turbo, suspension, historique Mercedes, carrosserie." },
    ],
  },
  {
    brandSlug: "mercedes",
    modelSlug: "classe-e",
    displayName: "Mercedes Classe E",
    listingTerms: ["classe e", "class e", "e 200", "e 220", "e200", "e220"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "La Classe E est la grande berline Mercedes pour dirigeants et grandes fortunes au Maroc. Habitacle luxueux, silence de roulement et technologies de pointe : elle domine les arrivées à l'aéroport Mohammed V et les résidences huppées de la Corniche.",
    popularity:
      "Moins volumineuse en occasion que la Classe C mais très recherchée en finitions AMG Line et diesel CDI pour les longs trajets. Symbole de réussite, elle attire une clientèle exigeante sur le confort et la discrétion.",
    engines: {
      diesel: "E 220 d et E 300 d — référence grands routiers.",
      essence: "E 200 et E 300 — puissance et raffinement.",
      automatic: "9G-Tronic — standard, très confortable.",
      manual: "Inexistante sur E récente.",
    },
    consumption: { city: "8,5–10,5 L/100 km", highway: "5,5–7,0 L/100 km" },
    reliability: {
      strengths: [
        "Confort autoroute inégalé segment",
        "Technologies sécurité avancées",
        "Prestige maximal Mercedes généraliste",
      ],
      weaknesses: [
        "Coût total possession très élevé",
        "Réparations électroniques onéreuses",
        "Gabarit encombrant en médina",
      ],
    },
    prices: {
      occasion: "280 000 – 420 000 MAD pour W213 diesel.",
      recent: "430 000 – 600 000 MAD pour E récente faible km.",
      popularVersions: ["E 200", "E 220 d", "E 300", "E AMG Line"],
    },
    maintenance:
      "15 000–30 000 MAD/an. Contrat maintenance Mercedes fortement conseillé. Freins et pneus premium.",
    audience: {
      youngDrivers: "Non pertinent.",
      families: "Grande berline — confort arrière exceptionnel.",
      professionals: "Dirigeants, diplomates, professions libérales.",
      longDistance: "Usage idéal — CDI autoroute référence.",
    },
    faqs: [
      { q: "Classe E ou Série 5 ?", a: "E confort Mercedes ; S5 dynamique BMW. Prix proches occasion." },
      { q: "E 220 d consommation route ?", a: "6 L/100 km possible à allure modérée." },
      { q: "Prix E 2017 diesel ?", a: "300 000–380 000 MAD selon finition." },
      { q: "E en location avec chauffeur ?", a: "Courant aéroport et hôtels — Goovoiture avec chauffeur." },
      { q: "Fiabilité Classe E ?", a: "Bonne avec entretien Mercedes ; coût panne élevé hors garantie." },
      { q: "E ou Classe C ?", a: "E plus espace et prestige ; C plus maniable et abordable." },
      { q: "Assurance Classe E ?", a: "Très élevée — valeur vénale importante." },
      { q: "Import Allemagne ?", a: "Possible — vérifier conformité et historique complet." },
      { q: "AMG Line ?", a: "Esthétique et chassis — pas un AMG performance pur." },
      { q: "Contrôle occasion ?", a: "Airmatic si équipé, 9G, AdBlue, historique MB complet." },
    ],
  },
];
