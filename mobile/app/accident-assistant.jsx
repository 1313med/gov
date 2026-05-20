import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Linking, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadListingImages } from "../src/api/upload";

const PHOTO_PROMPTS = [
  { id: "scene",    label: "Vue générale de la scène", icon: "🛣️" },
  { id: "damage1",  label: "Dommages votre véhicule",  icon: "🚗" },
  { id: "damage2",  label: "Dommages autre véhicule",  icon: "🚙" },
  { id: "plates",   label: "Plaques d'immatriculation",icon: "🔢" },
  { id: "road",     label: "Signalisation / route",     icon: "⚠️" },
];

export default function AccidentAssistantScreen() {
  const [phase, setPhase]   = useState("start");
  const [photos, setPhotos] = useState({});
  const [uploading, setUploading] = useState({});

  const call = (n) => Linking.openURL(`tel:${n}`);

  const pickPhoto = async (id) => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert("Permission requise"); return; }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (res.canceled || !res.assets?.[0]) return;
    const uri = res.assets[0].uri;
    setUploading((p) => ({ ...p, [id]: true }));
    try {
      const urls = await uploadListingImages([{ uri, name: `accident_${id}.jpg`, type: "image/jpeg" }]);
      setPhotos((p) => ({ ...p, [id]: urls[0] || uri }));
    } catch {
      Alert.alert("Erreur", "Upload échoué. Continuez quand même.");
      setPhotos((p) => ({ ...p, [id]: uri }));
    } finally {
      setUploading((p) => ({ ...p, [id]: false }));
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={s.title}>🆘 Assistant accident</Text>
      <Text style={s.subtitle}>Suivez ces étapes immédiatement après un accident.</Text>

      {/* Phase: start */}
      {phase === "start" && (
        <View>
          <View style={s.sosBox}>
            <Text style={s.sosTitle}>1. Êtes-vous en sécurité ?</Text>
            <View style={s.sosRow}>
              {[{l:"Police",n:"19",i:"🚔"},{l:"SAMU",n:"15",i:"🚑"},{l:"Pompiers",n:"15",i:"🚒"}].map((c) => (
                <TouchableOpacity key={c.l} style={s.sosBtn} onPress={() => call(c.n)}>
                  <Text style={s.sosBtnIcon}>{c.i}</Text>
                  <Text style={s.sosBtnLabel}>{c.l}</Text>
                  <Text style={s.sosBtnNum}>{c.n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity style={s.nextBtn} onPress={() => setPhase("photos")}>
            <Text style={s.nextBtnText}>Je suis en sécurité → Documenter</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Phase: photos */}
      {phase === "photos" && (
        <View>
          <View style={s.infoBox}><Text style={s.infoText}>📸 Prenez des photos avant de déplacer les véhicules.</Text></View>
          {PHOTO_PROMPTS.map((p) => (
            <View key={p.id} style={s.photoCard}>
              <Text style={s.photoIcon}>{p.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.photoLabel}>{p.label}</Text>
                {photos[p.id]
                  ? <Text style={s.photoDone}>✓ Photo prise</Text>
                  : <TouchableOpacity onPress={() => pickPhoto(p.id)} style={s.photoBtn}>
                      <Text style={s.photoBtnText}>{uploading[p.id] ? "Envoi…" : "📷 Prendre photo"}</Text>
                    </TouchableOpacity>
                }
              </View>
            </View>
          ))}
          <TouchableOpacity style={s.nextBtn} onPress={() => setPhase("constat")}>
            <Text style={s.nextBtnText}>Photos prises → Constat amiable</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Phase: constat */}
      {phase === "constat" && (
        <View>
          <View style={s.card}>
            <Text style={s.cardTitle}>📋 Constat amiable</Text>
            {["Remplissez avec l'autre conducteur.", "Ne signez rien sous pression.", "Chacun conserve un exemplaire signé.", "En cas de désaccord, appelez la police."].map((t, i) => (
              <View key={i} style={s.bullet}><Text style={s.bulletDot}>✓</Text><Text style={s.bulletText}>{t}</Text></View>
            ))}
          </View>
          <TouchableOpacity style={s.nextBtn} onPress={() => setPhase("insurance")}>
            <Text style={s.nextBtnText}>Constat rempli → Assurance</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Phase: insurance */}
      {phase === "insurance" && (
        <View>
          <View style={s.card}>
            <Text style={s.cardTitle}>📞 Contacter votre assurance</Text>
            {["Appelez dans les 5 jours ouvrables.", "Transmettez le constat et les photos.", "Notez le numéro de sinistre.", "Si location: contactez le propriétaire via GooVoiture."].map((t, i) => (
              <View key={i} style={s.bullet}>
                <View style={s.stepNum}><Text style={s.stepNumText}>{i + 1}</Text></View>
                <Text style={s.bulletText}>{t}</Text>
              </View>
            ))}
          </View>
          <View style={[s.infoBox, { backgroundColor: "#d1fae5", borderColor: "#a7f3d0" }]}>
            <Text style={[s.infoText, { color: "#065f46" }]}>✅ Vous avez tout documenté ! Photos prises, constat rempli, assurance contactée.</Text>
          </View>
          <TouchableOpacity style={[s.nextBtn, { backgroundColor: "#6b7280" }]} onPress={() => { setPhase("start"); setPhotos({}); }}>
            <Text style={s.nextBtnText}>Recommencer</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: "#fff", padding: 20 },
  title:        { fontSize: 22, fontWeight: "700", color: "#dc2626", marginBottom: 4 },
  subtitle:     { fontSize: 13, color: "#6b7280", marginBottom: 20 },
  sosBox:       { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca", borderRadius: 16, padding: 16, marginBottom: 16 },
  sosTitle:     { fontSize: 15, fontWeight: "700", color: "#b91c1c", marginBottom: 12 },
  sosRow:       { flexDirection: "row", gap: 8 },
  sosBtn:       { flex: 1, backgroundColor: "#dc2626", borderRadius: 12, padding: 10, alignItems: "center" },
  sosBtnIcon:   { fontSize: 20, marginBottom: 2 },
  sosBtnLabel:  { color: "rgba(255,255,255,0.8)", fontSize: 10 },
  sosBtnNum:    { color: "#fff", fontSize: 18, fontWeight: "800" },
  nextBtn:      { backgroundColor: "#2563eb", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  nextBtnText:  { color: "#fff", fontWeight: "700", fontSize: 14 },
  infoBox:      { backgroundColor: "#eff6ff", borderWidth: 1, borderColor: "#bfdbfe", borderRadius: 12, padding: 12, marginBottom: 16 },
  infoText:     { fontSize: 13, color: "#1d4ed8", lineHeight: 18 },
  photoCard:    { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 14, padding: 14, marginBottom: 10, gap: 12 },
  photoIcon:    { fontSize: 24 },
  photoLabel:   { fontSize: 13, fontWeight: "500", color: "#111827" },
  photoDone:    { fontSize: 12, color: "#059669", marginTop: 4, fontWeight: "600" },
  photoBtn:     { marginTop: 4, backgroundColor: "#eff6ff", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  photoBtnText: { color: "#2563eb", fontSize: 12, fontWeight: "500" },
  card:         { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 16, padding: 16, marginBottom: 16 },
  cardTitle:    { fontSize: 15, fontWeight: "700", marginBottom: 12 },
  bullet:       { flexDirection: "row", gap: 8, marginBottom: 10 },
  bulletDot:    { color: "#059669", fontWeight: "700", width: 16 },
  bulletText:   { flex: 1, fontSize: 13, color: "#374151", lineHeight: 20 },
  stepNum:      { width: 20, height: 20, borderRadius: 10, backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  stepNumText:  { color: "#fff", fontSize: 10, fontWeight: "700" },
});
