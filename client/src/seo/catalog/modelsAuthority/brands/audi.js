/** @type {import("../index.js").AuthorityModel[]} */
export const AUDI_MODELS = [
  {
    brandSlug: "audi",
    modelSlug: "a3",
    displayName: "Audi A3",
    listingTerms: ["a3"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "L'Audi A3 compacte premium séduit au Maroc par ses finitions intérieur, la transmission quattro sur certaines versions et le cockpit virtuel. Concurrente directe de Golf et Classe A, elle attire une clientèle urbaine aisée à Casablanca et Rabat.",
    popularity:
      "L'A3 Sportback domine les annonces — pratique et élégante. Les motorisations TFSI et TDI bénéficient du réseau Audi/VW Group. Image premium plus discrète qu'une Mercedes, avec un intérieur souvent supérieur au segment.",
    engines: {
      diesel: "2.0 TDI 150 ch — autoroute économique.",
      essence: "1.4 TFSI et 1.5 TFSI 150 ch — urbain dynamique.",
      automatic: "S tronic DSG — fluide, entretien spécifique.",
      manual: "BVM 6 sur entrées — rare en occasion récente.",
    },
    consumption: { city: "6,5–8,0 L/100 km", highway: "4,5–5,5 L/100 km" },
    reliability: {
      strengths: [
        "Qualité intérieure premium",
        "quattro utile pluie montagne",
        "Plateforme MQB solide",
      ],
      weaknesses: [
        "Coût entretien Audi élevé",
        "DSG à budgetiser",
        "Espace arrière limité vs A4",
      ],
    },
    prices: {
      occasion: "140 000 – 220 000 MAD A3 8V/8Y.",
      recent: "230 000 – 290 000 MAD A3 récente S line.",
      popularVersions: ["A3 Sportback", "A3 S line", "A3 35 TFSI", "A3 2.0 TDI"],
    },
    maintenance:
      "7 000–12 000 MAD/an. Réseau Audi Casa/Rabat. Huiles VW spec.",
    audience: {
      youngDrivers: "Premium urbain — budget et assurance élevés.",
      families: "Deux enfants max confortablement.",
      professionals: "Image soignée discrète.",
      longDistance: "TDI ou TFSI 150 — stable autoroute.",
    },
    faqs: [
      { q: "A3 ou Golf 8 ?", a: "A3 finitions ; Golf polyvalence et revente." },
      { q: "S tronic fiable ?", a: "Avec vidanges régulières — essai obligatoire occasion." },
      { q: "Prix A3 2019 TFSI ?", a: "175 000–210 000 MAD selon S line." },
      { q: "quattro utile Maroc ?", a: "Pluie, Fès montagne — confort sécurité, pas indispensable Casa." },
      { q: "A3 en location ?", a: "Loueurs premium — stock limité Goovoiture." },
      { q: "Consommation 35 TFSI ?", a: "7 L/100 km mixte avec clim." },
      { q: "A3 ou Classe A ?", a: "A3 sportback pratique ; Classe A badge Mercedes." },
      { q: "Fiabilité A3 8Y ?", a: "Bonne ; jeune parc Maroc." },
      { q: "Entretien Audi prix ?", a: "Supérieur généraliste — contrat Audi Service." },
      { q: "Contrôle occasion ?", a: "DSG, turbo, Virtual Cockpit, historique Audi/VW." },
    ],
  },
  {
    brandSlug: "audi",
    modelSlug: "a4",
    displayName: "Audi A4",
    listingTerms: ["a4"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "L'Audi A4 est la berline premium de volume au Maroc : plus spacieuse que l'A3, technologique et confortable sur les autoroutes vers Tanger ou El Jadida. Elle équipe flottes d'entreprises et cadres supérieurs recherchant discrétion et qualité.",
    popularity:
      "Les A4 35 TDI et 40 TFSI structurent l'occasion premium généraliste. Virtual Cockpit, finitions S line et quattro ultra renforcent l'attrait. Réseau Audi moins dense que BMW mais SAV compétent grandes villes.",
    engines: {
      diesel: "35 TDI et 40 TDI — couple autoroute.",
      essence: "35 TFSI et 45 TFSI — performances progressives.",
      automatic: "S tronic ou tiptronic selon génération.",
      manual: "Rare B9/B9 restylée.",
    },
    consumption: { city: "7,5–9,0 L/100 km", highway: "5,0–6,0 L/100 km" },
    reliability: {
      strengths: [
        "Confort et silence route",
        "Intérieur premium durable",
        "TDI économique segment D premium",
      ],
      weaknesses: [
        "TCO élevé hors garantie",
        "Boîtes et AdBlue à surveiller",
        "Décote importante neuve",
      ],
    },
    prices: {
      occasion: "200 000 – 320 000 MAD B9 diesel.",
      recent: "330 000 – 420 000 MAD A4 récente S line.",
      popularVersions: ["A4 35 TDI", "A4 40 TDI", "A4 S line", "A4 Avant"],
    },
    maintenance:
      "10 000–20 000 MAD/an. Pneus 245/40 R18 sur S line. Audi Casa.",
    audience: {
      youngDrivers: "Peu ciblé — seconde voiture famille aisée.",
      families: "4 adultes confort — Avant pratique.",
      professionals: "Cadres, avocats — executive discret.",
      longDistance: "TDI référence — confort et sobriété.",
    },
    faqs: [
      { q: "A4 ou Classe C ?", a: "A4 technologie intérieur ; C image Mercedes." },
      { q: "35 TDI consommation ?", a: "5,5 L/100 km autoroute possible." },
      { q: "Prix A4 2018 TDI ?", a: "240 000–290 000 MAD selon quattro." },
      { q: "A4 Avant au Maroc ?", a: "Import occasion — coffre familial supérieur." },
      { q: "quattro A4 ?", a: "Stabilité pluie et montagne — surcoût entretien modéré." },
      { q: "Fiabilité B9 ?", a: "Bonne entretien suivi ; turbo et DSG points clés." },
      { q: "A4 location executive ?", a: "Premium — Goovoiture loueurs haut de gamme." },
      { q: "S line ?", a: "Look sport et suspension — routes marocaines parfois dures." },
      { q: "Assurance A4 ?", a: "Prime haute segment D premium." },
      { q: "Contrôle occasion ?", a: "DSG/tiptronic, AdBlue, Virtual Cockpit, historique Audi." },
    ],
  },
  {
    brandSlug: "audi",
    modelSlug: "q3",
    displayName: "Audi Q3",
    listingTerms: ["q3"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "L'Audi Q3 compact SUV combine prestige Audi et praticité crossover au Maroc. Plus compact qu'un Q5, il cible les familles urbaines de Casa et Rabat refusant le gabarit des SUV full-size tout en gardant une image premium.",
    popularity:
      "Le Q3 Sportback et SUV classique gagnent en parts sur Tiguan et 3008 premium. Motorisations TFSI et TDI, quattro optionnel et habitacle technologique en font un crossover aspirational accessible en occasion récente.",
    engines: {
      diesel: "35 TDI 150 ch — couple et sobriété.",
      essence: "35 TFSI et 40 TFSI — urbain réactif.",
      automatic: "S tronic 7 — standard.",
      manual: "Très rare sur Q3 II.",
    },
    consumption: { city: "7,5–9,0 L/100 km", highway: "5,5–6,5 L/100 km" },
    reliability: {
      strengths: [
        "Finitions Audi supérieures segment SUV",
        "quattro sécurité routes humides",
        "Taille maniable vs Q5/Q7",
      ],
      weaknesses: [
        "Prix et entretien premium",
        "Coffre inférieur à Tucson",
        "DSG coût entretien",
      ],
    },
    prices: {
      occasion: "190 000 – 280 000 MAD Q3 F3.",
      recent: "290 000 – 380 000 MAD Q3 S line récent.",
      popularVersions: ["Q3 35 TDI", "Q3 35 TFSI", "Q3 S line", "Q3 Sportback"],
    },
    maintenance:
      "9 000–16 000 MAD/an. Pneus 235/55 R18. Réseau Audi.",
    audience: {
      youngDrivers: "Crossover premium — budget conséquent.",
      families: "Deux enfants — confort et sécurité.",
      professionals: "Image premium sans Q7.",
      longDistance: "TDI recommandé — stable autoroute.",
    },
    faqs: [
      { q: "Q3 ou Tiguan ?", a: "Q3 finitions ; Tiguan espace et prix parfois inférieur." },
      { q: "Q3 ou 2008 ?", a: "Q3 premium ; 2008 budget et réseau Peugeot." },
      { q: "Prix Q3 2020 TDI ?", a: "250 000–300 000 MAD selon S line et quattro." },
      { q: "Q3 Sportback coffre ?", a: "Légèrement réduit vs Q3 — vérifier besoins famille." },
      { q: "Consommation 35 TDI ?", a: "6–6,5 L/100 km mixte." },
      { q: "Q3 en location ?", a: "Premium crossover — Goovoiture." },
      { q: "quattro Q3 Maroc ?", a: "Utile montagne et pluie — option appréciée occasion." },
      { q: "Fiabilité Q3 II ?", a: "Bonne ; DSG et turbo surveillance standard." },
      { q: "Assurance Q3 ?", a: "Haute — SUV premium." },
      { q: "Contrôle occasion ?", a: "DSG, quattro, capteurs ADAS, historique Audi." },
    ],
  },
];
