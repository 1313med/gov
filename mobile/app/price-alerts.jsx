import { useState, useCallback, useEffect } from "react";
import { PageLoader } from '../src/components/AppLoadingScreen';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator, Modal, Alert, Platform, StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../src/context/ThemeContext";
import { useAppLang } from "../src/context/AppLangContext";
import { getMyAlerts, createAlert, deleteAlert, toggleAlert } from "../src/api/price";

const FUEL_OPTIONS = ["Essence", "Diesel", "Hybride", "Électrique", "GPL"];
const CURRENT_YEAR = new Date().getFullYear();

export default function PriceAlertsScreen() {
  const { colors: C, isDark } = useTheme();
  const { lang, pick, dateLocale } = useAppLang();
  const fr = lang === "fr";
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [alerts, setAlerts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({ brand: "", model: "", maxPrice: "", minYear: "", fuelType: "", city: "" });

  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor   = isDark ? "#94a3b8" : "#475569";
  const cardBg     = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.95)";
  const cardBorder = isDark ? "rgba(124,107,255,0.22)" : "rgba(98,72,232,0.14)";
  const inputBg    = isDark ? "rgba(255,255,255,0.07)" : "#f8fafc";
  const inputBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.12)";

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyAlerts();
      setAlerts(res.data);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = useCallback(async () => {
    if (!form.brand.trim() || !form.maxPrice.trim()) {
      Alert.alert(pick("Required", "Champs requis"), pick("Brand and max price are required.", "La marque et le prix max sont obligatoires."));
      return;
    }
    setSaving(true);
    try {
      const res = await createAlert({
        brand:    form.brand.trim(),
        model:    form.model.trim() || undefined,
        maxPrice: Number(form.maxPrice),
        minYear:  form.minYear ? Number(form.minYear) : undefined,
        fuelType: form.fuelType || undefined,
        city:     form.city.trim() || undefined,
      });
      setAlerts(prev => [res.data, ...prev]);
      setModal(false);
      setForm({ brand: "", model: "", maxPrice: "", minYear: "", fuelType: "", city: "" });
    } catch (e) {
      Alert.alert("Erreur", e?.response?.data?.message || "Impossible de créer l'alerte");
    } finally {
      setSaving(false);
    }
  }, [form, fr]);

  const handleDelete = useCallback((id) => {
    Alert.alert(
      pick("Delete alert?", "Supprimer l'alerte ?"),
      pick("You won't be notified for this criterion anymore.", "Vous ne serez plus notifié pour ce critère."),
      [
        { text: pick("Cancel", "Annuler"), style: "cancel" },
        {
          text: pick("Delete", "Supprimer"), style: "destructive",
          onPress: async () => {
            try {
              await deleteAlert(id);
              setAlerts(prev => prev.filter(a => a._id !== id));
            } catch { Alert.alert("Erreur", "Impossible de supprimer"); }
          },
        },
      ]
    );
  }, [fr]);

  const handleToggle = useCallback(async (id) => {
    try {
      const res = await toggleAlert(id);
      setAlerts(prev => prev.map(a => a._id === id ? res.data : a));
    } catch { Alert.alert("Erreur", "Impossible de modifier"); }
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg ?? (isDark ? "#05060f" : "#f8fafc") }}>
      {/* Header */}
      <LinearGradient
        colors={isDark ? ["#03040a", "#120a24", "#05060f"] : ["#faf5ff", "#e0f2fe", "#f8fafc"]}
        style={{ paddingTop: insets.top + 8, paddingBottom: 20, paddingHorizontal: 22 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}
              style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: "center", justifyContent: "center", borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.7)" }}
            >
              <Ionicons name="arrow-back" size={20} color={titleColor} />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase", color: C.primary, marginBottom: 2 }}>
                {pick("Notifications", "Notifications")}
              </Text>
              <Text style={{ fontSize: 20, fontWeight: "800", color: titleColor, letterSpacing: -0.4 }}>
                {pick("Price alerts", "Alertes prix")}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setModal(true)} activeOpacity={0.85}
            style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: C.primary }}
          >
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 13 }}>+ {pick("Create", "Créer")}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? <PageLoader /> : alerts.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <LinearGradient colors={[`${C.primary}20`, `${C.primary}06`]} style={{ width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Ionicons name="notifications-outline" size={36} color={C.primary} />
          </LinearGradient>
          <Text style={{ fontSize: 20, fontWeight: "800", color: titleColor, textAlign: "center", marginBottom: 10 }}>
            {pick("No alerts yet", "Aucune alerte")}
          </Text>
          <Text style={{ fontSize: 14, color: subColor, textAlign: "center", lineHeight: 22, marginBottom: 28 }}>
            {pick("Create an alert to be notified when a listing matches your budget.", "Créez une alerte pour être notifié dès qu'une annonce correspond à votre budget.")}
          </Text>
          <TouchableOpacity onPress={() => setModal(true)} activeOpacity={0.85} style={{ width: "100%" }}>
            <LinearGradient colors={["#6248e8", "#4f46e5", "#4338ca"]} style={{ borderRadius: 16, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 10 }}>
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
                {pick("Create alert", "Créer une alerte")}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 20, paddingBottom: insets.bottom + 40 }}
        >
          <Text style={{ fontSize: 12, color: subColor, marginBottom: 16 }}>
            {pick(`${alerts.length} alert(s) · Notified daily`, `${alerts.length} alerte(s) · Notifié(e) quotidiennement`)}
          </Text>
          {alerts.map((a) => (
            <View key={a._id} style={[s.card, { backgroundColor: cardBg, borderColor: a.active ? cardBorder : (isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"), marginBottom: 12, opacity: a.active ? 1 : 0.55 }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <LinearGradient colors={a.active ? ["#6248e8", "#4338ca"] : ["#475569", "#334155"]} style={{ width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="notifications" size={18} color="#fff" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "800", color: titleColor }}>
                    {a.brand}{a.model ? ` ${a.model}` : ""}
                  </Text>
                  <Text style={{ fontSize: 13, color: "#22c55e", fontWeight: "700" }}>
                    ≤ {a.maxPrice.toLocaleString()} MAD
                  </Text>
                  <Text style={{ fontSize: 12, color: subColor, marginTop: 2 }}>
                    {[a.minYear ? `Depuis ${a.minYear}` : "", a.fuelType, a.city].filter(Boolean).join(" · ") || (pick("All criteria", "Tous critères"))}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  <TouchableOpacity onPress={() => handleToggle(a._id)} activeOpacity={0.8}
                    style={{ width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: a.active ? "rgba(34,197,94,0.12)" : "rgba(100,116,139,0.12)" }}
                  >
                    <Ionicons name={a.active ? "pause" : "play"} size={15} color={a.active ? "#22c55e" : subColor} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(a._id)} activeOpacity={0.8}
                    style={{ width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(239,68,68,0.1)" }}
                  >
                    <Ionicons name="trash-outline" size={15} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
              {a.lastNotifiedAt && (
                <Text style={{ fontSize: 11, color: subColor, marginTop: 10, marginLeft: 54 }}>
                  {pick("Last notified: ", "Dernière alerte : ")}
                  {new Date(a.lastNotifiedAt).toLocaleDateString(dateLocale)}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Create alert modal */}
      <Modal visible={modal} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: isDark ? "#0f172a" : "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: insets.bottom + 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: titleColor }}>
                {pick("New alert", "Nouvelle alerte")}
              </Text>
              <TouchableOpacity onPress={() => setModal(false)}>
                <Ionicons name="close" size={24} color={subColor} />
              </TouchableOpacity>
            </View>

            {[
              { key: "brand",    label: pick("Brand *", "Marque *"),        ph: "Toyota, Dacia…" },
              { key: "model",    label: pick("Model", "Modèle"),            ph: pick("Optional", "Optionnel") },
              { key: "maxPrice", label: pick("Max price (MAD) *", "Prix max (MAD) *"), ph: "150000", keyboard: "numeric" },
              { key: "minYear",  label: pick("Min year", "Année min"),      ph: String(CURRENT_YEAR - 5), keyboard: "numeric" },
              { key: "city",     label: pick("City", "Ville"),              ph: pick("Casablanca…", "Casablanca…") },
            ].map(({ key, label, ph, keyboard }) => (
              <View key={key} style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: subColor, marginBottom: 6 }}>{label}</Text>
                <TextInput
                  value={form[key]}
                  onChangeText={(v) => set(key, v)}
                  placeholder={ph}
                  placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                  keyboardType={keyboard || "default"}
                  style={[s.input, { backgroundColor: inputBg, borderColor: inputBorder, color: titleColor }]}
                />
              </View>
            ))}

            <Text style={{ fontSize: 12, fontWeight: "700", color: subColor, marginBottom: 8 }}>
              {pick("Fuel type", "Carburant")}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {FUEL_OPTIONS.map((f) => {
                const active = form.fuelType === f;
                return (
                  <TouchableOpacity key={f} onPress={() => set("fuelType", active ? "" : f)} activeOpacity={0.8}
                    style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: active ? C.primary : (isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.12)"), backgroundColor: active ? `${C.primary}18` : "transparent" }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "700", color: active ? C.primary : subColor }}>{f}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity onPress={handleCreate} activeOpacity={0.85} disabled={saving}>
              <LinearGradient colors={["#6248e8", "#4f46e5", "#4338ca"]} style={{ borderRadius: 16, paddingVertical: 15, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}>
                {saving ? <ActivityIndicator color="#fff" />
                  : <>
                      <Ionicons name="notifications-outline" size={18} color="#fff" />
                      <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
                        {pick("Create alert", "Créer l'alerte")}
                      </Text>
                    </>
                }
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 18, padding: 16, borderWidth: 1, ...(Platform.OS === "ios" ? { borderCurve: "continuous" } : {}) },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, fontWeight: "600" },
});
