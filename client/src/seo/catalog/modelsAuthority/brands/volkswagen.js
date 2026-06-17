/** @type {import("../index.js").AuthorityModel[]} */
export const VOLKSWAGEN_MODELS = [
  {
    brandSlug: "volkswagen",
    modelSlug: "golf-7",
    displayName: "Volkswagen Golf 7",
    listingTerms: ["golf 7", "golf vii", "golf7", "golf"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "La Golf 7 a consolidé l'image de Volkswagen au Maroc : compacte premium, finitions soignées et comportement routier de référence. Importée et distribuée via le réseau VW local, elle attire les cadres de Casablanca Finance City et les passionnés recherchant une allemande accessible en occasion.",
    popularity:
      "Sur le marché marocain, la Golf 7 reste recherchée pour sa valeur de revente, sa tenue de route sur l'autoroute Casa–Rabat et son habitacle sobre. Les versions TSI et TDI équilibrent performance et sobriété ; le parc est moins massif que les françaises mais très actif sur les annonces haut de gamme.",
    engines: {
      diesel: "1.6 TDI 110 ch et 2.0 TDI 150 ch — couple autoroutier apprécié sur longues distances.",
      essence: "1.2 TSI 85/105 ch et 1.4 TSI 125 ch — réactifs en ville, entretien suivi impératif.",
      automatic: "DSG 7 rapports sur finitions Carat et GT — fluide, entretien spécifique requis.",
      manual: "BVM 5/6 rapports — agréable, moins coûteux à entretenir que le DSG.",
    },
    consumption: { city: "6,5–8,0 L/100 km", highway: "4,5–5,5 L/100 km" },
    reliability: {
      strengths: [
        "Solidité de la plateforme MQB",
        "Excellent comportement routier et freinage",
        "Forte demande en revente dans les grandes villes",
      ],
      weaknesses: [
        "Coût pièces et main-d'œuvre supérieur au segment français",
        "DSG à entretenir selon préconisations strictes",
        "Électronique parfois coûteuse hors garantie",
      ],
    },
    prices: {
      occasion: "120 000 – 175 000 MAD selon motorisation et kilométrage.",
      recent: "185 000 – 230 000 MAD pour Golf 7 finition Carat ou GT faible km.",
      popularVersions: ["Golf 7 Confortline", "Golf 7 Carat", "Golf 7 GTD", "Golf 7 1.4 TSI"],
    },
    maintenance:
      "Révisions VW : 5 000–8 000 MAD. Huile spécifique pour TSI/DSG. Prévoir changement huile DSG tous les 60 000 km. Réseau moins dense que Renault mais présent à Casa, Rabat, Marrakech.",
    audience: {
      youngDrivers: "Budget élevé — plutôt profil 30+ ou seconde voiture familiale.",
      families: "Compacte suffisante pour 4, coffre correct ; pas idéale pour 3 enfants + poussette.",
      professionals: "Image premium pour clients et déplacements professionnels.",
      longDistance: "TDI ou TSI autoroute — référence du segment pour stabilité.",
    },
    faqs: [
      { q: "Golf 7 ou Golf 8 : laquelle choisir au Maroc ?", a: "Golf 7 plus abordable en occasion et mécanique éprouvée ; Golf 8 plus moderne mais prix plus élevé." },
      { q: "Le 1.4 TSI consomme-t-il beaucoup ?", a: "6–7 L/100 km en mixte réel ; surveillez la consommation d'huile sur certains moteurs." },
      { q: "DSG ou manuelle pour Casa ?", a: "DSG confort en embouteillage ; manuelle moins chère à entretenir sur le long terme." },
      { q: "Où réparer une Golf 7 hors concession ?", a: "Garages spécialisés VAG à Casablanca et Rabat — exigez pièces de qualité OEM." },
      { q: "Prix d'une Golf 7 TDI 2016 ?", a: "130 000–160 000 MAD selon état — vérifiez FAP et historique diesel." },
      { q: "La Golf 7 tient-elle la route ?", a: "Oui, c'est l'un de ses points forts — stable à 130 km/h sur autoroute." },
      { q: "Assurance Golf 7 au Maroc ?", a: "Prime segment C+ — tous risques recommandé compte tenu de la valeur vénale." },
      { q: "Golf 7 disponible en location ?", a: "Plus rare que Clio ou Logan ; certaines agences premium la proposent." },
      { q: "Quels points de contrôle avant achat ?", a: "DSG, turbo TSI, fuites huile, historique entretien VW et carrosserie (parking serré en ville)." },
      { q: "Golf 7 ou Leon : différence ?", a: "Plateforme proche ; Golf image VW plus forte, Leon souvent mieux équipée à prix égal." },
    ],
  },
  {
    brandSlug: "volkswagen",
    modelSlug: "golf-8",
    displayName: "Volkswagen Golf 8",
    listingTerms: ["golf 8", "golf viii", "golf8", "golf"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "La Golf 8 pousse la compacte premium vers la digitalisation : cockpit virtuel, aides à la conduite et design affûté. Au Maroc, elle cible une clientèle exigeante à Casa et Rabat, prête à investir dans une compacte moderne avec technologies embarquées.",
    popularity:
      "Moins répandue que la Golf 7 en occasion, la Golf 8 gagne du terrain chez les acheteurs de véhicules récents importés ou vendus par le réseau officiel. Son argument : sécurité active, efficience des motorisations eTSI et image de marque Volkswagen.",
    engines: {
      diesel: "2.0 TDI 115–150 ch — orienté grands rouleurs autoroute.",
      essence: "1.0 eTSI 110 ch et 1.5 eTSI 150 ch avec micro-hybridation légère.",
      automatic: "DSG standard sur eTSI — conduite urbaine fluide à Rabat et Casa.",
      manual: "Encore proposée sur certaines finitions entrée — rare en stock occasion.",
    },
    consumption: { city: "6,0–7,5 L/100 km", highway: "4,3–5,2 L/100 km" },
    reliability: {
      strengths: [
        "Technologies sécurité ADAS sur finitions hautes",
        "Moteurs eTSI plus sobres que les TSI Golf 7",
        "Habitacle digital moderne et ergonomique",
      ],
      weaknesses: [
        "Prix d'achat et d'entretien élevés pour le marché local",
        "Dépendance à l'électronique — diagnostics coûteux",
        "Parc encore jeune — données long terme limitées au Maroc",
      ],
    },
    prices: {
      occasion: "175 000 – 220 000 MAD pour premières occasions 2021–2023.",
      recent: "230 000 – 280 000 MAD pour exemplaires récents faible kilométrage.",
      popularVersions: ["Golf 8 Life", "Golf 8 Style", "Golf 8 R-Line", "Golf 8 1.5 eTSI"],
    },
    maintenance:
      "Strictement selon carnet VW : 6 000–10 000 MAD/vidange majeure. Mises à jour logicielles via concession. Prévoir budget pneus runflat sur certaines finitions.",
    audience: {
      youngDrivers: "Profil cadre junior — leasing ou crédit, assurance élevée.",
      families: "4 places confortables ; technologies utiles pour trajets scolaires sécurisés.",
      professionals: "Image corporate forte — clients et partenaires.",
      longDistance: "eTSI 150 ou TDI pour liaisons régulières inter-villes.",
    },
    faqs: [
      { q: "Vaut-il acheter une Golf 8 au Maroc ?", a: "Oui si budget et entretien VW assumés — confort et techno au top du segment C premium." },
      { q: "eTSI ou TDI pour Marrakech ?", a: "eTSI suffisant en usage mixte ; TDI si grands trajets quotidiens." },
      { q: "La Golf 8 perd-elle vite de la valeur ?", a: "Décote présente mais moins brutale que certaines premium — marché occasion encore en formation." },
      { q: "Problèmes connus Golf 8 ?", a: "Rappels logiciels infotainment, vigilance DSG — consultez historique concession." },
      { q: "Où voir des annonces Golf 8 ?", a: "Goovoiture /acheter et concessionnaires VW — stock limité mais qualitatif." },
      { q: "Golf 8 ou Audi A3 ?", a: "Golf plus polyvalente ; A3 image premium et finitions supérieures à prix proche." },
      { q: "Consommation eTSI en ville ?", a: "6–7 L/100 km réel avec clim — meilleure que Golf 7 TSI équivalente." },
      { q: "Entretien DSG Golf 8 ?", a: "Vidange DSG tous les 60 000 km obligatoire — coût 3 500–5 000 MAD." },
      { q: "Golf 8 en location longue durée ?", a: "Proposée par quelques loueurs premium — vérifiez offres Goovoiture." },
      { q: "Quelle finition choisir ?", a: "Style pour le meilleur rapport équipement/prix ; R-Line pour l'esthétique sportive." },
    ],
  },
  {
    brandSlug: "volkswagen",
    modelSlug: "polo",
    displayName: "Volkswagen Polo",
    listingTerms: ["polo"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "La Polo transpose l'ADN Volkswagen en citadine : qualité de fabrication, tenue de route sûre et finitions supérieures à beaucoup de rivales du segment B. Au Maroc, elle séduit les urbains de Casablanca et Rabat recherchant une petite allemande sans passer par une compacte.",
    popularity:
      "Moins volumineuse que la Golf, la Polo reste prisée pour sa sécurité perçue et sa valeur de revente dans le segment premium B. Les motorisations MPI et TSI couvrent l'usage urbain ; le réseau VW assure un SAV correct dans les grandes métropoles.",
    engines: {
      diesel: "1.4 TDI 75–90 ch sur générations antérieures — rare sur Polo VI récente.",
      essence: "1.0 MPI 65/75 ch et 1.0 TSI 95/110 ch — dominantes au Maroc.",
      automatic: "DSG 7 sur finitions Style et R-Line — agréable en circulation dense.",
      manual: "BVM 5 rapports sur MPI — simple et économique à entretenir.",
    },
    consumption: { city: "5,8–7,0 L/100 km", highway: "4,2–5,0 L/100 km" },
    reliability: {
      strengths: [
        "Construction solide et bonnes notes Euro NCAP",
        "Moteur 1.0 TSI moderne et sobre",
        "Tenue de route supérieure à nombre de citadines",
      ],
      weaknesses: [
        "Coffre modeste pour familles",
        "Prix neuf/occasion plus élevé qu'une Clio ou 208",
        "Coût pièces VW au-dessus de la moyenne française",
      ],
    },
    prices: {
      occasion: "95 000 – 145 000 MAD pour Polo V/VI TSI.",
      recent: "155 000 – 195 000 MAD pour Polo VI récente Style ou R-Line.",
      popularVersions: ["Polo Comfortline", "Polo Style", "Polo R-Line", "Polo 1.0 TSI"],
    },
    maintenance:
      "4 500–7 000 MAD/an en usage urbain. Huiles VW spécifiques pour TSI. Pneus 185/60 R15 ou 195/55 R16 selon jantes.",
    audience: {
      youngDrivers: "Excellente si budget le permet — image et sécurité.",
      families: "Second véhicule plutôt que principale — coffre limité.",
      professionals: "Commerciaux urbains, image soignée.",
      longDistance: "Possible en TSI mais confort inférieur à Golf sur long trajet.",
    },
    faqs: [
      { q: "Polo ou Ibiza : quelle VW Group au Maroc ?", a: "Mécanique proche ; Polo badge VW, Ibiza souvent mieux prix en occasion." },
      { q: "La Polo est-elle spacieuse ?", a: "Correcte pour 4 adultes sur court trajet ; arrière un peu juste pour grands gabarits." },
      { q: "Prix Polo 2020 occasion ?", a: "125 000–155 000 MAD selon km et finition TSI." },
      { q: "TSI ou MPI ?", a: "TSI plus performant ; MPI plus simple et économique à l'achat." },
      { q: "Où réparer une Polo à Marrakech ?", a: "Concession VW et garages VAG spécialisés — pièces à commander parfois." },
      { q: "Polo en location ?", a: "Disponible chez certaines agences — moins courante que Clio ou Sandero." },
      { q: "Consommation Polo TSI Casa ?", a: "6–6,5 L/100 km avec clim en ville." },
      { q: "Polo R-Line vaut-elle le coup ?", a: "Si esthétique et jantes importantes ; sinon Style suffit." },
      { q: "Fiabilité Polo VI ?", a: "Bonne avec entretien VW ; surveiller turbo 1.0 TSI sur kilométrages élevés." },
      { q: "Annonces Polo sur Goovoiture ?", a: "Filtrez Volkswagen en occasion — stocks concentrés sur grandes villes." },
    ],
  },
  {
    brandSlug: "volkswagen",
    modelSlug: "tiguan",
    displayName: "Volkswagen Tiguan",
    listingTerms: ["tiguan"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "Le Tiguan place Volkswagen sur le segment SUV familial premium au Maroc. Plus raffiné qu'un Duster, il combine habitacle spacieux, technologies et comportement routier allemand — prisé à Rabat, Casablanca et dans les stations balnéaires pour les familles aisées.",
    popularity:
      "Les routes vers Ifrane, la corniche atlantique et les déplacements aéroport poussent la demande SUV premium. Le Tiguan répond avec 4MOTION sur certaines versions, un coffre généreux et une image de réussite sociale modérée — entre Duster pragmatique et Q5 luxe.",
    engines: {
      diesel: "2.0 TDI 150–190 ch — référence autoroute et couple en côte.",
      essence: "1.4 TSI et 2.0 TSI — moins fréquents mais disponibles en occasion importée.",
      automatic: "DSG 7 ou 8 rapports quasi systématique — adapté au SUV urbain.",
      manual: "Rare sur Tiguan II — marché occasion limité.",
    },
    consumption: { city: "8,0–9,5 L/100 km", highway: "5,8–6,8 L/100 km" },
    reliability: {
      strengths: [
        "Finitions et isolation supérieures au segment Dacia/Renault SUV",
        "4MOTION efficace sur routes humides ou gravier léger",
        "Valeur de revente forte dans le haut de gamme généraliste",
      ],
      weaknesses: [
        "Prix d'achat et entretien élevés",
        "Poids important — freins et pneus sollicités en montagne",
        "DSG et AdBlue à budgetiser sur TDI",
      ],
    },
    prices: {
      occasion: "180 000 – 260 000 MAD pour Tiguan II TDI.",
      recent: "270 000 – 350 000 MAD pour exemplaires récents Carat ou R-Line.",
      popularVersions: ["Tiguan Confortline", "Tiguan Carat", "Tiguan R-Line", "Tiguan 2.0 TDI 4MOTION"],
    },
    maintenance:
      "8 000–14 000 MAD/an possible selon km. AdBlue, DSG, pneus 235/55 R18 coûteux. Réseau VW pour mises à jour ADAS.",
    audience: {
      youngDrivers: "Peu adapté — budget assurance et gabarit.",
      families: "Cible idéale : 2–3 enfants, voyages, sécurité.",
      professionals: "Dirigeants PME, consultants — image et confort.",
      longDistance: "TDI 150+ pour trajets Casa–Tanger confortables.",
    },
    faqs: [
      { q: "Tiguan ou Duster pour famille ?", a: "Tiguan confort et finitions ; Duster budget et routes difficiles." },
      { q: "4MOTION nécessaire au Maroc ?", a: "Utile Atlas hiver ou pistes ; 4×2 suffit en usage urbain/suburbain." },
      { q: "Prix Tiguan 2019 TDI ?", a: "220 000–260 000 MAD selon km — contrôlez AdBlue et DSG." },
      { q: "Consommation TDI autoroute ?", a: "6–6,5 L/100 km à 120 km/h — plus en ville." },
      { q: "Tiguan 7 places existe-t-il ?", a: "Tiguan Allspace parfois importé — vérifiez annonces spécifiques Goovoiture." },
      { q: "Coût pneus Tiguan ?", a: "3 500–6 000 MAD/pneu selon dimension 18'' — prévoir changement tous les 40 000–50 000 km." },
      { q: "Assurance Tiguan ?", a: "Prime haute — tous risques quasi obligatoire." },
      { q: "Location Tiguan Maroc ?", a: "Proposé par loueurs premium — tarifs journaliers supérieurs à Duster." },
      { q: "Tiguan ou Tucson ?", a: "Tiguan plus premium ; Tucson meilleur rapport équipement/prix et réseau Hyundai." },
      { q: "Points de contrôle occasion ?", a: "DSG, turbo, capteurs ADAS, historique VW et carrosserie SUV (portières, pare-chocs)." },
    ],
  },
];
