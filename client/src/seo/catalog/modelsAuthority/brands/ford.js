/** @type {import("../index.js").AuthorityModel[]} */
export const FORD_MODELS = [
  {
    brandSlug: "ford",
    modelSlug: "fiesta",
    displayName: "Ford Fiesta",
    listingTerms: ["fiesta"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "La Ford Fiesta a marqué le segment B marocain par son châssis ludique et ses motorisations EcoBoost. Citadine agile pour médinas et parkings serrés, elle reste visible en occasion même si Ford a réduit sa présence neuf locale.",
    popularity:
      "Les Fiesta EcoBoost 100 ch et diesel TDCi équipent encore un parc important. Appréciée pour la direction précise et le comportement routier supérieur à beaucoup de rivales. Réseau Ford moins dense qu'avant mais pièces encore circulant.",
    engines: {
      diesel: "1.5 TDCi 85 ch — économique occasion.",
      essence: "1.0 EcoBoost 100/125 ch et 1.1 Ti-VCT.",
      automatic: "Powershift sur anciennes — à vérifier ; auto récente rare.",
      manual: "BVM 5/6 — agréable, fiable.",
    },
    consumption: { city: "6,0–7,5 L/100 km", highway: "4,5–5,5 L/100 km" },
    reliability: {
      strengths: [
        "Châssis référence du segment B",
        "EcoBoost performant",
        "Prix occasion attractifs",
      ],
      weaknesses: [
        "Réseau Ford en retrait au Maroc",
        "Powershift ancienne à éviter si mal entretenue",
        "Revente en baisse vs Clio/208",
      ],
    },
    prices: {
      occasion: "55 000 – 110 000 MAD selon génération.",
      recent: "115 000 – 145 000 MAD pour Fiesta VII EcoBoost faible km.",
      popularVersions: ["Fiesta Trend", "Fiesta Titanium", "Fiesta ST-Line", "Fiesta 1.0 EcoBoost"],
    },
    maintenance:
      "4 000–6 500 MAD/an. Pièces via concession Ford résiduelle et marché adaptables.",
    audience: {
      youngDrivers: "Châssis fun — excellent rapport plaisir/prix occasion.",
      families: "Deux enfants urbains — coffre modeste.",
      professionals: "Commerciaux urbains budget.",
      longDistance: "EcoBoost acceptable ; berline préférable si fréquent.",
    },
    faqs: [
      { q: "Fiesta ou 208 ?", a: "Fiesta châssis ; 208 design et réseau Peugeot." },
      { q: "EcoBoost fiable ?", a: "Oui avec vidanges — surveiller turbo et refroidissement." },
      { q: "Prix Fiesta 2018 EcoBoost ?", a: "95 000–120 000 MAD selon Titanium." },
      { q: "Fiesta ST au Maroc ?", a: "Rare occasion — sportive et recherchée." },
      { q: "Powershift problème ?", a: "Ancienne boîte à double embrayage — historique entretien crucial." },
      { q: "Fiesta en location ?", a: "Moins courante — agences économiques Goovoiture." },
      { q: "Consommation EcoBoost Casa ?", a: "6,5–7 L/100 km ville avec clim." },
      { q: "Pièces Fiesta Maroc ?", a: "Disponibles mais délais variables hors Casa." },
      { q: "Fiesta ou Clio ?", a: "Fiesta conduite ; Clio réseau et revente." },
      { q: "Contrôle occasion ?", a: "EcoBoost, embrayage, Powershift si auto, carrosserie." },
    ],
  },
  {
    brandSlug: "ford",
    modelSlug: "focus",
    displayName: "Ford Focus",
    listingTerms: ["focus"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "La Ford Focus apporte le meilleur châssis du segment C au Maroc. Berline ou break, elle séduit les conducteurs exigeants sur routes sinueuses de l'Atlas moyen et rocades urbaines — alternative crédible à Mégane et Leon en occasion.",
    popularity:
      "EcoBoost 125/150 ch et TDCi 120 structurent l'occasion. Image moins premium qu'une VW mais comportement routier reconnu. Parc stable à Casa et Rabat, prix souvent inférieurs à Golf pour équipement comparable.",
    engines: {
      diesel: "1.5 TDCi 120 ch — économique route.",
      essence: "1.0 EcoBoost 125 ch et 1.5 EcoBoost 150 ch.",
      automatic: "Powershift ou auto 8 rapports selon génération.",
      manual: "BVM 6 — précise et fiable.",
    },
    consumption: { city: "6,5–8,0 L/100 km", highway: "4,8–5,8 L/100 km" },
    reliability: {
      strengths: [
        "Tenue de route exceptionnelle",
        "EcoBoost moderne",
        "Prix occasion compétitifs",
      ],
      weaknesses: [
        "Réseau Ford réduit",
        "Powershift controversée — préférer manuelle occasion",
        "Finitions inférieures à Golf",
      ],
    },
    prices: {
      occasion: "75 000 – 140 000 MAD Focus III/IV.",
      recent: "145 000 – 185 000 MAD Focus IV ST-Line récente.",
      popularVersions: ["Focus Trend", "Focus Titanium", "Focus ST-Line", "Focus 1.5 EcoBoost"],
    },
    maintenance:
      "5 000–8 000 MAD/an. Courroie distribution wet belt sur certains EcoBoost — vérifier.",
    audience: {
      youngDrivers: "ST-Line — style et chassis si budget OK.",
      families: "Break SW pratique — 3 enfants possible.",
      professionals: "Commerciaux régionaux — agréable sur long trajet.",
      longDistance: "TDCi ou EcoBoost 150 — excellent compromis.",
    },
    faqs: [
      { q: "Focus ou Megane ?", a: "Focus conduite ; Mégane réseau Renault dense." },
      { q: "EcoBoost 1.0 courroie humide ?", a: "Point critique — exiger preuve remplacement préventif." },
      { q: "Prix Focus 2019 EcoBoost ?", a: "125 000–155 000 MAD selon ST-Line." },
      { q: "Focus ST au Maroc ?", a: "Occasion rare — sportive recherchée, assurance élevée." },
      { q: "Focus break SW ?", a: "Coffre familial — bon choix occasion." },
      { q: "Consommation TDCi route ?", a: "5–5,5 L/100 km autoroute." },
      { q: "Focus en location ?", a: "Stock limité — Goovoiture agences." },
      { q: "Powershift ou manuelle ?", a: "Manuelle recommandée occasion — moins risquée." },
      { q: "Fiabilité Focus IV ?", a: "Bonne manuelle ; vigilance wet belt EcoBoost." },
      { q: "Contrôle avant achat ?", a: "Wet belt, turbo, embrayage, train roulant, Powershift si auto." },
    ],
  },
];
