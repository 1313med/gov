/** @type {import("../index.js").AuthorityModel[]} */
export const TOYOTA_MODELS = [
  {
    brandSlug: "toyota",
    modelSlug: "yaris",
    displayName: "Toyota Yaris",
    listingTerms: ["yaris"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "La Yaris porte la réputation fiabilité Toyota au Maroc. Citadine hybride ou essence selon génération, elle séduit les acheteurs cherchant un véhicule durable avec coût de panne minimal — particulièrement prisée à Rabat et dans les zones résidentielles.",
    popularity:
      "Toyota jouit d'une image de longévité au Maroc. La Yaris hybride gagne du terrain pour la sobriété en ville ; l'essence reste majoritaire en occasion. Réseau Toyota solide, revente excellente et assurance parfois avantageuse compte tenu du risque sinistre perçu.",
    engines: {
      diesel: "Absente sur Yaris récente au Maroc.",
      essence: "1.0/1.3/1.5 et hybridation 1.5 Hybrid — dominantes.",
      automatic: "CVT sur Hybrid — très fluide en embouteillage Casa.",
      manual: "BVM 5/6 sur essence classique.",
    },
    consumption: { city: "4,5–6,5 L/100 km", highway: "4,0–5,0 L/100 km" },
    reliability: {
      strengths: [
        "Fiabilité légendaire Toyota",
        "Hybrid très sobre en ville",
        "Valeur de revente exceptionnelle",
      ],
      weaknesses: [
        "Prix d'achat supérieur aux françaises",
        "Sensation CVT peu sportive",
        "Finitions parfois en retrait vs 208 GT",
      ],
    },
    prices: {
      occasion: "85 000 – 140 000 MAD pour Yaris III essence.",
      recent: "155 000 – 210 000 MAD pour Yaris IV Hybrid récente.",
      popularVersions: ["Yaris Dynamic", "Yaris Design", "Yaris Hybrid", "Yaris 1.5"],
    },
    maintenance:
      "4 500–7 500 MAD/an. Hybrid : batterie haute tension à contrôler en occasion. Réseau Toyota national.",
    audience: {
      youngDrivers: "Hybrid idéal ville — économie carburant.",
      families: "Deux enfants urbains — coffre correct IV.",
      professionals: "Flottes soucieuses de fiabilité.",
      longDistance: "Essence 1.5 ou Hybrid — correct ; Corolla préférable si >25 000 km/an.",
    },
    faqs: [
      { q: "Yaris Hybrid consommation Casa ?", a: "4–5 L/100 km réel en ville — parmi les meilleures du marché." },
      { q: "Yaris ou Clio ?", a: "Yaris fiabilité et revente ; Clio prix et réseau plus dense." },
      { q: "Batterie Hybrid durable ?", a: "Toyota garantit longtemps — vérifier état SOH en occasion >100 000 km." },
      { q: "Prix Yaris Hybrid 2022 ?", a: "185 000–210 000 MAD selon km." },
      { q: "Yaris en location ?", a: "Disponible agences — Goovoiture." },
      { q: "CVT bruyant ?", a: "Normal sous accélération forte — conduite souple recommandée." },
      { q: "Yaris ou i20 ?", a: "Yaris fiabilité ; i20 design et garantie Hyundai." },
      { q: "Entretien Hybrid coûteux ?", a: "Comparable essence si réseau Toyota — pas de vidange BVM." },
      { q: "Fiabilité Yaris Maroc ?", a: "Excellente — peu de pannes majeures rapportées." },
      { q: "Contrôle occasion Hybrid ?", a: "Diagnostic batterie, historique Toyota, freinage régénératif." },
    ],
  },
  {
    brandSlug: "toyota",
    modelSlug: "corolla",
    displayName: "Toyota Corolla",
    listingTerms: ["corolla"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "La Corolla est la berline compacte de référence mondiale, très respectée au Maroc. Du trajet Casa–Rabat quotidien aux longues distances vers Fès ou Agadir, elle incarne durabilité, confort et valeur de revente — souvent choisie par les ménages qui gardent leur voiture 10 ans et plus.",
    popularity:
      "Les Corolla Hybrid récentes attirent les cadres soucieux de TCO. L'essence 1.6/1.8 reste omniprésente en occasion. Image sobre, coût de panne faible et réseau Toyota font de la Corolla un « achat rationnel » sur le marché marocain.",
    engines: {
      diesel: "1.4 D-4D sur anciennes générations — rare aujourd'hui.",
      essence: "1.6 et 1.8 ainsi que 1.8 Hybrid 122/140 ch.",
      automatic: "CVT Hybrid — référence confort urbain.",
      manual: "BVM 6 sur essence — longévité mécanique.",
    },
    consumption: { city: "5,0–7,0 L/100 km", highway: "4,5–5,5 L/100 km" },
    reliability: {
      strengths: [
        "Durabilité exceptionnelle",
        "Hybrid économique et fiable",
        "Revente parmi les meilleures du marché",
      ],
      weaknesses: [
        "Prix plus élevé que Mégane ou Focus",
        "Sensation de conduite neutre",
        "Délai pièces parfois sur finitions rares",
      ],
    },
    prices: {
      occasion: "100 000 – 165 000 MAD pour Corolla XI/XII essence.",
      recent: "185 000 – 250 000 MAD pour Corolla Hybrid récente.",
      popularVersions: ["Corolla Dynamic", "Corolla Design", "Corolla Hybrid", "Corolla 1.8"],
    },
    maintenance:
      "5 000–8 500 MAD/an. Entretien Toyota strict recommandé pour Hybrid. Pneus 205/55 R16 courants.",
    audience: {
      youngDrivers: "Seconde voiture famille plutôt — budget élevé.",
      families: "Excellente — 3 enfants possible, coffre généreux.",
      professionals: "Commerciaux, cadres — fiabilité image.",
      longDistance: "Hybrid ou essence — référence segment C.",
    },
    faqs: [
      { q: "Corolla ou Megane ?", a: "Corolla fiabilité et revente ; Mégane prix et réseau Renault." },
      { q: "Corolla Hybrid autoroute ?", a: "5 L/100 km possible — moteur essence prend le relais en côte." },
      { q: "Prix Corolla 2019 ?", a: "140 000–170 000 MAD essence selon km." },
      { q: "Corolla diesel encore ?", a: "Occasion ancienne seulement — Hybrid remplace avantages TCO." },
      { q: "Corolla en location ?", a: "Agences premium — Goovoiture." },
      { q: "Fiabilité Corolla Maroc ?", a: "Top du marché — entretien régulier suffit." },
      { q: "Corolla ou Civic ?", a: "Corolla réseau Toyota Maroc plus dense ; Civic plus rare." },
      { q: "Assurance Corolla ?", a: "Prime modérée segment C — bonus fiabilité certains assureurs." },
      { q: "Kilométrage élevé acceptable ?", a: "Oui si carnet Toyota — 200 000+ km courant." },
      { q: "Contrôle occasion ?", a: "Hybrid batterie, CVT, carrosserie, historique concession." },
    ],
  },
  {
    brandSlug: "toyota",
    modelSlug: "hilux",
    displayName: "Toyota Hilux",
    listingTerms: ["hilux"],
    subtitle:
      "Guide complet, prix, fiabilité, consommation, motorisations et annonces disponibles sur GooVoiture.",
    introduction:
      "Le Hilux est le pick-up utilitaire de légende au Maroc : chantiers, agriculture, mines et convois sur pistes. Réputation « indestructible », capacité de charge et 4x4 sérieux en font l'outil de travail numéro un hors agglomération.",
    popularity:
      "Sur les routes du Sud, de l'Oriental et des zones industrielles, le Hilux domine. Les versions double cabine servent aussi de véhicule familial rustique. Prix d'achat élevé compensé par durabilité et forte demande occasion.",
    engines: {
      diesel: "2.4 D-4D et 2.8 D-4D — couple et fiabilité.",
      essence: "Rare au Maroc sur Hilux récent.",
      automatic: "Auto 6 rapports sur finitions hautes.",
      manual: "BVM 6 — standard chantier, robuste.",
    },
    consumption: { city: "9,0–11,0 L/100 km", highway: "7,5–8,5 L/100 km" },
    reliability: {
      strengths: [
        "Robustesse légendaire en conditions sévères",
        "4x4 efficace sable et montagne",
        "Revente excellente même kilométrage élevé",
      ],
      weaknesses: [
        "Confort routier limité vs SUV",
        "Prix et assurance élevés",
        "Gabarit difficile en ville ancienne",
      ],
    },
    prices: {
      occasion: "200 000 – 320 000 MAD selon génération et 4x4.",
      recent: "330 000 – 450 000 MAD pour Hilux VIII récent.",
      popularVersions: ["Hilux Invincible", "Hilux SR5", "Hilux 2.4 GD", "Hilux 2.8 GD"],
    },
    maintenance:
      "8 000–15 000 MAD/an usage pro. Vidanges fréquentes si poussière/sable. Réseau Toyota solide zones industrielles.",
    audience: {
      youngDrivers: "Peu pertinent — permis et usage pro.",
      families: "Double cabine possible — confort basique.",
      professionals: "Cible principale — BTP, agro, transport.",
      longDistance: "Diesel autoroute — stable mais bruyant.",
    },
    faqs: [
      { q: "Hilux ou Ranger ?", a: "Hilux fiabilité ; Ranger parfois mieux équipé à prix proche." },
      { q: "Hilux consommation chargé ?", a: "10–12 L/100 km mixte chargé — normal pour pick-up." },
      { q: "Prix Hilux 2018 4x4 ?", a: "280 000–340 000 MAD selon finition Invincible." },
      { q: "Hilux en ville Casa ?", a: "Possible mais stationnement et consommation pénalisants." },
      { q: "Fiabilité Hilux Maroc ?", a: "Référence absolue — entretien régulier clé." },
      { q: "Hilux location ?", a: "Loueurs chantier et aventure — stock Goovoiture limité." },
      { q: "2.4 ou 2.8 ?", a: "2.8 plus coupleux chargé ; 2.4 suffisant usage mixte." },
      { q: "Assurance Hilux ?", a: "Prime élevée — utilitaire ou particulier selon carte grise." },
      { q: "Contrôle occasion ?", a: "4x4, chassis (off-road), turbo, structure benne, kilométrage réel." },
      { q: "Hilux vs Duster ?", a: "Hilux utilitaire pro ; Duster SUV familial." },
    ],
  },
];
