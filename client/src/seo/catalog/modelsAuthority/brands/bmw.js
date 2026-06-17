/** @type {import("../index.js").AuthorityModel[]} */
export const BMW_MODELS = [
  {
    brandSlug: "bmw",
    modelSlug: "serie-3",
    displayName: "BMW Série 3",
    listingTerms: ["série 3", "serie 3", "series 3", "320", "318", "330"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "La BMW Série 3 reste la référence berline sportive premium au Maroc. Guidage précis, moteurs turbo performants et image « Ultimate Driving Machine » séduisent les cadres de Casablanca Finance City et les passionnés d'automobile.",
    popularity:
      "En occasion, les 320d et 320i dominent les annonces. Réseau BMW Morocco présent à Casa, Rabat, Marrakech. Compromise entre plaisir de conduite et usage quotidien — plus sportive qu'une Classe C, plus accessible qu'une Série 5.",
    engines: {
      diesel: "320d 190 ch — équilibre couple/consommation.",
      essence: "318i, 320i et 330i — performances variables.",
      automatic: "BVA 8 rapports ZF — réactive et fiable si entretenue.",
      manual: "Rare sur G20 — encore visible occasion F30.",
    },
    consumption: { city: "7,5–9,5 L/100 km", highway: "5,0–6,5 L/100 km" },
    reliability: {
      strengths: [
        "Châssis et direction de référence",
        "Moteurs B47/B48 modernes",
        "Forte demande occasion premium",
      ],
      weaknesses: [
        "Coût entretien BMW élevé",
        "Pneus runflat et freins coûteux",
        "Électronique iDrive parfois coûteuse",
      ],
    },
    prices: {
      occasion: "200 000 – 320 000 MAD F30/G20 selon motorisation.",
      recent: "330 000 – 420 000 MAD pour Série 3 récente M Sport.",
      popularVersions: ["320d", "320i", "330i", "M Sport"],
    },
    maintenance:
      "10 000–22 000 MAD/an. Vidanges BMW Longlife. Disques et plaquetes M sport sollicités.",
    audience: {
      youngDrivers: "320i occasion possible — assurance élevée.",
      families: "4 places — coffre correct, pas van familial.",
      professionals: "Cadres, consultants — image dynamique.",
      longDistance: "320d excellent sur autoroute.",
    },
    faqs: [
      { q: "Série 3 ou Classe C ?", a: "S3 plus sportive ; Classe C plus confortable et sobre." },
      { q: "320d consommation ?", a: "5,5–6 L/100 km route ; 8 L ville." },
      { q: "Prix 320d 2017 ?", a: "230 000–280 000 MAD selon M Sport et km." },
      { q: "Fiabilité F30 ?", a: "Correcte ; turbo et BVA à surveiller après 120 000 km." },
      { q: "M Sport ?", a: "Suspension ferme — routes marocaines parfois dures." },
      { q: "Entretien BMW Maroc ?", a: "Concessions Casa/Rabat — pièces premium." },
      { q: "Série 3 location ?", a: "Loueurs premium — Goovoiture." },
      { q: "320i ou 330i ?", a: "320i suffisant urbain ; 330i pour passionnés autoroute." },
      { q: "Runflat obligatoire ?", a: "Souvent d'origine — confort moindre, remplacement coûteux." },
      { q: "Contrôle occasion ?", a: "BVA ZF, turbo, fuites huile, historique BMW, train roulant." },
    ],
  },
  {
    brandSlug: "bmw",
    modelSlug: "serie-5",
    displayName: "BMW Série 5",
    listingTerms: ["série 5", "serie 5", "series 5", "520", "530", "525"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "La BMW Série 5 élève la berline executive au Maroc : espace arrière généreux, technologies Driving Assistant et moteurs six cylindres sur finitions hautes. Elle rivalise avec Classe E pour les trajets Casa–Rabat en première classe.",
    popularity:
      "Moins commune que la Série 3, la Série 5 attire dirigeants et hauts revenus. Les 520d et 530d offrent un compromis luxe/TCO ; l'image BMW reste forte dans le premium marocain.",
    engines: {
      diesel: "520d et 530d — autoroute et couple.",
      essence: "520i et 530i — fluides et silencieuses.",
      automatic: "BVA 8 rapports — standard.",
      manual: "Très rare occasion récente.",
    },
    consumption: { city: "8,5–10,5 L/100 km", highway: "5,5–7,0 L/100 km" },
    reliability: {
      strengths: [
        "Confort et dynamisme uniques",
        "Habitacle technologique iDrive",
        "520d économique pour la catégorie",
      ],
      weaknesses: [
        "TCO très élevé",
        "Complexité électronique",
        "Poids — freins et pneus onéreux",
      ],
    },
    prices: {
      occasion: "260 000 – 400 000 MAD G30 selon motorisation.",
      recent: "410 000 – 550 000 MAD pour 530d/i récente.",
      popularVersions: ["520d", "530d", "530i", "M Sport"],
    },
    maintenance:
      "14 000–28 000 MAD/an. Contrats BMW Service Inclusive recommandés en garantie.",
    audience: {
      youngDrivers: "Non ciblé.",
      families: "Grande berline confortable — 3 enfants possible.",
      professionals: "Dirigeants, avocats, médecins — executive.",
      longDistance: "520d/530d — parmi les meilleures autoroute.",
    },
    faqs: [
      { q: "Série 5 ou Classe E ?", a: "S5 conduite ; E confort absolu. Budget entretien similaire." },
      { q: "520d consommation route ?", a: "6 L/100 km réalisable — excellent pour la taille." },
      { q: "Prix 520d 2018 ?", a: "290 000–350 000 MAD selon équipement." },
      { q: "Série 5 en ville Marrakech ?", a: "Gabarit large — parking médina difficile." },
      { q: "Fiabilité G30 ?", a: "Bonne avec entretien BMW ; coût hors garantie élevé." },
      { q: "530d ou 520d ?", a: "530d plus couple ; 520d suffisant usage mixte Maroc." },
      { q: "Location Série 5 ?", a: "Premium aéroport — tarifs élevés Goovoiture." },
      { q: "xDrive nécessaire ?", a: "Utile Atlas hiver ; rarement indispensable Casa." },
      { q: "Assurance Série 5 ?", a: "Très haute — tous risques obligatoire." },
      { q: "Contrôle occasion ?", a: "BVA, AdBlue, air suspension si équipée, historique BMW." },
    ],
  },
];
