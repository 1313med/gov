/** Seed Q&A for authority pages — merged with live /api/qa data. */

export const QUESTION_SEEDS = [
  {
    slug: "assurance-auto-obligatoire-maroc",
    question: "L'assurance auto est-elle obligatoire au Maroc ?",
    body: "Je viens d'acheter une occasion — quelle couverture minimum avant de rouler ?",
    topic: "assurance",
    answers: [
      {
        authorName: "GoVoiture",
        body: "Oui — la responsabilité civile (RC) est obligatoire pour tout véhicule immatriculé. Sans attestation valide, vous risquez une amende et une responsabilité personnelle totale en cas d'accident. Souscrivez RC avant de circuler ; tous risques recommandé pour véhicules récents.",
        verifiedExpert: true,
        accepted: true,
      },
    ],
  },
  {
    slug: "credit-auto-sans-apport-maroc",
    question: "Peut-on obtenir un crédit auto sans apport au Maroc ?",
    body: "Salarié CDI, 3 ans d'ancienneté — banques demandent toujours un apport ?",
    topic: "financement",
    answers: [
      {
        authorName: "GoVoiture",
        body: "Certaines banques financent à 100 % pour profils stables (CDI, fonctionnaire) sur véhicules neufs ou occasion récente. Taux souvent plus élevé sans apport. Prévoyez au minimum frais dossier + assurance emprunteur.",
        verifiedExpert: true,
        accepted: true,
      },
    ],
  },
  {
    slug: "delai-transfert-carte-grise-maroc",
    question: "Combien de temps pour le transfert de carte grise au Maroc ?",
    topic: "demarches",
    answers: [
      {
        authorName: "GoVoiture",
        body: "Comptez 1 à 4 semaines selon la wilaya et la complétude du dossier (CT valide, quitus fiscal, contrat légalisé). Ne payez jamais le solde sans vérifier l'absence de crédit/gage sur le véhicule.",
        verifiedExpert: true,
        accepted: true,
      },
    ],
  },
  {
    slug: "prix-dacia-logan-occasion-casablanca",
    question: "Quel prix pour une Dacia Logan occasion à Casablanca en 2026 ?",
    brand: "dacia",
    model: "logan",
    topic: "achat",
    answers: [
      {
        authorName: "GoVoiture",
        body: "Consultez l'indice prix GoVoiture en temps réel — médiane basée sur annonces approuvées et véhicules vendus. Logan 2018–2021 : fourchette typique 65 000–95 000 MAD selon km et finition.",
        verifiedExpert: true,
        accepted: true,
      },
    ],
  },
  {
    slug: "location-voiture-caution-maroc",
    question: "Pourquoi les agences bloquent-elles une caution location ?",
    topic: "location",
    answers: [
      {
        authorName: "GoVoiture",
        body: "La caution couvre franchise, dommages non assurés ou carburant manquant. Ce n'est pas une assurance. Comparez les agences GoVoiture avec avis vérifiés et options rachat franchise.",
        verifiedExpert: true,
        accepted: true,
      },
    ],
  },
  {
    slug: "verifier-voiture-gagee-maroc",
    question: "Comment vérifier si une voiture est gagée au Maroc ?",
    topic: "demarches",
    answers: [
      {
        authorName: "GoVoiture",
        body: "Utilisez GoVoiture Crédit Check avant achat — workflow de vérification du statut crédit/gage. Exigez aussi carte grise et CIN vendeur cohérents.",
        verifiedExpert: true,
        accepted: true,
      },
    ],
  },
];

export function getQuestionSeed(slug) {
  return QUESTION_SEEDS.find((q) => q.slug === slug) || null;
}

export function getAllQuestionSeeds() {
  return QUESTION_SEEDS;
}

export function questionPath(slug) {
  return `/questions/${slug}`;
}

export function questionsHubPath() {
  return "/questions";
}
