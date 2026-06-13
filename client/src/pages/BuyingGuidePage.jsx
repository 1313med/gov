import { useState } from "react";

const GUIDES = [
  {
    id: "mutation",
    icon: "📄",
    title: "Comment faire la mutation (transfert de carte grise)",
    steps: [
      { title: "Préparer les documents", body: "CIN du vendeur et de l'acheteur, ancienne carte grise, quittance de vignette à jour, contrat de vente signé, certificat d'immatriculation original." },
      { title: "Passer à la prefecture", body: "Rendez-vous à la préfecture ou la délégation de votre ville (Département des Transports). Arrivez tôt le matin pour éviter les longues files." },
      { title: "Payer les droits de mutation", body: "Les frais varient selon la puissance fiscale du véhicule (50 à 300 MAD environ). Payez à la caisse sur place." },
      { title: "Recevoir le récépissé", body: "Vous recevrez un récépissé provisoire valable 3 mois. La nouvelle carte grise arrive par courrier sous 4 à 6 semaines." },
      { title: "Assurer le véhicule", body: "Souscrivez une assurance au nom du nouvel acheteur avant de conduire. Le récépissé de mutation fait foi auprès de la police." },
    ],
    tip: "Le vendeur et l'acheteur doivent être présents ou représentés par procuration légalisée.",
  },
  {
    id: "credit",
    icon: "🏦",
    title: "Comment vérifier qu'une voiture n'est pas sous crédit",
    steps: [
      { title: "Demandez le certificat de situation administrative", body: "Le vendeur doit pouvoir prouver que la voiture est libre de tout gage bancaire. Ce document s'obtient à la préfecture." },
      { title: "Vérifiez la carte grise", body: "La mention 'gage' ou 'nantissement' apparaît parfois sur la carte grise. Une carte grise normale n'a aucune restriction." },
      { title: "Utilisez notre outil de vérification", body: "Soumettez une demande de vérification de crédit sur Goovoiture. Notre équipe vérifie manuellement auprès des sources officielles." },
      { title: "Méfiez-vous des prix trop bas", body: "Un prix anormalement bas pour l'état et le modèle du véhicule est souvent le signe d'une situation irrégulière (crédit, saisie, vol)." },
    ],
    tip: "Ne payez jamais l'intégralité du montant avant d'avoir signé le contrat de vente et vérifié le statut bancaire du véhicule.",
  },
  {
    id: "inspection",
    icon: "🔍",
    title: "Checklist d'inspection avant achat",
    steps: [
      { title: "Carrosserie", body: "Vérifiez les bosses, rouille, traces de peinture fraîche (signe de réparation cachée), jeux des portes et coffre, alignement des panneaux." },
      { title: "Moteur", body: "Démarrez à froid. Écoutez les bruits anormaux. Vérifiez le niveau d'huile (couleur, consistance), le liquide de refroidissement, les courroies." },
      { title: "Intérieur", body: "Tous les boutons, vitres électriques, climatisation, tableau de bord sans voyants allumés, odeur d'humidité (signe de problème d'étanchéité)." },
      { title: "Essai routier", body: "Testez le freinage, la direction, les accélérations, la boîte de vitesses. Roulez sur autoroute et en ville." },
      { title: "Visite chez un mécanicien", body: "Avant de signer, faites inspecter le véhicule par un mécanicien indépendant de confiance. C'est un investissement de 200–400 MAD qui peut vous éviter des réparations coûteuses." },
    ],
    tip: "N'achetez jamais un véhicule sans l'essayer et sans faire vérifier la visite technique (valide ou non).",
  },
  {
    id: "wcar",
    icon: "🚗",
    title: "Les voitures importées W (immatriculation W)",
    steps: [
      { title: "Qu'est-ce qu'une W ?", body: "Les voitures avec une plaque commençant par W sont des importations parallèles, souvent achetées en Europe et dédouanées au Maroc. Légales, mais avec des particularités." },
      { title: "Vérifier la conformité", body: "Assurez-vous que la voiture a bien passé la visite technique marocaine et que la carte grise marocaine a été émise (carte grise W ou normale après régularisation)." },
      { title: "Pièces de rechange", body: "Les versions européennes peuvent avoir des spécifications différentes. Vérifiez la disponibilité des pièces avant d'acheter (airbag, capteurs, etc.)." },
      { title: "Assurance", body: "Certaines assurances refusent les véhicules de moins de 3 ans importés. Vérifiez auprès de votre assureur avant l'achat." },
    ],
    tip: "Une W bien régularisée avec carte grise marocaine n'est pas un problème. L'absence de carte grise marocaine est un signal d'alarme.",
  },
  {
    id: "negotiation",
    icon: "💬",
    title: "Comment négocier le prix d'une voiture",
    steps: [
      { title: "Faites vos recherches", body: "Consultez le prix marché sur Goovoiture (bouton 'Estimation prix marché' sur chaque annonce). Connaître le prix réel vous donne un avantage." },
      { title: "Listez les défauts", body: "Notez tous les défauts lors de l'inspection (rayures, usure des pneus, visite technique expirée). Chaque point est un argument de négociation." },
      { title: "Ne montrez pas trop d'enthousiasme", body: "Restez neutre lors de la visite. Un acheteur trop pressé paiera plus cher." },
      { title: "Faites une offre raisonnable", body: "Proposez 10–15% en dessous du prix demandé. Basez-vous sur le prix marché et les défauts constatés." },
      { title: "Utilisez les alternatives", body: "Mentionnez d'autres voitures similaires que vous avez vues. La concurrence est votre meilleur outil de négociation." },
    ],
    tip: "Ne négociez jamais sous pression ou à la dernière minute. Si le vendeur se montre pressant, méfiez-vous.",
  },
];

export default function BuyingGuidePage() {
  const [open, setOpen] = useState(null);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Guide d'achat automobile au Maroc</h1>
      <p className="text-gray-500 text-sm mb-8">
        Tout ce que vous devez savoir pour acheter une voiture d'occasion en toute sécurité au Maroc.
      </p>

      <div className="space-y-4">
        {GUIDES.map((guide) => (
          <div key={guide.id} className="border rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpen(open === guide.id ? null : guide.id)}
              className="w-full flex items-center gap-3 p-5 text-left hover:bg-gray-50 transition"
            >
              <span className="text-3xl">{guide.icon}</span>
              <div className="flex-1">
                <h2 className="font-semibold text-gray-800">{guide.title}</h2>
              </div>
              <span className="text-gray-400 text-lg">{open === guide.id ? "▲" : "▼"}</span>
            </button>
            {open === guide.id && (
              <div className="px-5 pb-5 border-t bg-gray-50">
                <div className="pt-4 space-y-4">
                  {guide.steps.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 mb-0.5">{step.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{step.body}</p>
                      </div>
                    </div>
                  ))}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700 mt-4">
                    <span className="font-semibold">💡 Conseil :</span> {guide.tip}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
