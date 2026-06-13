/** Ownership timeline guides — curated procedural content for Morocco. */

const TIMELINES = {
  "achat-voiture-occasion": {
    title: "Timeline achat voiture occasion au Maroc",
    description: "Étapes clés de la recherche à la carte grise — délais réalistes et pièges à éviter.",
    durationWeeks: 3,
    steps: [
      { week: 1, title: "Recherche & comparaison", body: "Définissez budget TCO (pas seulement prix d'achat). Comparez annonces GoVoiture, indices prix et fiabilité. Visitez 3–5 véhicules minimum.", checklist: ["Budget TCO calculé", "Modèles shortlistés", "Annonces favorites sauvegardées"] },
      { week: 1, title: "Inspection mécanique", body: "Faites contrôler le véhicule par un garagiste indépendant (150–400 MAD). Vérifiez CT, vignette, absence de gage.", checklist: ["Rapport garage", "CT valide", "Certificat de non-gage"] },
      { week: 2, title: "Négociation & acompte", body: "Négociez sur base des indices prix GoVoiture. Évitez gros acomptes sans contrat écrit. Privilégiez virement traçable.", checklist: ["Contrat de vente signé", "Reçu d'acompte", "Copie CIN vendeur"] },
      { week: 2, title: "Assurance provisoire", body: "Souscrivez une assurance avant de circuler. Certaines compagnies couvrent dès la prise en charge.", checklist: ["Attestation assurance", "Numéro de police"] },
      { week: 3, title: "Transfert carte grise", body: "Rendez-vous à la préfecture ou via NARSA selon procédure en vigueur. Frais ~350–500 MAD + timbre.", checklist: ["Formulaire transfert", "Quittance fiscale", "Nouvelle carte grise"] },
      { week: 3, title: "Visite technique si requise", body: "Si CT expiré ou véhicule importé, passez la visite dans un centre agréé avant immatriculation définitive.", checklist: ["PV visite technique", "Contre-visite si nécessaire"] },
    ],
    faqs: [
      { q: "Combien de temps pour transférer une carte grise ?", a: "Comptez 1 à 3 semaines selon préfecture et dossier complet." },
      { q: "Quels documents pour acheter une occasion ?", a: "CIN vendeur/acheteur, carte grise, certificat de non-gage, quittance fiscale, contrat de vente." },
    ],
    relatedLinks: [
      { label: "Indice prix marketplace", path: "/prix/dacia/logan" },
      { label: "Financement auto", path: "/financement/credit-auto-maroc" },
      { label: "Assurance", path: "/assurance/assurance-automobile-maroc" },
    ],
  },
  "vendre-voiture-maroc": {
    title: "Timeline vente voiture au Maroc",
    description: "De l'estimation à la remise des clés — maximiser le prix et sécuriser la transaction.",
    durationWeeks: 4,
    steps: [
      { week: 1, title: "Estimation & préparation", body: "Consultez l'indice prix GoVoiture pour votre modèle. Nettoyez, réparez petits défauts visibles, rassemblez carnet d'entretien.", checklist: ["Prix médian vérifié", "Photos professionnelles", "Historique entretien"] },
      { week: 1, title: "Publication annonce", body: "Publiez sur GoVoiture avec photos honnêtes, kilométrage exact, CT et vignette visibles. Répondez sous 2 h.", checklist: ["Annonce en ligne", "Prix compétitif", "WhatsApp activé"] },
      { week: 2, title: "Visites & essais", body: "Organisez essais en lieu public. Vérifiez identité acheteur. Ne remettez jamais le véhicule sans paiement complet.", checklist: ["CIN acheteur vérifiée", "Essai supervisé", "Aucun document remis avant paiement"] },
      { week: 3, title: "Paiement sécurisé", body: "Privilégiez virement bancaire ou chèque certifié. Évitez espèces importantes sans reçu. Attendez confirmation virement.", checklist: ["Paiement reçu", "Reçu de vente", "Chèque/virement confirmé"] },
      { week: 4, title: "Transfert administratif", body: "Accompagnez l'acheteur à la préfecture ou fournissez procuration. Signez le formulaire de transfert ensemble.", checklist: ["Formulaire signé", "Quittance fiscale", "Assurance résiliée"] },
    ],
    faqs: [
      { q: "Comment fixer le bon prix de vente ?", a: "Utilisez le médian GoVoiture pour votre marque/modèle/année — ajustez ±5 % selon état et kilométrage." },
      { q: "Dois-je déclarer la vente à l'assurance ?", a: "Oui — résiliez ou transférez dès la vente effective pour éviter votre responsabilité." },
    ],
    relatedLinks: [
      { label: "Vendre sur GoVoiture", path: "/vendre-ma-voiture" },
      { label: "Indice prix", path: "/prix/dacia/logan" },
    ],
  },
  "transfert-carte-grise": {
    title: "Timeline transfert carte grise Maroc",
    description: "Procédure NARSA/préfecture — documents, délais et coûts 2025.",
    durationWeeks: 2,
    steps: [
      { day: 1, title: "Constitution du dossier", body: "Rassemblez : formulaire de mutation (2 ex.), CIN original des deux parties, carte grise, certificat de non-gage (<30 jours), quittance fiscale.", checklist: ["Non-gage récent", "CIN valides", "Carte grise originale"] },
      { day: 2, title: "Paiement taxes & timbres", body: "Taxe de mutation ~350 MAD + timbre fiscal. Montant variable selon cylindrée et âge du véhicule.", checklist: ["Quittance fiscale payée", "Reçu timbre"] },
      { day: 3, title: "Dépôt préfecture / NARSA", body: "Dépôt du dossier au guichet. Horaires : généralement 8h30–15h30. Évitez lundi matin (affluence).", checklist: ["Récépissé de dépôt", "Numéro de dossier"] },
      { week: 2, title: "Retrait nouvelle carte grise", body: "Délai moyen 7–15 jours ouvrables. Vérifiez orthographe et numéro de châssis avant de quitter.", checklist: ["Carte grise au nom acheteur", "Autocollant vignette à jour"] },
    ],
    faqs: [
      { q: "Peut-on conduire pendant le transfert ?", a: "Avec récépissé de dépôt et assurance au nom de l'acheteur — vérifiez auprès de votre assureur." },
      { q: "Que faire si gage sur le véhicule ?", a: "Le vendeur doit lever le gage avant vente — certificat de non-gage obligatoire." },
    ],
    relatedLinks: [
      { label: "Hub démarches", path: "/demarches" },
      { label: "Transfert carte grise", path: "/demarches/transfert-carte-grise-maroc" },
    ],
  },
  "renouveler-assurance": {
    title: "Timeline renouvellement assurance auto Maroc",
    description: "Anticiper l'échéance — comparer, renégocier, éviter la conduite sans couverture.",
    durationWeeks: 2,
    steps: [
      { week: -4, title: "Alerte échéance (J-30)", body: "Notez la date d'expiration. Comparez au moins 2 devis — RC seule vs tous risques selon valeur véhicule.", checklist: ["Date échéance notée", "Devis comparés"] },
      { week: -2, title: "Choix formule & souscription", body: "RC obligatoire minimum. Tous risques recommandé si véhicule >120 000 MAD ou crédit en cours.", checklist: ["Formule choisie", "Attestation provisoire"] },
      { week: 0, title: "Renouvellement effectif", body: "Payez avant expiration — conduite sans assurance = amende + responsabilité personnelle en cas de sinistre.", checklist: ["Police signée", "Attestation dans véhicule"] },
      { week: 1, title: "Mise à jour vignette & CT", body: "Assurance, vignette et visite technique sont liées administrativement — vérifiez cohérence des dates.", checklist: ["Vignette à jour", "CT valide"] },
    ],
    faqs: [
      { q: "Combien coûte une assurance au Maroc ?", a: "RC : 2 500–5 500 MAD/an selon véhicule. Tous risques : 5 000–12 000 MAD/an." },
      { q: "Que faire en cas de sinistre ?", a: "Déclarez sous 5 jours ouvrables — constat amiable, photos, numéro de dossier assureur." },
    ],
    relatedLinks: [
      { label: "Hub assurance", path: "/assurance" },
      { label: "RC & tous risques", path: "/assurance/assurance-automobile-maroc" },
    ],
  },
};

export function getOwnershipTimeline(topicSlug) {
  const t = TIMELINES[topicSlug];
  if (!t) return null;
  return { slug: topicSlug, ...t };
}

export function getAllOwnershipTimelines() {
  return Object.keys(TIMELINES).map((slug) => getOwnershipTimeline(slug)).filter(Boolean);
}

export function ownershipHubPath() {
  return "/possession";
}

export function ownershipTimelinePath(topicSlug) {
  return `/possession/${topicSlug}`;
}
