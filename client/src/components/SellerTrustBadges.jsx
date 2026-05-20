/**
 * Displays seller verification badges on listing cards and seller profiles.
 * Props: seller = User object with nationalId, driverLicense, roles, createdAt
 */
export default function SellerTrustBadges({ seller, compact = false }) {
  if (!seller) return null;

  const isDealer    = seller.roles?.includes("rental_owner");
  const cinVerified = !!seller.nationalId?.verified;
  const perVerified = !!seller.driverLicense?.verified;
  const memberMonths = seller.createdAt
    ? Math.floor((Date.now() - new Date(seller.createdAt)) / (1000 * 60 * 60 * 24 * 30))
    : null;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {isDealer    && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">🏢 Professionnel</span>}
        {cinVerified && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ CIN vérifiée</span>}
        {!isDealer && !cinVerified && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">👤 Particulier</span>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confiance & Vérification</p>
      <div className="flex flex-wrap gap-2">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
          isDealer ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-600 border-gray-200"
        }`}>
          {isDealer ? "🏢 Professionnel" : "👤 Particulier"}
        </span>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
          cinVerified ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-400 border-gray-200"
        }`}>
          {cinVerified ? "✓ CIN vérifiée" : "○ CIN non vérifiée"}
        </span>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
          perVerified ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-400 border-gray-200"
        }`}>
          {perVerified ? "✓ Permis vérifié" : "○ Permis non vérifié"}
        </span>
        {memberMonths !== null && (
          <span className="text-xs px-2.5 py-1 rounded-full font-medium border bg-purple-50 text-purple-700 border-purple-200">
            📅 Membre depuis {memberMonths < 1 ? "< 1 mois" : `${memberMonths} mois`}
          </span>
        )}
      </div>
    </div>
  );
}
