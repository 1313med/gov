export default function EmergencyPage() {
  const steps = [
    { icon: "🚨", title: "Votre sécurité d'abord", body: "Si vous êtes en danger ou blessé, appelez le 15 (SAMU) ou le 19 (Police). Quittez le véhicule si nécessaire." },
    { icon: "📸", title: "Documenter la scène", body: "Prenez des photos de tous les véhicules impliqués, des dommages, des plaques d'immatriculation, et de la position des véhicules sur la route." },
    { icon: "📋", title: "Remplir le constat amiable", body: "Remplissez le constat amiable (\"constat à l'amiable\") avec l'autre conducteur. Ne signez rien sous pression. Chacun garde un exemplaire." },
    { icon: "📞", title: "Contacter votre assurance", body: "Appelez votre assurance dans les 5 jours ouvrables. Gardez le numéro de sinistre. Ne reconnaissez pas la responsabilité verbalement." },
    { icon: "🏛️", title: "CNPAC si blessés", body: "En cas de blessés, contactez le Centre National de Prévention et de Sécurité Routière (CNPAC) et déposez une déclaration de sinistre à la police." },
    { icon: "📱", title: "Contacter le propriétaire", body: "Si vous louez, contactez immédiatement le propriétaire du véhicule via l'application GooVoiture et signalez l'incident dans vos réservations." },
  ];

  const contacts = [
    { label: "Police (Urgences)", number: "19", icon: "🚔" },
    { label: "SAMU (Urgences méd.)", number: "15", icon: "🚑" },
    { label: "Pompiers", number: "15", icon: "🚒" },
    { label: "CNPAC", number: "0537-71-20-71", icon: "🏛️" },
    { label: "Assurance (24h)", number: "Voir votre carte verte", icon: "📄" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🆘</div>
        <h1 className="text-2xl font-bold text-red-600 mb-2">Assistance d'urgence</h1>
        <p className="text-gray-500 text-sm">Guide étape par étape pour gérer un accident au Maroc</p>
      </div>

      {/* Emergency contacts */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8">
        <h2 className="font-bold text-red-700 mb-3">📞 Numéros d'urgence</h2>
        <div className="grid grid-cols-2 gap-3">
          {contacts.map((c) => (
            <a
              key={c.label}
              href={c.number.match(/^\d/) ? `tel:${c.number.replace(/\D/g, "")}` : "#"}
              className="flex items-center gap-2 bg-white border border-red-100 rounded-xl px-3 py-2.5 hover:bg-red-50 transition"
            >
              <span className="text-xl">{c.icon}</span>
              <div>
                <p className="text-xs text-gray-500">{c.label}</p>
                <p className="font-bold text-red-700 text-sm">{c.number}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Step by step */}
      <h2 className="font-bold text-gray-800 mb-4">Que faire étape par étape ?</h2>
      <div className="space-y-4">
        {steps.map((s, i) => (
          <div key={i} className="flex gap-4 p-4 border rounded-xl hover:bg-gray-50 transition">
            <div className="text-3xl">{s.icon}</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-white bg-gray-400 rounded-full w-5 h-5 flex items-center justify-center">{i + 1}</span>
                <h3 className="font-semibold text-gray-800">{s.title}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Constat template note */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-semibold mb-1">💡 Astuce</p>
        <p>Téléchargez et imprimez un modèle de constat amiable avant votre voyage. Gardez-le dans la boîte à gants avec votre carte verte.</p>
      </div>
    </div>
  );
}
