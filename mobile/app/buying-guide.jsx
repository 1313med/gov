import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";

const GUIDES = [
  { id: "mutation", icon: "📄", title: "Comment faire la mutation (carte grise)", steps: ["Préparez: CIN vendeur+acheteur, ancienne carte grise, quittance vignette à jour, contrat de vente signé.", "Rendez-vous à la préfecture (Département des Transports) tôt le matin.", "Payez les droits de mutation (50–300 MAD selon puissance fiscale).", "Récupérez le récépissé provisoire valable 3 mois. La carte grise arrive sous 4–6 semaines.", "Souscrivez une assurance au nom du nouvel acheteur avant de conduire."], tip: "Le vendeur et l'acheteur doivent être présents ou représentés par procuration légalisée." },
  { id: "credit", icon: "🏦", title: "Vérifier qu'une voiture n'est pas sous crédit", steps: ["Demandez le certificat de situation administrative (préfecture).", "Vérifiez la carte grise: la mention 'gage' ou 'nantissement' est un signal d'alarme.", "Utilisez notre outil de vérification de crédit GooVoiture.", "Méfiez-vous des prix anormalement bas pour l'état et le modèle.", "Ne payez jamais intégralement avant d'avoir vérifié le statut bancaire."], tip: "Notre service de vérification de crédit est gratuit — utilisez-le avant tout achat." },
  { id: "inspection", icon: "🔍", title: "Checklist d'inspection avant achat", steps: ["Carrosserie: bosses, rouille, traces de peinture fraîche, jeux des portes.", "Moteur: démarrez à froid, écoutez les bruits, vérifiez niveaux huile et liquide.", "Intérieur: boutons, vitres électriques, clim, absence de voyants allumés.", "Essai routier: freinage, direction, accélérations, boîte de vitesses.", "Faites inspecter par un mécanicien indépendant (200–400 MAD)."], tip: "N'achetez jamais sans essai routier et vérification de la visite technique." },
  { id: "wcar", icon: "🚗", title: "Les voitures importées (immatriculation W)", steps: ["Les voitures W sont des importations parallèles d'Europe, légales mais avec particularités.", "Vérifiez que la carte grise marocaine a été émise après régularisation.", "Vérifiez la disponibilité des pièces de rechange pour les versions européennes.", "Certaines assurances refusent les véhicules de moins de 3 ans importés.", "L'absence de carte grise marocaine est un signal d'alarme."], tip: "Une W bien régularisée avec carte grise marocaine est normale. Sans carte grise = fuyez." },
  { id: "nego", icon: "💬", title: "Comment négocier le prix", steps: ["Consultez le prix marché sur GooVoiture (bouton 'Estimation prix marché').", "Listez tous les défauts lors de la visite — chaque point est un argument.", "Restez neutre lors de la visite. Montrez peu d'enthousiasme.", "Proposez 10–15% en dessous du prix demandé.", "Mentionnez d'autres voitures similaires que vous avez vues."], tip: "Ne négociez jamais sous pression. Un vendeur pressant est souvent suspect." },
];

export default function BuyingGuideScreen() {
  const [open, setOpen] = useState(null);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={s.title}>Guide d'achat au Maroc</Text>
      <Text style={s.subtitle}>Tout pour acheter une voiture d'occasion en toute sécurité.</Text>
      {GUIDES.map((g) => (
        <View key={g.id} style={s.card}>
          <TouchableOpacity style={s.cardHeader} onPress={() => setOpen(open === g.id ? null : g.id)}>
            <Text style={s.cardIcon}>{g.icon}</Text>
            <Text style={s.cardTitle}>{g.title}</Text>
            <Text style={s.chevron}>{open === g.id ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {open === g.id && (
            <View style={s.cardBody}>
              {g.steps.map((step, i) => (
                <View key={i} style={s.step}>
                  <View style={s.stepNum}><Text style={s.stepNumText}>{i + 1}</Text></View>
                  <Text style={s.stepText}>{step}</Text>
                </View>
              ))}
              <View style={s.tip}>
                <Text style={s.tipText}>💡 {g.tip}</Text>
              </View>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: "#fff", padding: 20 },
  title:        { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  subtitle:     { fontSize: 13, color: "#6b7280", marginBottom: 20 },
  card:         { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 16, marginBottom: 12, overflow: "hidden" },
  cardHeader:   { flexDirection: "row", alignItems: "center", padding: 16, gap: 10 },
  cardIcon:     { fontSize: 24 },
  cardTitle:    { flex: 1, fontSize: 14, fontWeight: "600", color: "#111827" },
  chevron:      { fontSize: 12, color: "#9ca3af" },
  cardBody:     { backgroundColor: "#f9fafb", padding: 16, borderTopWidth: 1, borderTopColor: "#f3f4f6" },
  step:         { flexDirection: "row", gap: 10, marginBottom: 12 },
  stepNum:      { width: 22, height: 22, borderRadius: 11, backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center", marginTop: 1, flexShrink: 0 },
  stepNumText:  { color: "#fff", fontSize: 11, fontWeight: "700" },
  stepText:     { flex: 1, fontSize: 13, color: "#374151", lineHeight: 20 },
  tip:          { backgroundColor: "#eff6ff", borderRadius: 10, padding: 10, marginTop: 4 },
  tipText:      { fontSize: 12, color: "#1d4ed8", lineHeight: 18 },
});
