const CURRENT_YEAR = new Date().getFullYear();

export function getRecommendations(car) {
  if (!car) return [];
  const recs  = [];
  const age   = Math.max(0, CURRENT_YEAR - (parseInt(car.year) || CURRENT_YEAR));
  const brand = (car.brand || "").toLowerCase();
  const fuel  = (car.fuelType || "").toLowerCase();
  const km    = parseInt(car.currentMileage) || 0;

  // Fuel-specific
  if (["diesel", "gasoil"].includes(fuel)) {
    recs.push({
      type: "maintenance", icon: "water-outline", color: "#f97316",
      title: "Filtre à gasoil",
      body: "Les moteurs diesel nécessitent un filtre à carburant changé tous les 40 000 km. Un filtre encrassé augmente la conso de 10–15%.",
    });
    if (km > 100000) {
      recs.push({
        type: "maintenance", icon: "settings-outline", color: "#ef4444",
        title: "Injecteurs diesel",
        body: "Au-delà de 100 000 km, un nettoyage professionnel des injecteurs peut redonner des performances et économiser du carburant.",
      });
    }
  }

  if (["essence", "gasoline"].includes(fuel)) {
    recs.push({
      type: "maintenance", icon: "flash-outline", color: "#eab308",
      title: "Bougies d'allumage",
      body: "Remplacez les bougies tous les 30 000 km. Des bougies usées font perdre puissance et augmentent la consommation.",
    });
  }

  if (["electric", "electrique", "électrique"].includes(fuel)) {
    recs.push({
      type: "tip", icon: "battery-charging-outline", color: "#22c55e",
      title: "Santé de la batterie",
      body: "Gardez la charge entre 20% et 80% au quotidien. Évitez la charge rapide systématique pour préserver les cellules lithium.",
    });
  }

  // Age-based
  if (age >= 5) {
    recs.push({
      type: "inspection", icon: "shield-checkmark-outline", color: "#38bdf8",
      title: "Courroie de distribution",
      body: `Votre ${car.brand} a ${age} an${age > 1 ? "s" : ""}. Vérifiez l'état de la courroie de distribution — une rupture détruit le moteur sans avertissement.`,
    });
  }

  if (age >= 8) {
    recs.push({
      type: "sell", icon: "trending-up-outline", color: "#a78bfa",
      title: "Bonne fenêtre de vente",
      body: `Les ${car.brand} de ${car.year || ""} se vendent encore bien. Estimez la valeur maintenant avant que la dépréciation s'accélère.`,
      action: "estimate",
    });
  }

  // Brand-specific
  if (["dacia", "renault"].includes(brand)) {
    recs.push({
      type: "tip", icon: "construct-outline", color: "#f97316",
      title: "Pièces : original vs compatible",
      body: "Pour les pièces critiques (freins, courroie, pompe à eau), privilégiez toujours les pièces d'origine Dacia/Renault. Pour le reste, les compatibles sont acceptables.",
    });
  }

  if (["bmw", "mercedes", "mercedes-benz", "audi"].includes(brand)) {
    recs.push({
      type: "tip", icon: "alert-circle-outline", color: "#a78bfa",
      title: "Entretien agréé obligatoire",
      body: `${car.brand} exige des révisions en centre agréé. Des pièces non-origine peuvent invalider la garantie et générer des pannes électroniques coûteuses.`,
    });
  }

  if (["toyota", "honda"].includes(brand)) {
    recs.push({
      type: "tip", icon: "checkmark-circle-outline", color: "#22c55e",
      title: "Fiabilité longue durée",
      body: `${car.brand} est parmi les marques les plus fiables au Maroc. Avec un entretien régulier, votre véhicule peut dépasser 300 000 km sans grosse panne.`,
    });
  }

  // High mileage
  if (km > 150000) {
    recs.push({
      type: "maintenance", icon: "construct-outline", color: "#ef4444",
      title: "Révision complète recommandée",
      body: `À ${km.toLocaleString()} km, une révision complète (liquides, filtres, courroies, freins) peut augmenter la valeur de revente de 5 000 à 15 000 MAD.`,
    });
  }

  return recs.slice(0, 5);
}
