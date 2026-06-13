import { View, Text, TouchableOpacity, ScrollView, Linking, StyleSheet } from "react-native";

const CONTACTS = [
  { label: "Police",   number: "19",           icon: "🚔" },
  { label: "SAMU",    number: "15",            icon: "🚑" },
  { label: "Pompiers",number: "15",            icon: "🚒" },
  { label: "CNPAC",   number: "0537712071",    icon: "🏛️" },
];

const STEPS = [
  { icon: "🚨", title: "Sécurité d'abord", body: "Si vous ou d'autres personnes êtes blessés, appelez le 15 ou le 19 immédiatement." },
  { icon: "📸", title: "Documenter la scène", body: "Photos de tous les véhicules, dommages, plaques, position sur la route — avant de déplacer quoi que ce soit." },
  { icon: "📋", title: "Constat amiable", body: "Remplissez le constat avec l'autre conducteur. Ne signez rien sous pression. Chacun garde un exemplaire." },
  { icon: "📞", title: "Contacter l'assurance", body: "Appelez votre assurance dans les 5 jours ouvrables. Notez le numéro de sinistre." },
  { icon: "📱", title: "Contacter le propriétaire", body: "Si vous louez, contactez immédiatement le propriétaire via Goovoiture." },
];

export default function EmergencyScreen() {
  const call = (number) => Linking.openURL(`tel:${number.replace(/\D/g, "")}`);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={s.title}>🆘 Assistance urgence</Text>
      <Text style={s.subtitle}>Guide étape par étape en cas d'accident au Maroc</Text>

      {/* Emergency contacts */}
      <View style={s.contactsBox}>
        <Text style={s.contactsTitle}>📞 Numéros d'urgence</Text>
        <View style={s.contactsGrid}>
          {CONTACTS.map((c) => (
            <TouchableOpacity key={c.label} style={s.contactCard} onPress={() => call(c.number)}>
              <Text style={s.contactIcon}>{c.icon}</Text>
              <Text style={s.contactLabel}>{c.label}</Text>
              <Text style={s.contactNumber}>{c.number}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Steps */}
      <Text style={s.stepsTitle}>Que faire ?</Text>
      {STEPS.map((step, i) => (
        <View key={i} style={s.step}>
          <Text style={s.stepIcon}>{step.icon}</Text>
          <View style={s.stepContent}>
            <View style={s.stepHeader}>
              <View style={s.stepBadge}><Text style={s.stepBadgeText}>{i + 1}</Text></View>
              <Text style={s.stepTitle}>{step.title}</Text>
            </View>
            <Text style={s.stepBody}>{step.body}</Text>
          </View>
        </View>
      ))}

      <View style={s.tip}>
        <Text style={s.tipText}>💡 Conseil : Téléchargez et imprimez un modèle de constat amiable et gardez-le dans la boîte à gants avec votre carte verte.</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: "#fff", padding: 20 },
  title:        { fontSize: 22, fontWeight: "700", color: "#dc2626", marginBottom: 4 },
  subtitle:     { fontSize: 13, color: "#6b7280", marginBottom: 20 },
  contactsBox:  { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca", borderRadius: 16, padding: 16, marginBottom: 20 },
  contactsTitle:{ fontSize: 14, fontWeight: "700", color: "#b91c1c", marginBottom: 12 },
  contactsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  contactCard:  { backgroundColor: "#dc2626", borderRadius: 12, padding: 12, alignItems: "center", width: "47%" },
  contactIcon:  { fontSize: 22, marginBottom: 4 },
  contactLabel: { color: "rgba(255,255,255,0.8)", fontSize: 11 },
  contactNumber:{ color: "#fff", fontSize: 18, fontWeight: "800" },
  stepsTitle:   { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  step:         { flexDirection: "row", gap: 12, backgroundColor: "#f9fafb", borderRadius: 14, padding: 14, marginBottom: 10 },
  stepIcon:     { fontSize: 24 },
  stepContent:  { flex: 1 },
  stepHeader:   { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  stepBadge:    { width: 20, height: 20, borderRadius: 10, backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center" },
  stepBadgeText:{ color: "#fff", fontSize: 10, fontWeight: "700" },
  stepTitle:    { fontSize: 14, fontWeight: "600", color: "#111827" },
  stepBody:     { fontSize: 12, color: "#6b7280", lineHeight: 18 },
  tip:          { backgroundColor: "#eff6ff", borderRadius: 12, padding: 14, marginTop: 8 },
  tipText:      { fontSize: 12, color: "#1d4ed8", lineHeight: 18 },
});
