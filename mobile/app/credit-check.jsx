import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../src/api/client";
import { useTheme } from "../src/context/ThemeContext";
import { useAppLang } from "../src/context/AppLangContext";

const STATUS_FR = {
  pending:      { label: "En attente",               color: "#92400e", bg: "rgba(253,230,138,0.25)", icon: "⏳" },
  clear:        { label: "Aucune charge bancaire",   color: "#065f46", bg: "rgba(167,243,208,0.25)", icon: "✅" },
  flagged:      { label: "Charge bancaire détectée", color: "#991b1b", bg: "rgba(254,202,202,0.25)", icon: "⚠️" },
  unverifiable: { label: "Non vérifiable",           color: "#94a3b8", bg: "rgba(148,163,184,0.1)",  icon: "❓" },
};
const STATUS_EN = {
  pending:      { label: "Pending",                  color: "#92400e", bg: "rgba(253,230,138,0.25)", icon: "⏳" },
  clear:        { label: "No bank charge",           color: "#065f46", bg: "rgba(167,243,208,0.25)", icon: "✅" },
  flagged:      { label: "Bank charge detected",     color: "#991b1b", bg: "rgba(254,202,202,0.25)", icon: "⚠️" },
  unverifiable: { label: "Unverifiable",             color: "#94a3b8", bg: "rgba(148,163,184,0.1)",  icon: "❓" },
};

export default function CreditCheckScreen() {
  const { colors: C } = useTheme();
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const STATUS = fr ? STATUS_FR : STATUS_EN;

  const [checks, setChecks] = useState([]);
  const [form, setForm] = useState({ immatriculation: "", ownerCin: "", brand: "", model: "", year: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get("/credit-check/my")
      .then(({ data }) => setChecks(Array.isArray(data) ? data : []))
      .catch(() => {});
  };
  useEffect(load, []);

  const handleSubmit = async () => {
    if (!form.immatriculation && !form.ownerCin) {
      Alert.alert(fr ? "Erreur" : "Error", fr ? "Entrez l'immatriculation ou le CIN du vendeur." : "Enter the plate or seller's national ID.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/credit-check", form);
      Alert.alert(fr ? "Envoyé !" : "Sent!", fr ? "Vous serez notifié dans 48h." : "You'll be notified within 48h.");
      setForm({ immatriculation: "", ownerCin: "", brand: "", model: "", year: "" });
      load();
    } catch (e) {
      Alert.alert(fr ? "Erreur" : "Error", e?.response?.data?.message || (fr ? "Erreur réseau" : "Network error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border, flexDirection: "row", alignItems: "center", gap: 12 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={C.white} />
        </TouchableOpacity>
        <Text style={{ color: C.white, fontWeight: "800", fontSize: 16 }}>{fr ? "Vérification de crédit" : "Credit Check"}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
        <Text style={{ color: C.muted, fontSize: 13, marginBottom: 16, lineHeight: 20 }}>
          {fr ? "Vérifiez si la voiture a une charge bancaire avant d'acheter." : "Check if the car has a bank charge before buying."}
        </Text>

        <View style={[s.warning, { backgroundColor: "rgba(245,158,11,0.1)", borderColor: "rgba(245,158,11,0.35)" }]}>
          <Text style={[s.warningText, { color: "#fbbf24" }]}>
            {fr
              ? "⚠️ Au Maroc, des voitures sont vendues sous crédit bancaire. La banque peut récupérer le véhicule même si vous l'avez acheté."
              : "⚠️ In Morocco, cars are sometimes sold with outstanding bank loans. The bank can repossess the car even after you buy it."}
          </Text>
        </View>

        <View style={[s.formBox, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[s.formTitle, { color: C.white }]}>{fr ? "Nouvelle vérification" : "New check"}</Text>
          <TextInput style={[s.input, { color: C.white, borderColor: C.border, backgroundColor: C.inputBg }]}
            value={form.immatriculation} onChangeText={(v) => setForm((p) => ({ ...p, immatriculation: v }))}
            placeholder={fr ? "Immatriculation (Ex: 12345-A-1)" : "Plate number"} placeholderTextColor={C.muted} />
          <TextInput style={[s.input, { color: C.white, borderColor: C.border, backgroundColor: C.inputBg }]}
            value={form.ownerCin} onChangeText={(v) => setForm((p) => ({ ...p, ownerCin: v }))}
            placeholder={fr ? "CIN du vendeur (optionnel)" : "Seller's national ID (optional)"} placeholderTextColor={C.muted} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput style={[s.input, { flex: 1, color: C.white, borderColor: C.border, backgroundColor: C.inputBg }]}
              value={form.brand} onChangeText={(v) => setForm((p) => ({ ...p, brand: v }))}
              placeholder={fr ? "Marque" : "Brand"} placeholderTextColor={C.muted} />
            <TextInput style={[s.input, { flex: 1, color: C.white, borderColor: C.border, backgroundColor: C.inputBg }]}
              value={form.model} onChangeText={(v) => setForm((p) => ({ ...p, model: v }))}
              placeholder={fr ? "Modèle" : "Model"} placeholderTextColor={C.muted} />
          </View>
          <TextInput style={[s.input, { color: C.white, borderColor: C.border, backgroundColor: C.inputBg }]}
            value={form.year} onChangeText={(v) => setForm((p) => ({ ...p, year: v }))}
            placeholder={fr ? "Année" : "Year"} placeholderTextColor={C.muted} keyboardType="numeric" />
          <TouchableOpacity style={[s.btn, { backgroundColor: C.primary }, saving && { opacity: 0.6 }]} onPress={handleSubmit} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{fr ? "Demander une vérification (gratuit)" : "Request a check (free)"}</Text>}
          </TouchableOpacity>
        </View>

        {checks.length > 0 && (
          <View>
            <Text style={[s.histTitle, { color: C.white }]}>{fr ? "Mes vérifications" : "My checks"}</Text>
            {checks.map((c) => {
              const st = STATUS[c.status] || STATUS.pending;
              return (
                <View key={c._id} style={[s.checkCard, { backgroundColor: st.bg, borderColor: C.border, borderWidth: 1 }]}>
                  <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.checkTitle, { color: st.color }]}>{c.brand} {c.model} {c.year || ""}</Text>
                      <Text style={[s.checkSub, { color: st.color }]}>{c.immatriculation || c.ownerCin || "—"} · {new Date(c.createdAt).toLocaleDateString(fr ? "fr-FR" : "en-GB")}</Text>
                      {c.adminNote ? <Text style={[s.checkNote, { color: st.color }]}>{c.adminNote}</Text> : null}
                    </View>
                    <View style={{ alignItems: "center" }}>
                      <Text style={{ fontSize: 22 }}>{st.icon}</Text>
                      <Text style={[s.statusLabel, { color: st.color }]}>{st.label}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  warning:    { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 20 },
  warningText:{ fontSize: 12, lineHeight: 18 },
  formBox:    { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 20 },
  formTitle:  { fontSize: 15, fontWeight: "600", marginBottom: 12 },
  input:      { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 10 },
  btn:        { borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 4 },
  btnText:    { color: "#fff", fontWeight: "700", fontSize: 14 },
  histTitle:  { fontSize: 15, fontWeight: "700", marginBottom: 10 },
  checkCard:  { borderRadius: 14, padding: 14, marginBottom: 10 },
  checkTitle: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  checkSub:   { fontSize: 11, opacity: 0.7 },
  checkNote:  { fontSize: 12, marginTop: 6, fontStyle: "italic" },
  statusLabel:{ fontSize: 10, fontWeight: "600", marginTop: 2, textAlign: "center", maxWidth: 70 },
});
