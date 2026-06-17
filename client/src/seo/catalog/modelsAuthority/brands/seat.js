/** @type {import("../index.js").AuthorityModel[]} */
export const SEAT_MODELS = [
  {
    brandSlug: "seat",
    modelSlug: "ibiza",
    displayName: "SEAT Ibiza",
    listingTerms: ["ibiza"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "L'Ibiza apporte l'esprit sportif espagnol au segment B marocain. Sur plateforme VW Group, elle combine design dynamique et mécaniques TSI éprouvées. À Tanger, Casablanca et Rabat, elle attire une clientèle jeune cherchant une citadine plus expressive qu'une Clio classique.",
    popularity:
      "SEAT reste une marque de niche au Maroc mais l'Ibiza gagne en visibilité grâce à un rapport équipement/prix attractif en occasion importée. Garde au sol correcte, châssis réactif et facture intérieure récente en font une alternative crédible à Polo et 208.",
    engines: {
      diesel: "1.6 TDI 95 ch sur Ibiza V — encore visible en occasion.",
      essence: "1.0 TSI 95/110 ch — motorisation dominante sur Ibiza VI.",
      automatic: "DSG 7 sur finitions FR et Xcellence — idéal en ville.",
      manual: "BVM 5/6 rapports — ludique et économique à entretenir.",
    },
    consumption: { city: "5,8–7,0 L/100 km", highway: "4,3–5,1 L/100 km" },
    reliability: {
      strengths: [
        "Mécanique VW Group partagée avec Polo",
        "Châssis agile sur routes côtières et urbaines",
        "Bon niveau d'équipement à prix contenu",
      ],
      weaknesses: [
        "Réseau SEAT moins dense que Renault ou VW",
        "Revente plus lente hors grandes villes",
        "Pièces parfois à commander via concession VW/SEAT",
      ],
    },
    prices: {
      occasion: "85 000 – 135 000 MAD pour Ibiza V/VI TSI.",
      recent: "145 000 – 180 000 MAD pour Ibiza VI FR ou Xcellence récente.",
      popularVersions: ["Ibiza FR", "Ibiza Xcellence", "Ibiza Reference", "Ibiza 1.0 TSI"],
    },
    maintenance:
      "Entretien similaire à Polo : 4 500–7 000 MAD/an. Réseau SEAT à Casa et Rabat ; garages VAG pour alternative. Huile VW 508 pour TSI.",
    audience: {
      youngDrivers: "Design sportif, prix occasion raisonnable — excellent match.",
      families: "Deux enfants maximum confortablement ; coffre correct.",
      professionals: "Commerciaux urbains recherchant différenciation.",
      longDistance: "TSI 110 acceptable ; préférer Leon pour autoroute fréquente.",
    },
    faqs: [
      { q: "Ibiza ou Polo au Maroc ?", a: "Mécanique proche ; Ibiza plus sportive et souvent mieux prix ; Polo badge plus fort à la revente." },
      { q: "Où entretenir une Ibiza ?", a: "Concessions SEAT et garages VAG — pièces compatibles Polo." },
      { q: "Prix Ibiza 2019 TSI ?", a: "115 000–140 000 MAD selon finition FR et kilométrage." },
      { q: "La Ibiza FR est-elle sportive ?", a: "Suspension et direction plus fermes — agréable sur route, ferme sur dos-d'âne." },
      { q: "Consommation Ibiza TSI Casa ?", a: "6–6,5 L/100 km avec clim en circulation urbaine." },
      { q: "Fiabilité Ibiza VI ?", a: "Bonne avec entretien VW Group ; surveiller DSG si équipée." },
      { q: "Ibiza disponible en location ?", a: "Stock limité — vérifiez agences Goovoiture grandes villes." },
      { q: "Ibiza ou 208 ?", a: "Ibiza châssis plus dynamique ; 208 réseau Peugeot plus large au Maroc." },
      { q: "Quelle assurance ?", a: "Segment B standard — tous risques si valeur >140 000 MAD." },
      { q: "Points contrôle occasion ?", a: "DSG, carrosserie, historique import si véhicule étranger, climatisation." },
    ],
  },
  {
    brandSlug: "seat",
    modelSlug: "leon",
    displayName: "SEAT Leon",
    listingTerms: ["leon"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "La Leon est la compacte sportive du groupe VW au Maroc : même ADN technique que Golf avec une personnalité plus agressive et un rapport prix/équipement souvent favorable. Elle séduit les conducteurs de Casa et Rabat voulant une allemande sans payer le premium Golf.",
    popularity:
      "En occasion, la Leon FR et les TDI attirent les passionnés et les grands rouleurs. Moins commune que Mégane ou Focus, elle offre un excellent comportement routier sur l'autoroute vers El Jadida ou Témara et une finition supérieure aux généralistes françaises.",
    engines: {
      diesel: "2.0 TDI 150 ch — couple et sobriété autoroute.",
      essence: "1.4 TSI 125 ch et 1.5 TSI 150 ch sur Leon IV.",
      automatic: "DSG 7 standard sur motorisations récentes.",
      manual: "BVM 6 rapports sur finitions entrée — plaisir de conduite.",
    },
    consumption: { city: "6,5–7,8 L/100 km", highway: "4,5–5,5 L/100 km" },
    reliability: {
      strengths: [
        "Plateforme MQB solide",
        "Excellent compromis sportivité/confort",
        "Équipement FR généreux en occasion",
      ],
      weaknesses: [
        "Réseau SAV SEAT limité hors métropoles",
        "DSG à entretenir",
        "Revente plus lente que Golf",
      ],
    },
    prices: {
      occasion: "115 000 – 170 000 MAD pour Leon III/IV.",
      recent: "175 000 – 220 000 MAD pour Leon IV TSI ou TDI récente.",
      popularVersions: ["Leon FR", "Leon Xcellence", "Leon Style", "Leon 2.0 TDI"],
    },
    maintenance:
      "5 500–9 000 MAD/an. Compatible pièces Golf/Polo. Vidange DSG critique. Garages VAG recommandés.",
    audience: {
      youngDrivers: "FR TSI — plaisir et style si budget suffisant.",
      families: "4 places confortables ; break ST rare mais pratique.",
      professionals: "Image dynamique pour profils commerciaux.",
      longDistance: "TDI 150 ou TSI 150 — excellentes sur routes nationales.",
    },
    faqs: [
      { q: "Leon ou Golf 7 ?", a: "Mécanique identique ; Leon souvent mieux équipée à prix égal, Golf meilleure revente." },
      { q: "Leon FR consommation ?", a: "7 L/100 km mixte TSI ; 5,5 L TDI autoroute." },
      { q: "Où trouver pièces Leon ?", a: "Concession SEAT/VW et marché pièces VAG Casablanca." },
      { q: "Prix Leon 2018 TDI ?", a: "140 000–165 000 MAD — contrôlez FAP et DSG." },
      { q: "Leon en location ?", a: "Rare — plutôt achat occasion sur Goovoiture." },
      { q: "Fiabilité Leon IV ?", a: "Bonne ; attention mises à jour logicielles infotainment." },
      { q: "Leon ou Megane GT ?", a: "Leon châssis plus précis ; Mégane réseau plus large." },
      { q: "Assurance Leon FR ?", a: "Prime segment C — tous risques conseillé." },
      { q: "Break Leon ST au Maroc ?", a: "Peu courant — chercher annonces import ou concession." },
      { q: "Contrôle avant achat ?", a: "DSG, turbo, freins FR (disques plus sollicités), historique entretien." },
    ],
  },
  {
    brandSlug: "seat",
    modelSlug: "arona",
    displayName: "SEAT Arona",
    listingTerms: ["arona"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "L'Arona est le SUV urbain SEAT : gabarit contenu, garde au sol surélevée et design affirmé. Au Maroc, elle répond à la mode du crossover compact sans atteindre les dimensions d'un Duster — idéale pour Rabat, Marrakech et les stationnements serrés.",
    popularity:
      "Le crossover B-SUV explose au Maroc ; l'Arona se positionne face à 2008, Captur et Kona. Sa plateforme Ibiza/Polo assure une conduite moins lourde que les SUV plus massifs, avec un style jeune apprécié des 25–40 ans.",
    engines: {
      diesel: "1.6 TDI 95 ch — présent sur premières versions.",
      essence: "1.0 TSI 95/110 ch et 1.5 TSI 150 ch sur finitions FR.",
      automatic: "DSG 7 — pratique en descente vers la corniche ou en ville.",
      manual: "BVM 5/6 — majoritaire en occasion entrée de gamme.",
    },
    consumption: { city: "6,5–7,8 L/100 km", highway: "4,8–5,6 L/100 km" },
    reliability: {
      strengths: [
        "Base Ibiza fiable",
        "Maniabilité SUV sans gabarit excessif",
        "Équipement sécurité correct sur versions récentes",
      ],
      weaknesses: [
        "Coffre inférieur à Duster",
        "Prix occasion en hausse avec la demande crossover",
        "Réseau SEAT restreint",
      ],
    },
    prices: {
      occasion: "110 000 – 155 000 MAD pour Arona TSI.",
      recent: "165 000 – 200 000 MAD pour Arona FR ou Xcellence récente.",
      popularVersions: ["Arona FR", "Arona Xcellence", "Arona Reference", "Arona 1.0 TSI"],
    },
    maintenance:
      "5 000–8 000 MAD/an. Pneus 215/45 R17 fréquents. Entretien via SEAT/VW.",
    audience: {
      youngDrivers: "SUV look sans gabarit intimidant — très bon match.",
      families: "Un enfant + poussette ; deux enfants possibles sur court trajet.",
      professionals: "Image moderne pour rendez-vous clients urbains.",
      longDistance: "Acceptable en TSI 110 ; Duster ou Tiguan préférables pour Atlas.",
    },
    faqs: [
      { q: "Arona ou 2008 ?", a: "Arona plus dynamique ; 2008 réseau Peugeot plus dense au Maroc." },
      { q: "Arona suffit-elle pour routes de montagne ?", a: "Oui sur goudron ; évitez pistes sérieuses — garde au sol limitée vs Duster." },
      { q: "Prix Arona 2020 ?", a: "145 000–175 000 MAD selon finition FR." },
      { q: "Consommation Arona TSI ?", a: "7 L/100 km mixte avec clim." },
      { q: "4x4 sur Arona ?", a: "Non — traction avant uniquement." },
      { q: "Où réparer Arona ?", a: "SEAT Casa/Rabat et garages VAG." },
      { q: "Arona en location ?", a: "Quelques agences crossover — voir Goovoiture /louer." },
      { q: "Fiabilité Arona ?", a: "Proche Ibiza — bonne avec entretien régulier." },
      { q: "Arona ou Kona ?", a: "Arona prix occasion souvent inférieur ; Kona hybride si disponible." },
      { q: "Contrôle occasion ?", a: "DSG, pare-chocs SUV (hauteur), pneus et historique VW Group." },
    ],
  },
];
