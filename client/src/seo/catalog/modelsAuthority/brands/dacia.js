/** @type {import("../index.js").AuthorityModel[]} */
export const DACIA_MODELS = [
  {
    brandSlug: "dacia",
    modelSlug: "logan",
    displayName: "Dacia Logan",
    listingTerms: ["logan"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "La Dacia Logan est devenue la référence des berlines abordables au Maroc depuis son lancement local. Montée à Tanger et largement adoptée par les flottes de taxis, VTC et entreprises, elle structure le marché de l'entrée de gamme. Sa plateforme éprouvée, son coffre généreux et son coût d'acquisition bas en font un pilier des annonces occasion sur Casablanca, Rabat et les villes moyennes.",
    popularity:
      "Au Maroc, la Logan séduit par un rapport prix/espace difficile à battre. Les routes nationales, les trajets inter-villes et l'usage intensif en zone urbaine demandent une voiture simple à entretenir : la Logan coche cette case. Les pièces Renault/Dacia sont disponibles presque partout, le SAV est dense à Casa et Rabat, et la revente reste liquide grâce à une demande constante des jeunes ménages et des professionnels.",
    engines: {
      diesel: "1.5 dCi 75–90 ch : référence des taxis et flottes, couple utile en ville et sur autoroute Casa–Rabat.",
      essence: "1.0 TCe 90 ch et 1.2 16V : versions particulières économiques, adaptées aux petits parcours urbains.",
      automatic: "Boîte EDC disponible sur certaines finitions récentes — rare en occasion, prisée en location.",
      manual: "BVM 5 rapports sur la majorité du parc — fiabilité mécanique et coût d'entretien maîtrisé.",
    },
    consumption: { city: "6,0–7,5 L/100 km", highway: "4,5–5,5 L/100 km" },
    reliability: {
      strengths: [
        "Mécanique simple et éprouvée sur des centaines de milliers d'exemplaires locaux",
        "Coût des révisions parmi les plus bas du marché marocain",
        "Carrosserie résistante aux petits chocs urbains et aux routes secondaires",
      ],
      weaknesses: [
        "Habitacle et finitions basiques sur les anciennes générations",
        "Tenue de route modeste à vide chargé sur autoroute",
        "Usure des silentblocs et rotules accélérée sur routes dégradées",
      ],
    },
    prices: {
      occasion: "45 000 – 95 000 MAD selon année et kilométrage pour les premières générations.",
      recent: "110 000 – 155 000 MAD pour les Logan III essence récentes, faible km.",
      popularVersions: ["Logan MCV", "Logan Essential", "Logan Stepway", "Logan 1.5 dCi"],
    },
    maintenance:
      "Vidange 3 500–4 500 MAD, plaquettes 800–1 200 MAD, courroie de distribution à surveiller selon motorisation. Le réseau Dacia/Renault couvre toutes les régions ; les pièces d'origine et adaptables circulent largement à Derb Omar et dans les zones industrielles.",
    audience: {
      youngDrivers: "Premier achat raisonnable, assurance et entretien accessibles, revente facile.",
      families: "Coffre MCV apprécié, 5 vraies places, budget maîtrisé pour le quotidien scolaire.",
      professionals: "Choix n°1 des taxis, livreurs et agents — robustesse et pièces immédiates.",
      longDistance: "dCi recommandé pour Casa–Tanger ou Casa–Marrakech ; confort basique mais économique.",
    },
    faqs: [
      { q: "Quel est le prix d'une Dacia Logan d'occasion au Maroc ?", a: "Comptez 45 000 MAD pour une ancienne génération à plus de 200 000 km, et jusqu'à 155 000 MAD pour une Logan III récente. Les tarifs varient fortement entre Casa, Rabat et les villes du Sud." },
      { q: "La Logan est-elle fiable pour un usage taxi ?", a: "Oui, c'est l'un des modèles les plus éprouvés en flotte marocaine. Un entretien régulier des filtres et une surveillance des trains roulants suffisent pour dépasser 300 000 km." },
      { q: "Quelle motorisation choisir pour la ville ?", a: "Le 1.0 TCe ou le 1.2 essence conviennent aux trajets courts. Le 1.5 dCi reste pertinent si vous roulez plus de 15 000 km/an." },
      { q: "La Logan consomme-t-elle beaucoup ?", a: "En usage mixte, prévoyez 6–7 L/100 km en essence et 5–6 L en diesel. En ville dense (Casa, Rabat), ajoutez 0,5 à 1 L." },
      { q: "Où trouver des pièces détachées Logan au Maroc ?", a: "Réseau Dacia, concessionnaires Renault et marché de pièces à Casablanca (Derb Omar, zones industrielles). Les filtres et freins sont peu chers." },
      { q: "Logan ou Sandero : laquelle choisir ?", a: "La Logan offre plus d'espace coffre et une image berline. La Sandero est plus compacte et maniable en ville. Comparez sur Goovoiture selon votre usage." },
      { q: "La Logan Stepway vaut-elle le surcoût ?", a: "Si vous circulez sur routes cassées ou zones rurales, la garde au sol et les protections plastiques justifient l'option. En ville lisse, la version standard suffit." },
      { q: "Quelle assurance pour une Logan au Maroc ?", a: "Les primes restent parmi les plus basses du segment B. Une tierce étendue est souvent suffisante compte tenu de la valeur vénale modérée." },
      { q: "Peut-on louer une Logan sur Goovoiture ?", a: "Oui, de nombreuses agences proposent la Logan en location courte ou longue durée — consultez les offres /louer filtrées par Dacia." },
      { q: "Quels points contrôler avant d'acheter une Logan occasion ?", a: "Kilométrage cohérent, jeu aux roulements, état de l'embrayage, corrosion des passages de roue et historique d'entretien chez Dacia." },
    ],
  },
  {
    brandSlug: "dacia",
    modelSlug: "sandero",
    displayName: "Dacia Sandero",
    listingTerms: ["sandero"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "La Sandero incarne la citadine polyvalente à prix maîtrisé au Maroc. Plus courte que la Logan, elle reste spacieuse pour sa catégorie et bénéficie de la même logistique pièces que le reste de la gamme Dacia. Les versions Stepway ont gagné les routes de montagne et les banlieues où le bitume cède parfois la place aux pistes.",
    popularity:
      "Les Marocains choisissent la Sandero pour garer facilement en médina, circuler dans les ruelles étroites et limiter la facture carburant. Son image jeune, les finitions récentes plus soignées et les motorisations TCe en font une concurrente directe de la Clio et de la 208 sur le marché de l'occasion récente.",
    engines: {
      diesel: "1.5 dCi 75–95 ch : intéressant pour les gros rouleurs, moins répandu que sur la Logan.",
      essence: "1.0 TCe 90/100 ch et SCe 75 ch : cœur de gamme, suffisant pour l'usage urbain marocain.",
      automatic: "EDC sur finitions hautes — pratique à Casa et Rabat en heure de pointe.",
      manual: "BVM 5 rapports, pédale d'embrayage légère, idéal pour apprentissage de la conduite.",
    },
    consumption: { city: "5,8–7,0 L/100 km", highway: "4,3–5,2 L/100 km" },
    reliability: {
      strengths: [
        "Plateforme CMF partagée avec Renault — pièces standardisées",
        "Bon comportement sur routes sinueuses du Rif et de l'Atlas moyen",
        "Revente rapide grâce à la demande citadine",
      ],
      weaknesses: [
        "Insonorisation perfectible sur autoroute",
        "Électronique embarquée parfois capricieuse sur les premières TCe",
        "Sellerie sensible à l'usure en usage intensif VTC",
      ],
    },
    prices: {
      occasion: "55 000 – 100 000 MAD pour les générations II en bon état.",
      recent: "125 000 – 170 000 MAD pour Sandero III Stepway ou finition Expression récente.",
      popularVersions: ["Sandero Stepway", "Sandero Essential", "Sandero TCe 100"],
    },
    maintenance:
      "Budget annuel inférieur à 4 000 MAD hors pneus pour un usage urbain normal. Les kits de distribution et filtres sont abordables ; prévoir un contrôle des amortisseurs arrière après 80 000 km sur routes difficiles.",
    audience: {
      youngDrivers: "Maniabilité, prix d'entrée bas, assurance légère — excellente première voiture.",
      families: "Deux enfants + poussette dans le coffre, mais moins de place qu'une Logan MCV.",
      professionals: "Appréciée en location courte durée et par certains livreurs urbains.",
      longDistance: "Possible en TCe, mais le confort autoroutier reste en retrait face à une Mégane.",
    },
    faqs: [
      { q: "Sandero ou Logan : quelle Dacia pour Casablanca ?", a: "Sandero pour le stationnement et la maniabilité ; Logan si vous privilégiez le coffre et les longs trajets famille." },
      { q: "Le moteur 1.0 TCe est-il adapté à Marrakech en été ?", a: "Oui, à condition d'entretenir le circuit de refroidissement. Évitez les montées en côte à pleine charge prolongée avec clim à fond." },
      { q: "Quel budget pour une Sandero Stepway neuve d'occasion ?", a: "Autour de 140 000–170 000 MAD pour moins de 50 000 km. Les versions Essential descendent sous 130 000 MAD." },
      { q: "La Sandero tient-elle la route sur l'autoroute ?", a: "Elle reste stable jusqu'à 120 km/h. Au-delà, le vent latéral et le bruit augmentent — préférez une berline pour de longs trajets réguliers." },
      { q: "Y a-t-il une version GPL au Maroc ?", a: "Peu répandue localement. La plupart des Sandero circulent en essence ou diesel selon la génération." },
      { q: "Quels pneus pour une Sandero Stepway ?", a: "Dimension 195/55 R16 fréquente — privilégiez des marques reconnues pour les routes mixtes ville/montagne." },
      { q: "Comment vérifier une Sandero d'occasion ?", a: "Contrôlez la boîte EDC si présente, les traces de choc sur les protections Stepway et l'historique des rappels constructeur." },
      { q: "Peut-on financer une Sandero au Maroc ?", a: "Oui via les crédits auto des banques et certains concessionnaires — le faible prix facilite l'accès au financement." },
      { q: "La Sandero est-elle disponible en location ?", a: "Oui, plusieurs agences Goovoiture la proposent à Casa, Rabat et Marrakech." },
      { q: "Quelle consommation réelle en ville à Rabat ?", a: "Comptez 6–7 L/100 km en essence avec climatisation, 5–6 L en diesel si vous optez pour cette motorisation." },
    ],
  },
  {
    brandSlug: "dacia",
    modelSlug: "duster",
    displayName: "Dacia Duster",
    listingTerms: ["duster"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "Le Dacia Duster a redéfini le SUV accessible au Maroc. Des routes de l'Atlas aux pistes sahariennes, il offre une garde au sol utile sans atteindre les tarifs d'un 4×4 premium. Sa carrosserie haute, son habitacle simple et sa capacité de chargement en font le véhicule familial de référence hors agglomération.",
    popularity:
      "Les familles marocaines l'adoptent pour les retours au village, les week-ends à Ifrane ou Essaouira et les trajets sur routes non goudronnées. Les versions diesel 4×2 et 4×4 dominent les annonces ; la seconde génération a modernisé le habitacle tout en conservant l'ADN robuste.",
    engines: {
      diesel: "1.5 dCi 85–115 ch : motorisation reine au Maroc, couple suffisant en côte atlasique.",
      essence: "1.6 SCe et 1.3 TCe 4×4 sur les versions récentes — plus rares mais appréciées en essence.",
      automatic: "EDC sur finitions Prestige — utile en embouteillage urbain malgré le profil SUV.",
      manual: "BVM 6 rapports sur dCi récents — passage des vitesses précis pour tout-terrain léger.",
    },
    consumption: { city: "7,0–8,5 L/100 km", highway: "5,5–6,5 L/100 km" },
    reliability: {
      strengths: [
        "Châssis tolérant aux routes dégradées et aux nids-de-poule",
        "Coût d'entretien contenu pour un SUV",
        "Forte valeur de revente dans tout le Royaume",
      ],
      weaknesses: [
        "Freinage perfectible à vide chargé en descente de montagne",
        "Qualité perçue inférieure aux SUV premium sur long trajet",
        "4×4 simplifié — pas un véritable tout-terrain hardcore",
      ],
    },
    prices: {
      occasion: "95 000 – 160 000 MAD pour les Duster II diesel bien entretenus.",
      recent: "175 000 – 240 000 MAD pour Duster III TCe ou dCi récent, faible kilométrage.",
      popularVersions: ["Duster Essential", "Duster Prestige", "Duster 4×4", "Duster Stepway"],
    },
    maintenance:
      "Prévoir vidanges régulières si usage poussiéreux. Vérifier les soufflets de transmission 4×4, les plaquettes plus sollicitées en montagne et l'état du FAP sur les dCi récents. Budget annuel 5 000–8 000 MAD selon kilométrage.",
    audience: {
      youngDrivers: "Moins adapté — gabarit et assurance plus élevés ; préférer Sandero ou 208.",
      families: "Cible principale : enfants, bagages, voyages inter-régions confortables.",
      professionals: "Agents immobiliers ruraux, artisans, petites entreprises de BTP léger.",
      longDistance: "Excellent en dCi sur Casa–Agadir ou Fès–Oujda avec pauses régulières.",
    },
    faqs: [
      { q: "Le Duster 4×2 suffit-il pour l'Atlas ?", a: "Pour les pistes légères et routes goudronnées oui. Pour neige ou chemins boueux, la version 4×4 reste préférable." },
      { q: "Quel prix pour un Duster 2018 au Maroc ?", a: "Entre 130 000 et 165 000 MAD selon finition et kilométrage — vérifiez l'historique d'entretien du turbo." },
      { q: "Duster ou Tiguan : que choisir ?", a: "Duster pour le budget et les routes difficiles ; Tiguan pour le confort autoroutier et la finition premium." },
      { q: "La consommation explose-t-elle en 4×4 ?", a: "Légèrement en usage mixte. Le surcoût principal vient du poids et de l'aérodynamisme, pas uniquement du 4×4." },
      { q: "Combien coûte une courroie de distribution Duster ?", a: "Comptez 4 000–6 500 MAD pose comprise selon motorisation — à planifier autour de 90 000–120 000 km." },
      { q: "Le Duster est-il bruyant ?", a: "Plus que une berline, surtout aux vitesses autoroutières. Un bon tapis de sol et pneus récents améliorent le confort." },
      { q: "Peut-on tracter avec un Duster ?", a: "Oui pour caravane légère ou remorque — respectez la charge utile indiquée sur la carte grise." },
      { q: "Quelles annonces Duster sur Goovoiture ?", a: "Consultez les sections occasion et location — filtrez par Dacia pour voir les stocks actuels." },
      { q: "Le Duster tient-il la côte en été à Marrakech ?", a: "Le dCi gère bien la chaleur si le circuit de refroidissement est sain. Surveillez la température en montée vers l'Ourika." },
      { q: "Faut-il une assurance tous risques ?", a: "Recommandée pour les versions récentes au-dessus de 180 000 MAD ; tierce étendue possible sur les exemplaires plus âgés." },
    ],
  },
];
