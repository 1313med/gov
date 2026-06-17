/** @type {import("../index.js").AuthorityModel[]} */
export const HYUNDAI_MODELS = [
  {
    brandSlug: "hyundai",
    modelSlug: "accent",
    displayName: "Hyundai Accent",
    listingTerms: ["accent"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "L'Accent a longtemps été la berline économique coréenne de référence au Maroc. Simple, spacieuse pour sa taille et dotée d'une garantie constructeur attractive à l'époque du neuf, elle équipe encore un parc important en occasion, surtout dans les villes côtières.",
    popularity:
      "Les acheteurs sensibles au budget choisissent l'Accent pour l'entretien abordable et la disponibilité des pièces Hyundai. Moins moderne qu'une i20 récente, elle reste pertinente comme première voiture ou véhicule utilitaire léger pour petites entreprises.",
    engines: {
      diesel: "1.6 CRDi sur générations antérieures — rare sur Accent récente.",
      essence: "1.4 MPI et 1.6 MPI — fiables et faciles à réparer.",
      automatic: "4 vitesses auto sur anciennes versions — peu répandue.",
      manual: "BVM 5/6 rapports — robuste, embrayage peu coûteux.",
    },
    consumption: { city: "6,5–8,0 L/100 km", highway: "5,0–6,0 L/100 km" },
    reliability: {
      strengths: [
        "Mécanique atmosphérique éprouvée",
        "Coût entretien bas",
        "Réseau Hyundai en expansion au Maroc",
      ],
      weaknesses: [
        "Finitions et sécurité datées sur anciennes générations",
        "Revente en baisse face aux SUV urbains",
        "Confort autoroute limité",
      ],
    },
    prices: {
      occasion: "45 000 – 85 000 MAD selon année.",
      recent: "95 000 – 125 000 MAD pour Accent récente faible km.",
      popularVersions: ["Accent GL", "Accent GLS", "Accent 1.4", "Accent 1.6"],
    },
    maintenance:
      "3 500–5 500 MAD/an. Pièces Hyundai accessibles. Vidanges fréquentes recommandées en climat chaud.",
    audience: {
      youngDrivers: "Budget serré, assurance basse — bon point d'entrée.",
      families: "Correcte pour 4 sur court trajet ; préférer i20 ou Tucson pour confort.",
      professionals: "Livreurs, agents — coût km faible.",
      longDistance: "Possible mais bruyante et moins économique qu'un diesel français.",
    },
    faqs: [
      { q: "Accent ou Logan ?", a: "Logan plus spacieuse ; Accent mécanique parfois plus souple sur longévité." },
      { q: "Accent encore disponible neuve ?", a: "Vérifiez concession Hyundai — le focus est sur i20 et Tucson." },
      { q: "Prix Accent 2015 ?", a: "55 000–75 000 MAD selon état." },
      { q: "Fiabilité Accent ?", a: "Bonne si entretien basique respecté — peu de pannes majeures." },
      { q: "Où trouver pièces ?", a: "Réseau Hyundai national et pièces adaptables courantes." },
      { q: "Accent en location ?", a: "Encore présente chez agences économiques — Goovoiture." },
      { q: "Consommation Accent 1.4 ?", a: "7–8 L/100 km ville avec clim." },
      { q: "Accent ou i20 ?", a: "i20 plus moderne et mieux valorisée ; Accent moins chère en occasion." },
      { q: "Contrôle technique ?", a: "Vérifiez freins et émissions sur modèles âgés." },
      { q: "Annonces Accent Goovoiture ?", a: "Filtrez Hyundai — stocks surtout Casa et Rabat." },
    ],
  },
  {
    brandSlug: "hyundai",
    modelSlug: "tucson",
    displayName: "Hyundai Tucson",
    listingTerms: ["tucson"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "Le Tucson est le SUV familial coréen le plus visible au Maroc. Design affirmé, garantie longue à l'époque du neuf et habitacle bien équipé : il concurrence directement le Duster et le 3008 sur le marché de l'occasion récente à Casablanca et Marrakech.",
    popularity:
      "Les familles marocaines apprécient le Tucson pour le confort arrière, le coffre et l'image moderne. Les motorisations essence turbo et diesel CRDi couvrent urbain et autoroute ; le réseau Hyundai s'est densifié ces dernières années.",
    engines: {
      diesel: "1.7 CRDi et 2.0 CRDi — économiques sur long trajet.",
      essence: "1.6 T-GDI 177 ch et 2.0 MPI — essence turbo dynamique.",
      automatic: "Boîte auto 6/8 rapports DCT ou classique selon génération.",
      manual: "BVM 6 sur entrées de gamme — fiable.",
    },
    consumption: { city: "7,5–9,0 L/100 km", highway: "5,5–6,5 L/100 km" },
    reliability: {
      strengths: [
        "Garantie constructeur historiquement longue",
        "Équipement généreux sur finitions Premium",
        "Bonne tenue de route SUV",
      ],
      weaknesses: [
        "DCT à surveiller sur certaines versions",
        "Coût pièces en hausse sur générations récentes",
        "Poids — consommation en ville élevée",
      ],
    },
    prices: {
      occasion: "130 000 – 200 000 MAD pour Tucson III.",
      recent: "210 000 – 280 000 MAD pour Tucson IV récent.",
      popularVersions: ["Tucson Premium", "Tucson Creative", "Tucson N Line", "Tucson 1.6 T-GDI"],
    },
    maintenance:
      "6 000–10 000 MAD/an. Réseau Hyundai national. Pneus 225/60 R17 courants.",
    audience: {
      youngDrivers: "Budget élevé — plutôt profil famille établie.",
      families: "Excellent — espace, sécurité, voyages.",
      professionals: "Agents, PME — image soignée.",
      longDistance: "CRDi ou T-GDI pour Casa–Agadir régulier.",
    },
    faqs: [
      { q: "Tucson ou Duster ?", a: "Tucson confort et équipement ; Duster budget et tout-terrain léger." },
      { q: "Tucson 4x4 au Maroc ?", a: "HTRAC sur certaines versions — vérifier fiche technique annonce." },
      { q: "Prix Tucson 2019 diesel ?", a: "175 000–210 000 MAD selon km." },
      { q: "Fiabilité Tucson IV ?", a: "Bonne ; attention DCT et turbo sur entretien strict." },
      { q: "Consommation T-GDI ?", a: "8 L/100 km ville, 6 L autoroute." },
      { q: "Garantie Hyundai occasion ?", a: "Vérifiez transfert garantie restante chez concession." },
      { q: "Tucson en location ?", a: "Très demandé — agences aéroport et ville sur Goovoiture." },
      { q: "Tucson ou Tiguan ?", a: "Tucson meilleur rapport prix/équipement ; Tiguan plus premium." },
      { q: "Entretien DCT ?", a: "Vidanges spécifiques — suivre carnet Hyundai." },
      { q: "Contrôle avant achat ?", a: "DCT, turbo, 4x4 HTRAC, historique garantie." },
    ],
  },
  {
    brandSlug: "hyundai",
    modelSlug: "i20",
    displayName: "Hyundai i20",
    listingTerms: ["i20"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "L'i20 est la citadine moderne de Hyundai au Maroc : design actualisé, équipements sécurité et motorisations essence efficaces. Elle cible les jeunes ménages de Rabat et Casablanca qui veulent sortir du tout-Dacia sans exploser le budget.",
    popularity:
      "Hyundai a gagné des parts de marché avec l'i20 grâce à la garantie et au look premium. En occasion, elle concurrence Sandero, Clio et 208 avec un habitacle bien fini et des technologies sur finitions hautes.",
    engines: {
      diesel: "Peu proposé au Maroc sur i20 récente.",
      essence: "1.2 MPI et 1.0 T-GDI 100 ch — dominantes.",
      automatic: "DCT ou iMT sur finitions récentes.",
      manual: "BVM 5/6 — souple en ville.",
    },
    consumption: { city: "5,8–7,0 L/100 km", highway: "4,5–5,3 L/100 km" },
    reliability: {
      strengths: [
        "Garantie constructeur attractive",
        "Finitions intérieures soignées",
        "Réseau SAV en croissance",
      ],
      weaknesses: [
        "DCT parfois hésitante à bas régime",
        "Revente encore jeune sur marché",
        "Coffre inférieur à Sandero Stepway",
      ],
    },
    prices: {
      occasion: "90 000 – 140 000 MAD pour i20 III.",
      recent: "150 000 – 185 000 MAD pour i20 récente N Line ou Premium.",
      popularVersions: ["i20 Premium", "i20 Creative", "i20 N Line", "i20 1.0 T-GDI"],
    },
    maintenance:
      "4 000–6 500 MAD/an. Entretien chez Hyundai. Huiles et filtres abordables.",
    audience: {
      youngDrivers: "Design, garantie, technologies — excellent choix.",
      families: "Deux enfants urbains — coffre juste pour long voyage.",
      professionals: "Commerciaux urbains — image moderne.",
      longDistance: "T-GDI acceptable ; berline préférable si >20 000 km/an.",
    },
    faqs: [
      { q: "i20 ou 208 ?", a: "i20 garantie et finitions ; 208 réseau Peugeot plus large." },
      { q: "i20 N Line vaut-elle le prix ?", a: "Si esthétique sportive ; sinon Creative suffit." },
      { q: "Prix i20 2021 ?", a: "155 000–175 000 MAD selon km." },
      { q: "DCT i20 fiable ?", a: "Correcte avec entretien ; essai urbain obligatoire avant achat." },
      { q: "Consommation T-GDI Casa ?", a: "6–6,5 L/100 km avec clim." },
      { q: "i20 en location ?", a: "Disponible agences modernes — Goovoiture." },
      { q: "Garantie i20 occasion ?", a: "Transférable si kilométrage et date dans les clous." },
      { q: "i20 ou Clio ?", a: "Clio plus répandue ; i20 souvent mieux garantie et équipée." },
      { q: "Pièces i20 Maroc ?", a: "Réseau Hyundai — délais courts grandes villes." },
      { q: "Contrôle occasion ?", a: "DCT, carrosserie parking, historique garantie Hyundai." },
    ],
  },
];
