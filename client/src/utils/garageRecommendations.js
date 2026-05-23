const CURRENT_YEAR = new Date().getFullYear();

function monthMorocco(fr) {
  const m = new Date().getMonth();
  if (m >= 5 && m <= 8) {
    return {
      icon: "sunny-outline",
      color: "#f59e0b",
      title: fr ? "Été au Maroc" : "Summer in Morocco",
      body: fr
        ? "Chaleur intense : vérifiez liquide de refroidissement, climatisation et pression des pneus avant les longs trajets."
        : "Intense heat: check coolant, A/C, and tyre pressure before long trips.",
      tag: fr ? "Saison" : "Season",
    };
  }
  if (m >= 11 || m <= 2) {
    return {
      icon: "rainy-outline",
      color: "#38bdf8",
      title: fr ? "Humidité & pluie" : "Rainy season",
      body: fr
        ? "Routes mouillées : contrôlez l'usure des pneus et les essuie-glaces. Un bon éclairage = plus de sécurité."
        : "Wet roads: check tyre wear and wipers. Good lights = safer drives.",
      tag: fr ? "Saison" : "Season",
    };
  }
  return {
    icon: "leaf-outline",
    color: "#22c55e",
    title: fr ? "Mi-saison" : "Mid-season",
    body: fr
      ? "Moment idéal pour une petite révision : filtres, niveaux et pression des pneus."
      : "Ideal time for a quick check: filters, fluids, and tyre pressure.",
    tag: fr ? "Saison" : "Season",
  };
}

export function getRecommendations(car, fr = true) {
  if (!car) return [];
  const recs = [monthMorocco(fr)];
  const age = Math.max(0, CURRENT_YEAR - (parseInt(car.year, 10) || CURRENT_YEAR));
  const brand = (car.brand || "").toLowerCase();
  const fuel = (car.fuelType || "").toLowerCase();
  const km = parseInt(car.currentMileage, 10) || 0;

  recs.push({
    type: "tip",
    icon: "flag-outline",
    color: "#ef4444",
    title: fr ? "Au Maroc, sans papiers = stress" : "In Morocco, papers = peace of mind",
    body: fr
      ? "Assurance, visite technique et vignette à jour évitent amendes et saisie. On vous rappelle avant l'expiration."
      : "Valid insurance, inspection & road tax avoid fines. We remind you before expiry.",
    tag: fr ? "Maroc" : "Morocco",
  });

  if (["diesel", "gasoil"].includes(fuel)) {
    recs.push({
      type: "maintenance",
      icon: "water-outline",
      color: "#f97316",
      title: fr ? "Filtre à gasoil" : "Diesel fuel filter",
      body: fr
        ? "Tous les ~40 000 km au Maroc (route poussiéreuse). Un filtre encrassé = +10–15 % de consommation."
        : "Every ~40,000 km in Morocco (dusty roads). A clogged filter burns more fuel.",
      tag: fr ? "Diesel" : "Diesel",
    });
    if (km > 100000) {
      recs.push({
        type: "maintenance",
        icon: "settings-outline",
        color: "#ef4444",
        title: fr ? "Injecteurs diesel" : "Diesel injectors",
        body: fr
          ? "Après 100 000 km, un nettoyage pro redonne couple et économise du gasoil."
          : "After 100,000 km, professional cleaning restores power and saves fuel.",
        tag: fr ? "Pro" : "Pro",
      });
    }
  }

  if (["essence", "gasoline"].includes(fuel)) {
    recs.push({
      type: "maintenance",
      icon: "flash-outline",
      color: "#eab308",
      title: fr ? "Bougies d'allumage" : "Spark plugs",
      body: fr
        ? "Tous les 30 000 km environ. Bougies usées = perte de puissance en côte (Atlas, Rif…)."
        : "About every 30,000 km. Worn plugs hurt power on hills.",
      tag: fr ? "Essence" : "Petrol",
    });
  }

  if (["electric", "electrique", "électrique", "hybride"].includes(fuel)) {
    recs.push({
      type: "tip",
      icon: "battery-charging-outline",
      color: "#22c55e",
      title: fr ? "Batterie & charge" : "Battery & charging",
      body: fr
        ? "Charge quotidienne entre 20 % et 80 %. Évitez la surchauffe en stationnement plein soleil."
        : "Daily charge between 20–80%. Avoid heat when parked in full sun.",
      tag: fr ? "Électrique" : "EV",
    });
  }

  if (age >= 5) {
    recs.push({
      type: "inspection",
      icon: "shield-checkmark-outline",
      color: "#38bdf8",
      title: fr ? "Courroie de distribution" : "Timing belt/chain",
      body: fr
        ? `Votre ${car.brand} a ${age} ans — une rupture coûte très cher. Vérifiez chez un garagiste de confiance.`
        : `Your ${car.brand} is ${age} years old — failure is costly. Ask a trusted mechanic.`,
      tag: fr ? "Critique" : "Critical",
    });
  }

  if (age >= 8) {
    recs.push({
      type: "sell",
      icon: "trending-up-outline",
      color: "#a78bfa",
      title: fr ? "Bonne fenêtre de vente" : "Good time to sell",
      body: fr
        ? `Les ${car.brand} ${car.year || ""} se vendent encore bien au Maroc. Estimez avant que le prix baisse.`
        : `${car.brand} ${car.year || ""} still sell well. Estimate before prices drop.`,
      action: "estimate",
      tag: fr ? "Marché" : "Market",
    });
  }

  if (["dacia", "renault"].includes(brand)) {
    recs.push({
      type: "tip",
      icon: "construct-outline",
      color: "#f97316",
      title: fr ? "Pièces Dacia / Renault" : "Dacia / Renault parts",
      body: fr
        ? "Freins et courroie : pièces d'origine. Filtres et plaquettes compatibles OK chez bon garagiste."
        : "Brakes & belt: OEM parts. Filters OK as quality aftermarket.",
      tag: "Dacia",
    });
  }

  if (["bmw", "mercedes", "mercedes-benz", "audi"].includes(brand)) {
    recs.push({
      type: "tip",
      icon: "diamond-outline",
      color: "#a78bfa",
      title: fr ? "Premium = entretien suivi" : "Premium needs care",
      body: fr
        ? `${car.brand} : centre agréé ou garagiste spécialisé. Carnet à jour = meilleure revente.`
        : `${car.brand}: authorized or specialist shop. Full service history = better resale.`,
      tag: "Premium",
    });
  }

  if (["toyota", "honda", "hyundai", "kia"].includes(brand)) {
    recs.push({
      type: "tip",
      icon: "checkmark-circle-outline",
      color: "#22c55e",
      title: fr ? "Fiabilité reconnue" : "Known reliability",
      body: fr
        ? `${car.brand} tient la route au Maroc. Vidange régulière = 300 000 km sans grosse panne, c'est courant.`
        : `${car.brand} lasts in Morocco. Regular oil changes → 300k km is common.`,
      tag: fr ? "Top" : "Top",
    });
  }

  if (km > 150000) {
    recs.push({
      type: "maintenance",
      icon: "construct-outline",
      color: "#ef4444",
      title: fr ? "Révision complète" : "Full service",
      body: fr
        ? `À ${km.toLocaleString()} km : liquides, filtres, freins. +5 000 à 15 000 MAD de valeur à la revente.`
        : `At ${km.toLocaleString()} km: fluids, filters, brakes. Adds resale value.`,
      tag: fr ? "Km" : "Mileage",
    });
  }

  recs.push({
    type: "tip",
    icon: "car-outline",
    color: "#38bdf8",
    title: fr ? "Contrôle routier" : "Road check",
    body: fr
      ? "Gardez assurance + visite + vignette dans le téléphone (photo). Moins de stress aux contrôles."
      : "Keep insurance, inspection & tax proof on your phone. Less stress at checks.",
    tag: fr ? "Astuce" : "Tip",
  });

  return recs.slice(0, 8);
}
