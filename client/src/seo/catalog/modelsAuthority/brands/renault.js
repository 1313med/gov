/** @type {import("../index.js").AuthorityModel[]} */
export const RENAULT_MODELS = [
  {
    brandSlug: "renault",
    modelSlug: "clio",
    displayName: "Renault Clio",
    listingTerms: ["clio"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "La Renault Clio domine le segment B au Maroc depuis des décennies. Citadine agile pour Rabat et Tanger, elle équipe aussi les flottes de location courte durée. La Clio V a modernisé le design et l'habitacle tout en conservant une mécanique accessible via le réseau Renault le plus dense du pays.",
    popularity:
      "Entre maniabilité urbaine, consommation contenue et image de marque forte, la Clio reste une valeur sûre. Les jeunes actifs de Casa la choisissent pour le trajet bureau ; les familles urbaines apprécient les finitions Intens et les aides à la conduite sur les versions récentes.",
    engines: {
      diesel: "1.5 dCi 85–100 ch : encore présent sur Clio IV, économique sur longs trajets.",
      essence: "1.0 TCe 90/100 ch et 1.2 16V : standards du parc récent marocain.",
      automatic: "Boîte EDC ou CVT selon génération — prisée en location et pour la conduite urbaine.",
      manual: "BVM 5/6 rapports, embrayage progressif, large choix en occasion.",
    },
    consumption: { city: "6,0–7,2 L/100 km", highway: "4,5–5,3 L/100 km" },
    reliability: {
      strengths: [
        "Réseau SAV Renault présent dans toutes les grandes villes",
        "Pièces d'origine et adaptables abondantes",
        "Bonne tenue de route sur rocade et autoroute",
      ],
      weaknesses: [
        "Boîte EDC à surveiller sur kilométrages élevés",
        "Électronique multimédia parfois lente sur premières Clio V",
        "Côte d'entretien légèrement supérieure à une Dacia équivalente",
      ],
    },
    prices: {
      occasion: "70 000 – 120 000 MAD pour Clio IV essence ou diesel.",
      recent: "145 000 – 195 000 MAD pour Clio V TCe faible kilométrage.",
      popularVersions: ["Clio Intens", "Clio Zen", "Clio RS Line", "Clio 1.5 dCi"],
    },
    maintenance:
      "Révisions chez Renault ou garages agréés : 4 000–6 000 MAD. Freins et pneus 195/55 R16 courants. Prévoir contrôle EDC tous les 60 000 km si équipée.",
    audience: {
      youngDrivers: "Design actuel, technologies embarquées, bon compromis prestige/prix.",
      families: "Deux enfants confortables ; coffre correct pour week-ends côtiers.",
      professionals: "Flottes de location, commerciaux urbains, image soignée.",
      longDistance: "dCi IV ou TCe récent pour Casa–Rabat quotidien sans surconsommation.",
    },
    faqs: [
      { q: "Clio ou Sandero : quelle citadine au Maroc ?", a: "Clio plus premium et agréable sur route ; Sandero plus spacieuse et économique à l'achat." },
      { q: "Quel prix pour une Clio V 2021 ?", a: "Autour de 155 000–185 000 MAD selon finition et kilométrage — comparez sur Goovoiture." },
      { q: "La boîte EDC est-elle fiable ?", a: "Correcte si entretien suivi. Exigez historique et essai en circulation avant achat occasion." },
      { q: "Consommation Clio TCe en ville à Casablanca ?", a: "7 L/100 km en usage réel avec clim ; moins si trajets fluides hors heures de pointe." },
      { q: "Où louer une Clio au Maroc ?", a: "Nombreuses agences Goovoiture à l'aéroport Mohammed V et en centre-ville." },
      { q: "Clio diesel encore intéressante ?", a: "Oui si vous dépassez 20 000 km/an. Sinon le TCe essence suffit et simplifie l'entretien." },
      { q: "Quels défauts connus sur Clio IV ?", a: "Capteur PMH, usure silentblocs triangle, parfois voyants antipollution sur dCi — diagnostic avant achat." },
      { q: "La Clio passe-t-elle les contrôles techniques sans souci ?", a: "Généralement oui si entretien suivi ; vérifiez freinage et émissions diesel." },
      { q: "Quelle assurance pour une Clio neuve d'occasion ?", a: "Tous risques conseillé au-dessus de 150 000 MAD de valeur vénale." },
      { q: "Peut-on négocier le prix d'une Clio occasion ?", a: "Oui — utilisez les indices prix Goovoiture et l'état des pneus/freins comme levier." },
    ],
  },
  {
    brandSlug: "renault",
    modelSlug: "megane",
    displayName: "Renault Mégane",
    listingTerms: ["megane", "mégane"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "La Mégane occupe le segment C au Maroc : berline et break pour familles exigeant confort autoroutier et finitions supérieures à une Clio. Présente sur les routes Casa–Marrakech et dans les quartiers résidentiels de Rabat-Salé, elle cible les cadres et ménages stables.",
    popularity:
      "Au Maroc, la Mégane séduit par son habitacle adulte, ses motorisations diesel économiques sur longue distance et son image européenne. Moins ubiquitaire que la Clio, elle offre un bon équilibre entre prestige accessible et coût d'usage raisonnable grâce au réseau Renault.",
    engines: {
      diesel: "1.5 dCi 110–115 ch : référence pour grands rouleurs et routes nationales.",
      essence: "1.2 TCe 130 ch et 1.6 16V sur générations antérieures.",
      automatic: "EDC double embrayage sur finitions hautes — fluide en ville.",
      manual: "BVM 6 rapports sur dCi — agréable sur routes de montagne.",
    },
    consumption: { city: "6,5–8,0 L/100 km", highway: "4,8–5,8 L/100 km" },
    reliability: {
      strengths: [
        "Châssis stable à haute vitesse sur l'A1 et l'A7",
        "Motorisation dCi éprouvée en usage intensif",
        "Habitacle confortable pour 4 adultes sur long trajet",
      ],
      weaknesses: [
        "Coût de certaines pièces électroniques élevé",
        "EDC à entretenir rigoureusement",
        "Revente plus lente que Clio ou Logan en zone rurale",
      ],
    },
    prices: {
      occasion: "85 000 – 140 000 MAD pour Mégane III/IV diesel.",
      recent: "160 000 – 220 000 MAD pour Mégane IV récente Intens ou GT Line.",
      popularVersions: ["Mégane Intens", "Mégane GT Line", "Mégane Estate", "Mégane 1.5 dCi"],
    },
    maintenance:
      "Budget supérieur à une Clio : 5 500–9 000 MAD/an. Surveiller FAP et EGR sur dCi, courroie accessoires et liquide EDC. Pneus 205/55 R16 fréquents.",
    audience: {
      youngDrivers: "Plutôt seconde voiture ou profil senior junior — budget et assurance plus élevés.",
      families: "Excellent choix : espace arrière, coffre break, sécurité correcte.",
      professionals: "Commerciaux régionaux, cadres — image professionnelle.",
      longDistance: "Idéale pour liaisons inter-villes régulières en dCi.",
    },
    faqs: [
      { q: "Mégane ou Corolla au Maroc ?", a: "Mégane plus abordable en occasion et réseau Renault dense ; Corolla valorisée pour fiabilité long terme." },
      { q: "Quel kilométrage max pour une Mégane dCi ?", a: "Au-delà de 200 000 km, exigez carnet d'entretien complet et test turbo/FAP." },
      { q: "La Mégane IV est-elle spacieuse ?", a: "Oui pour 4 adultes ; le break Estate est préférable si vous transportez souvent des bagages volumineux." },
      { q: "Prix assurance Mégane à Marrakech ?", a: "Intermédiaire segment C — demandez plusieurs devis, surtout en tous risques." },
      { q: "Consommation réelle dCi sur Casa–Tanger ?", a: "5–5,5 L/100 km à allure légale avec clim modérée." },
      { q: "Où trouver une Mégane occasion ?", a: "Annonces Goovoiture, concessionnaires Renault Occasion et parc entreprises." },
      { q: "GT Line vaut-elle le prix ?", a: "Si vous tenez à l'esthétique et au chassis sportifié ; sinon Intens suffit pour usage familial." },
      { q: "Problèmes fréquents Mégane III ?", a: "Capteur pression rail, silentblocs, parfois voyant antipollution — diagnostic OBD recommandé." },
      { q: "Peut-on louer une Mégane ?", a: "Moins courant que Clio ou Duster, mais disponible chez certaines agences premium Goovoiture." },
      { q: "Mégane essence ou diesel au Maroc ?", a: "Diesel si >18 000 km/an ; essence TCe pour usage urbain principalement." },
    ],
  },
];
