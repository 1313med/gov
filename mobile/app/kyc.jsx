import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { api } from "../src/api/client";
import { uploadListingImages } from "../src/api/upload";
import { useTheme } from "../src/context/ThemeContext";
import { useAppLang } from "../src/context/AppLangContext";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function KycScreen() {
  const { colors: C } = useTheme();
  const { lang, pick } = useAppLang();
  const fr = lang === "fr";
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [kyc, setKyc] = useState(null);
  const [form, setForm] = useState({ cinNumber: "", cinImageUrl: "", permisNumber: "", permisExpiryDate: "", permisImageUrl: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);

  useEffect(() => {
    api.get("/kyc/me")
      .then(({ data }) => {
        setKyc(data);
        setForm({
          cinNumber:        data.nationalId?.number    || "",
          cinImageUrl:      data.nationalId?.imageUrl  || "",
          permisNumber:     data.driverLicense?.number || "",
          permisExpiryDate: data.driverLicense?.expiryDate ? new Date(data.driverLicense.expiryDate).toISOString().slice(0, 10) : "",
          permisImageUrl:   data.driverLicense?.imageUrl || "",
        });
      })
      .catch(() => {});
  }, []);

  const pickImage = async (field) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(pick("Permission required", "Permission requise"));
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", quality: 0.85 });
    if (res.canceled || !res.assets?.[0]) return;
    setUploading(field);
    try {
      const urls = await uploadListingImages([{ uri: res.assets[0].uri, name: "doc.jpg", type: "image/jpeg" }]);
      if (urls[0]) setForm((p) => ({ ...p, [field]: urls[0] }));
    } catch {
      Alert.alert("Error", pick("Upload failed.", "Échec de l'envoi."));
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.put("/kyc/me", form);
      Alert.alert(
        pick("Success", "Succès"),
        pick("Your documents have been submitted for review.", "Vos documents ont été soumis pour vérification.")
      );
    } catch (e) {
      Alert.alert(pick("Error", "Erreur"), e?.response?.data?.message || (pick("Submission failed. Try again.", "Envoi échoué. Réessayez.")));
    } finally {
      setSaving(false);
    }
  };

  const badge = (verified, submitted) =>
    verified   ? <Text style={[s.badge, s.badgeGreen]}>{pick("✓ Verified", "✓ Vérifié")}</Text>
    : submitted ? <Text style={[s.badge, s.badgeYellow]}>{pick("⏳ Pending", "⏳ En attente")}</Text>
               : <Text style={[s.badge, s.badgeGray]}>{pick("Not submitted", "Non soumis")}</Text>;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border, flexDirection: "row", alignItems: "center", gap: 12 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={C.white} />
        </TouchableOpacity>
        <View>
          <Text style={{ color: C.white, fontWeight: "800", fontSize: 16 }}>{pick("Identity Verification", "Vérification d'identité")}</Text>
          <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{pick("National ID & driving license", "CIN et permis de conduire")}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
        <Text style={{ color: C.muted, fontSize: 13, lineHeight: 20, marginBottom: 20 }}>
          {pick("Submit your national ID and driving license to rent and boost your trust profile.", "Soumettez votre CIN et permis pour louer et renforcer votre profil de confiance.")}
        </Text>

        {kyc && (
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
            <View style={[s.statusCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[s.statusLabel, { color: C.muted }]}>CIN</Text>
              {badge(kyc.nationalId?.verified, !!(kyc.nationalId?.number || kyc.nationalId?.imageUrl))}
            </View>
            <View style={[s.statusCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[s.statusLabel, { color: C.muted }]}>{pick("License", "Permis")}</Text>
              {badge(kyc.driverLicense?.verified, !!(kyc.driverLicense?.number || kyc.driverLicense?.imageUrl))}
            </View>
          </View>
        )}

        {/* CIN */}
        <View style={[s.section, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[s.sectionTitle, { color: C.white }]}>{pick("National ID (CIN)", "Carte Nationale (CIN)")}</Text>
          <TextInput style={[s.input, { color: C.white, borderColor: C.border, backgroundColor: C.inputBg }]}
            value={form.cinNumber} onChangeText={(v) => setForm((p) => ({ ...p, cinNumber: v }))}
            placeholder={pick("National ID number", "Numéro CIN")} placeholderTextColor={C.muted} />
          {form.cinImageUrl ? <Image source={{ uri: form.cinImageUrl }} style={s.preview} /> : null}
          <TouchableOpacity style={[s.uploadBtn, { backgroundColor: C.surface }]} onPress={() => pickImage("cinImageUrl")} disabled={!!uploading}>
            {uploading === "cinImageUrl" ? <ActivityIndicator color={C.primary} size="small" /> : <Text style={[s.uploadText, { color: C.primary }]}>{pick("📷 Photo of national ID", "📷 Photo de la CIN")}</Text>}
          </TouchableOpacity>
        </View>

        {/* Permis */}
        <View style={[s.section, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[s.sectionTitle, { color: C.white }]}>{pick("Driving License", "Permis de conduire")}</Text>
          <TextInput style={[s.input, { color: C.white, borderColor: C.border, backgroundColor: C.inputBg }]}
            value={form.permisNumber} onChangeText={(v) => setForm((p) => ({ ...p, permisNumber: v }))}
            placeholder={pick("License number", "Numéro du permis")} placeholderTextColor={C.muted} />
          <TextInput style={[s.input, { color: C.white, borderColor: C.border, backgroundColor: C.inputBg }]}
            value={form.permisExpiryDate} onChangeText={(v) => setForm((p) => ({ ...p, permisExpiryDate: v }))}
            placeholder={pick("Expiry date (YYYY-MM-DD)", "Expiration (AAAA-MM-JJ)")} placeholderTextColor={C.muted} />
          {form.permisImageUrl ? <Image source={{ uri: form.permisImageUrl }} style={s.preview} /> : null}
          <TouchableOpacity style={[s.uploadBtn, { backgroundColor: C.surface }]} onPress={() => pickImage("permisImageUrl")} disabled={!!uploading}>
            {uploading === "permisImageUrl" ? <ActivityIndicator color={C.primary} size="small" /> : <Text style={[s.uploadText, { color: C.primary }]}>{pick("📷 Photo of license", "📷 Photo du permis")}</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[s.btn, { backgroundColor: C.primary }, saving && { opacity: 0.6 }]} onPress={handleSubmit} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{pick("Submit for review", "Soumettre pour vérification")}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  statusCard:   { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12 },
  statusLabel:  { fontSize: 12, marginBottom: 4 },
  badge:        { fontSize: 11, fontWeight: "600", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: "flex-start" },
  badgeGreen:   { backgroundColor: "#d1fae5", color: "#065f46" },
  badgeYellow:  { backgroundColor: "#fef3c7", color: "#92400e" },
  badgeGray:    { backgroundColor: "rgba(148,163,184,0.15)", color: "#94a3b8" },
  section:      { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "600", marginBottom: 12 },
  input:        { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 10 },
  preview:      { width: "100%", height: 100, borderRadius: 10, marginBottom: 8 },
  uploadBtn:    { borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  uploadText:   { fontSize: 14, fontWeight: "600" },
  btn:          { borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 4 },
  btnText:      { color: "#fff", fontSize: 15, fontWeight: "700" },
});
