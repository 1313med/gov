/**
 * Slides de découverte — première connexion (français, ton simple pour le Maroc).
 */

export const ROLE_ONBOARDING_META = {
  customer: {
    label: "Explorer",
    tagline: "Louer ou acheter une voiture",
    accent: "#7c6bff",
    accentLight: "#6248e8",
    grad: ["#7c6bff", "#5b4ddb"],
    heroGrad: ["rgba(124,107,255,0.22)", "rgba(124,107,255,0.04)"],
  },
  car_owner: {
    label: "Propriétaire",
    tagline: "Votre voiture & la vente",
    accent: "#38bdf8",
    accentLight: "#0284c7",
    grad: ["#38bdf8", "#0ea5e9"],
    heroGrad: ["rgba(56,189,248,0.22)", "rgba(56,189,248,0.04)"],
  },
  rental_owner: {
    label: "Loueur",
    tagline: "Gérer votre flotte",
    accent: "#34d399",
    accentLight: "#059669",
    grad: ["#34d399", "#10b981"],
    heroGrad: ["rgba(52,211,153,0.22)", "rgba(52,211,153,0.04)"],
  },
  admin: {
    label: "Administration",
    tagline: "Modération de la plateforme",
    accent: "#f472b6",
    accentLight: "#db2777",
    grad: ["#f472b6", "#ec4899"],
    heroGrad: ["rgba(244,114,182,0.22)", "rgba(244,114,182,0.04)"],
  },
};

const SLIDES = {
  customer: [
    {
      kind: "welcome",
      icon: "sparkles",
      title: "Bienvenue sur Goovoiture",
      body: "La plateforme pour louer ou acheter des voitures au Maroc, en toute simplicité.",
      tips: ["Annonces vérifiées", "Prix clairs", "Partout au Maroc"],
    },
    {
      icon: "search",
      title: "Trouvez la bonne voiture",
      body: "Filtrez par ville, budget, carburant et boîte. Casablanca, Rabat, Marrakech… en quelques secondes.",
      tips: ["À louer ou à vendre", "Carte et liste", "Favoris enregistrés"],
    },
    {
      icon: "calendar",
      title: "Réservez en toute clarté",
      body: "Choisissez vos dates, voyez le prix total, puis envoyez votre demande au loueur.",
      tips: ["Dates flexibles", "Suivi des demandes", "Messages intégrés"],
    },
    {
      icon: "shield-checkmark",
      title: "Un profil prêt à louer",
      body: "Ajoutez une fois votre permis et votre CIN. Ensuite, vos prochaines réservations seront plus rapides.",
      tips: ["Documents sécurisés", "Historique des locations", "Support Goovoiture"],
    },
  ],
  car_owner: [
    {
      kind: "welcome",
      icon: "sparkles",
      title: "Bienvenue, propriétaire",
      body: "Goovoiture vous aide à suivre votre voiture et à la mettre en vente quand vous voulez.",
      tips: ["Mon Garage", "Rappels utiles", "Vente optionnelle"],
    },
    {
      icon: "car-sport",
      title: "Mon Garage — tout au même endroit",
      body: "Assurance, vidange, visite technique, vignette… chaque échéance est visible et claire.",
      tips: ["Dates importantes", "Documents rangés", "Modification rapide"],
    },
    {
      icon: "notifications",
      title: "Alertes avant les oublis",
      body: "On vous prévient à l'avance pour ne pas rater une assurance ou un contrôle.",
      tips: ["Rappels automatiques", "Moins de stress", "Voiture toujours en règle"],
    },
    {
      icon: "storefront",
      title: "Vendre sur la marketplace",
      body: "Quand vous êtes prêt, publiez votre annonce. Des acheteurs parcourent déjà Goovoiture.",
      tips: ["Photos & prix", "Messages acheteurs", "Gestion des annonces"],
    },
  ],
  rental_owner: [
    {
      kind: "welcome",
      icon: "sparkles",
      title: "Bienvenue, loueur",
      body: "Pilotez votre activité de location : flotte, réservations et revenus, depuis votre téléphone.",
      tips: ["Tableau de bord", "Réservations", "Calendrier"],
    },
    {
      icon: "analytics",
      title: "Votre tableau de bord",
      body: "Revenus, réservations en cours et état de la flotte — tout est visible dès l'ouverture.",
      tips: ["Vue d'ensemble", "Indicateurs clés", "Suivi mensuel"],
    },
    {
      icon: "clipboard",
      title: "Gérez les demandes clients",
      body: "Consultez permis et CIN, acceptez ou refusez, puis suivez le paiement et les dates.",
      tips: ["Profil locataire", "PDF reçu", "Notifications"],
    },
    {
      icon: "trophy",
      title: "Optimisez votre flotte",
      body: "Voyez quelles annonces attirent le plus de vues et ajustez prix et disponibilités.",
      tips: ["Vues par annonce", "Calendrier", "Offres spéciales"],
    },
  ],
  admin: [
    {
      kind: "welcome",
      icon: "sparkles",
      title: "Espace administration",
      body: "Vous modérez la plateforme Goovoiture : annonces, utilisateurs et signalements.",
      tips: ["Vue globale", "Actions rapides", "Sécurité"],
    },
    {
      icon: "shield-half",
      title: "Modérer les annonces",
      body: "Validez ou retirez les contenus qui ne respectent pas les règles de la plateforme.",
      tips: ["File d'attente", "Décision tracée", "Qualité des annonces"],
    },
    {
      icon: "people",
      title: "Gérer les comptes",
      body: "Consultez les profils, vérifiez les documents et intervenez si besoin.",
      tips: ["Utilisateurs", "Rôles", "Support"],
    },
  ],
};

/** Slide optionnelle si plusieurs rôles sur le compte */
export const MULTI_ROLE_SLIDE = {
  icon: "swap-horizontal",
  title: "Plusieurs espaces pour vous",
  body: "Votre compte peut inclure plusieurs rôles. Changez d'espace depuis votre profil à tout moment.",
  tips: ["Explorer · Loueur · Propriétaire", "Un seul compte", "Mode mémorisé"],
};

export function getOnboardingSlides(roleKey, { multiRole } = {}) {
  const slides = [...(SLIDES[roleKey] || SLIDES.customer)];
  if (multiRole) slides.push(MULTI_ROLE_SLIDE);
  return slides;
}

export function getOnboardingMeta(roleKey) {
  return ROLE_ONBOARDING_META[roleKey] || ROLE_ONBOARDING_META.customer;
}
