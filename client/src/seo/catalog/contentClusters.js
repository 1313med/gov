/** Curated authority clusters — real procedural content, not template stubs. */

export const CONTENT_CLUSTERS = {
  assurance: {
    slug: "assurance",
    hubPath: "/assurance",
    name: { fr: "Assurance automobile", en: "Car insurance", ar: "تأمين السيارات" },
    hubTitle: { fr: "Assurance auto au Maroc — guide complet", en: "Car insurance Morocco guide" },
    hubDescription: {
      fr: "RC obligatoire, tous risques, franchise, sinistres et location — tout comprendre sur l'assurance auto au Maroc.",
    },
    topics: [
      {
        slug: "assurance-automobile-maroc",
        title: { fr: "Assurance automobile au Maroc : obligations et types" },
        description: {
          fr: "Responsabilité civile obligatoire, tous risques, au tiers — cadre légal marocain et conseils pratiques.",
        },
        sections: [
          {
            heading: "Obligation légale",
            body: "Tout véhicule immatriculé au Maroc doit être couvert par une assurance responsabilité civile (RC). Conduire sans assurance est passible d'amendes, de saisie du véhicule et de responsabilité personnelle en cas d'accident.",
          },
          {
            heading: "Types de couverture",
            body: "RC au tiers (minimum légal), tiers étendu (vol/incendie), tous risques (dommages propres + tiers). En location, vérifiez si l'agence inclut une couverture de base ou propose un rachat de franchise.",
          },
          {
            heading: "Franchise et sinistres",
            body: "La franchise est la part à votre charge en cas de sinistre. En location Goovoiture, comparez les options rachat de franchise avant départ. En cas d'accident : constat amiable, photos, déclaration sous 5 jours ouvrables.",
          },
        ],
        faqs: [
          { q: "Quel est le prix moyen de l'assurance auto au Maroc ?", a: "La RC démarre autour de 1 500–3 500 MAD/an selon puissance et zone. Tous risques : 4 000–12 000+ MAD selon véhicule et profil." },
          { q: "L'assurance location couvre-t-elle le conducteur additionnel ?", a: "Vérifiez le contrat agence — conducteur additionnel souvent payant ou limité aux +25 ans." },
        ],
        relatedLinks: [{ label: "Location voiture Maroc", path: "/location-voiture" }, { label: "Crédit & financement", path: "/financement" }],
      },
      {
        slug: "assurance-location-voiture-maroc",
        title: { fr: "Assurance location voiture au Maroc" },
        description: { fr: "Couverture incluse, rachat franchise, caution — guide location." },
        sections: [
          { heading: "Couverture de base agence", body: "La plupart des agences incluent RC + protection collision partielle. Lisez les exclusions (pneus, vitres, sous-carrossage)." },
          { heading: "Caution vs assurance", body: "La caution n'est pas une assurance — c'est un dépôt bloqué. Une franchise non rachetée peut être prélevée sur caution en cas de dommage." },
        ],
        faqs: [{ q: "Puis-je refuser l'assurance agence ?", a: "Rarement pour les particuliers — certaines flottes pro ont polices fleet. Touristes : vérifiez extension carte gold/carte bancaire." }],
        relatedLinks: [{ label: "Agences Goovoiture", path: "/agences" }],
      },
      {
        slug: "sinistre-auto-maroc",
        title: { fr: "Déclarer un sinistre auto au Maroc" },
        description: { fr: "Étapes après accident : constat, assurance, réparation." },
        sections: [
          { heading: "Sur place", body: "Sécuriser les personnes, photos des dégâts et plaques, constat amiable signé par les deux parties si possible." },
          { heading: "Déclaration", body: "Prévenir assureur sous 5 jours ouvrables avec constat, carte grise, permis, attestation d'assurance." },
        ],
        faqs: [{ q: "Accident sans tiers identifié ?", a: "Déposer plainte au commissariat — requis pour prise en charge certains contrats." }],
        relatedLinks: [{ label: "Questions assurance", path: "/questions/assurance-auto-obligatoire-maroc" }],
      },
    ],
  },
  financement: {
    slug: "financement",
    hubPath: "/financement",
    name: { fr: "Crédit & financement auto", en: "Auto financing", ar: "تمويل السيارات" },
    hubTitle: { fr: "Crédit auto et financement voiture au Maroc" },
    hubDescription: {
      fr: "Crédit conso auto, apport, durée, taux indicatifs et simulation — acheter intelligemment au Maroc.",
    },
    topics: [
      {
        slug: "credit-auto-maroc",
        title: { fr: "Crédit auto au Maroc : comment ça marche" },
        description: { fr: "Banques, durées, apport minimum et documents pour financer votre voiture." },
        sections: [
          { heading: "Principe", body: "Le crédit auto marocain est généralement un crédit à la consommation affecté. Le véhicule reste gagé jusqu'au solde — vérifiez la situation via Goovoiture Crédit Check avant achat occasion." },
          { heading: "Apport et durée", body: "Apport courant : 10–30 %. Durées : 12 à 84 mois. Mensualité = capital × taux + assurance emprunteur obligatoire." },
          { heading: "Documents", body: "CIN, bulletins de salaire (3 mois), attestation de travail, RIB, parfois relevé bancaire. Auto-entrepreneurs : déclarations fiscales." },
        ],
        faqs: [
          { q: "Quel taux crédit auto Maroc en 2026 ?", a: "Taux indicatifs 6,5–9,5 % selon banque et profil — demandez simulation personnalisée." },
          { q: "Financer une occasion ?", a: "Oui — banques financent véhicules <10 ans avec contrôle technique valide et facture/contrat vente." },
        ],
        relatedLinks: [{ label: "Voiture occasion", path: "/voiture-occasion" }, { label: "Vérifier crédit véhicule", path: "/credit-check" }],
      },
      {
        slug: "financement-voiture-maroc",
        title: { fr: "Financement voiture : leasing et LOA" },
        description: { fr: "Alternatives au crédit classique pour particuliers et pros." },
        sections: [
          { heading: "Leasing pro", body: "Réservé aux sociétés — loyers déductibles, option d'achat en fin de contrat. Idéal flottes agences." },
          { heading: "Comparer crédit vs cash", body: "Cash = négociation prix plus forte. Crédit = préserve trésorerie — calculez coût total avec intérêts." },
        ],
        faqs: [{ q: "LOA disponible au Maroc ?", a: "Offres limitées vs Europe — vérifiez constructeurs et banques partenaires." }],
        relatedLinks: [{ label: "Goovoiture Pro", path: "/pro" }],
      },
      {
        slug: "simulation-mensualite-auto",
        title: { fr: "Simuler sa mensualité auto" },
        description: { fr: "Formule et exemples de mensualités pour budgets courants au Maroc." },
        sections: [
          { heading: "Formule simplifiée", body: "Mensualité ≈ (Prix − Apport) × [taux/12 × (1+taux/12)^n] / [(1+taux/12)^n − 1]. Exemple : 120 000 MAD, apport 20 %, 60 mois, 7,5 % → ~1 850 MAD/mois hors assurance." },
        ],
        faqs: [{ q: "Quel budget mensualité ?", a: "Règle pratique : mensualité ≤ 15 % du revenu net ménage." }],
        relatedLinks: [{ label: "Prix Dacia Logan", path: "/prix/dacia/logan" }],
      },
    ],
  },
  demarches: {
    slug: "demarches",
    hubPath: "/demarches",
    name: { fr: "Démarches & légal", en: "Ownership procedures", ar: "إجراءات الملكية" },
    hubTitle: { fr: "Transfert, carte grise et vente voiture au Maroc" },
    hubDescription: {
      fr: "Documents, NARSA, transfert de propriété, contrôle technique — guide officiel simplifié.",
    },
    topics: [
      {
        slug: "transfert-propriete-maroc",
        title: { fr: "Transfert de propriété voiture au Maroc" },
        description: { fr: "Étapes NARSA, taxe, délais et pièces pour enregistrer la vente." },
        sections: [
          { heading: "Étapes", body: "1) Contrat de vente légalisé ou enregistré. 2) Quitus fiscal. 3) Contrôle technique valide (<6 mois). 4) Dépôt dossier NARSA/prefecture. 5) Nouvelle carte grise au nom acquéreur." },
          { heading: "Délais", body: "Comptez 1 à 4 semaines selon ville et complétude dossier. Vendeur reste responsable tant que carte grise n'est pas transférée." },
        ],
        faqs: [
          { q: "Peut-on vendre sans CT valide ?", a: "Non recommandé — acquéreur ne pourra pas immatriculer. Renouvelez le CT avant vente." },
          { q: "Vente entre particuliers ?", a: "Contrat légalisé + vérification crédit/gage via Goovoiture avant paiement du solde." },
        ],
        relatedLinks: [{ label: "Documents vente", path: "/demarches/documents-vente-voiture-maroc" }, { label: "Vendre sur Goovoiture", path: "/vendre-ma-voiture" }],
      },
      {
        slug: "documents-vente-voiture-maroc",
        title: { fr: "Documents pour vendre sa voiture au Maroc" },
        description: { fr: "Checklist complète vendeur — évitez les blocages NARSA." },
        sections: [
          { heading: "Checklist vendeur", body: "Carte grise originale, CIN vendeur/acquéreur, contrôle technique, quitus fiscal, contrat vente (2 exemplaires), parfois certificat de non-gage." },
          { heading: "Avant la remise des clés", body: "Vérifier paiement complet (virement traçable), signer procuration si acquéreur immatricule seul, annuler assurance vendeur sous 15 jours." },
        ],
        faqs: [{ q: "Carte grise perdue ?", a: "Duplicata en prefecture avant toute vente — délai ~2 semaines." }],
        relatedLinks: [{ label: "Crédit Check", path: "/credit-check" }],
      },
      {
        slug: "controle-technique-maroc",
        title: { fr: "Contrôle technique au Maroc" },
        description: { fr: "Validité, prix, centres agréés et préparation." },
        sections: [
          { heading: "Validité", body: "Véhicules >5 ans : CT annuel obligatoire pour circulation et vente. Validité 6 mois pour transfert propriété." },
          { heading: "Préparation", body: "Vérifier éclairage, freins, pneus, pollution — refus fréquents sur fumée excessive diesel." },
        ],
        faqs: [{ q: "Prix CT Maroc ?", a: "Environ 250–350 MAD selon catégorie véhicule." }],
        relatedLinks: [{ label: "Occasion Casablanca", path: "/voiture-occasion/casablanca" }],
      },
    ],
  },
};

export function getCluster(slug) {
  return CONTENT_CLUSTERS[slug] || null;
}

export function getClusterTopic(clusterSlug, topicSlug) {
  const cluster = getCluster(clusterSlug);
  if (!cluster) return null;
  const topic = cluster.topics.find((t) => t.slug === topicSlug);
  if (!topic) return null;
  return { cluster, topic };
}

export function getAllClusterTopics() {
  const out = [];
  for (const cluster of Object.values(CONTENT_CLUSTERS)) {
    for (const topic of cluster.topics) {
      out.push({ cluster: cluster.slug, ...topic, path: `/${cluster.slug}/${topic.slug}` });
    }
  }
  return out;
}

export function clusterTopicPath(clusterSlug, topicSlug) {
  return `/${clusterSlug}/${topicSlug}`;
}
