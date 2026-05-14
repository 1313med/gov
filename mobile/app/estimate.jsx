import { useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator, StyleSheet, Platform, Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../src/context/ThemeContext";
import { useAppLang } from "../src/context/AppLangContext";
import { estimatePrice, createAlert } from "../src/api/price";

const FUEL_OPTIONS    = ["Essence", "Diesel", "Hybride", "Électrique", "GPL"];
const GEARBOX_OPTIONS = ["Manuelle", "Automatique"];

export default function EstimateScreen() {
  const { colors: C, isDark } = useTheme();
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const [form, setForm] = useState({
    brand:   params.brand   || "",
    model:   params.model   || "",
    year:    params.year    || "",
    mileage: params.mileage || "",
    fuel:    params.fuel    || "",
    gearbox: params.gearbox || "",
  });
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [alertSaving, setAlertSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor   = isDark ? "#94a3b8" : "#475569";
  const cardBg     = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.95)";
  const cardBorder = isDark ? "rgba(124,107,255,0.22)" : "rgba(98,72,232,0.14)";
  const inputBg    = isDark ? "rgba(255,255,255,0.07)" : "#f8fafc";
  const inputBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.12)";
  const primaryGrad = ["#6248e8", "#4f46e5", "#4338ca"];

  const handleEstimate = useCallback(async () => {
    if (!form.brand.trim() || !form.year.trim()) {
      Alert.alert(fr ? "Champs requis" : "Required", fr ? "La marque et l'année sont obligatoires." : "Brand and year are required.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await estimatePrice(form);
      setResult(res.data);
    } catch (e) {
      Alert.alert("Erreur", e?.response?.data?.message || "Impossible d'estimer");
    } finally {
      setLoading(false);
    }
  }, [form, fr]);

  const handleCreateAlert = useCallback(async () => {
    if (!result) return;
    setAlertSaving(true);
    try {
      await createAlert({
        brand:    form.brand,
        model:    form.model || undefined,
        maxPrice: result.mid,
        fuelType: form.fuel || undefined,
      });
      Alert.alert(
        fr ? "Alerte créée ✓" : "Alert created ✓",
        fr ? `Vous serez notifié dès qu'un ${form.brand} ${form.model || ""} passe sous ${result.mid.toLocaleString()} MAD.`
           : `You'll be notified when a ${form.brand} ${form.model || ""} drops below ${result.mid.toLocaleString()} MAD.`
      );
    } catch (e) {
      Alert.alert("Erreur", e?.response?.data?.message || "Impossible de créer l'alerte");
    } finally {
      setAlertSaving(false);
    }
  }, [result, form, fr]);

  const tierColors = { economy: "#22c55e", mid: "#38bdf8", premium: "#a78bfa", luxury: "#f59e0b" };
  const tierLabels = { economy: "Économique", mid: "Intermédiaire", premium: "Premium", luxury: "Luxe" };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg ?? (isDark ? "#05060f" : "#f8fafc") }}>
      {/* Header */}
      <LinearGradient
        colors={isDark ? ["#03040a", "#120a24", "#05060f"] : ["#faf5ff", "#e0f2fe", "#f8fafc"]}
        style={{ paddingTop: insets.top + 8, paddingBottom: 20, paddingHorizontal: 22 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}
            style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: "center", justifyContent: "center", borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.7)" }}
          >
            <Ionicons name="arrow-back" size={20} color={titleColor} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase", color: C.primary, marginBottom: 2 }}>
              {fr ? "Outil gratuit" : "Free tool"}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: titleColor, letterSpacing: -0.4 }}>
              {fr ? "Estimation de prix" : "Price estimator"}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 20, paddingBottom: insets.bottom + 40 }}
      >
        {/* Form card */}
        <View style={[s.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={{ fontSize: 13, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase", color: isDark ? "#94a3b8" : "#64748b", marginBottom: 14 }}>
            {fr ? "Votre voiture" : "Your car"}
          </Text>

          {[
            { key: "brand",   label: fr ? "Marque *" : "Brand *",       ph: "Toyota, Dacia, BMW…" },
            { key: "model",   label: fr ? "Modèle" : "Model",           ph: "Corolla, Logan, Série 3…" },
            { key: "year",    label: fr ? "Année *" : "Year *",         ph: "2018", keyboard: "numeric" },
            { key: "mileage", label: fr ? "Kilométrage" : "Mileage (km)", ph: "85000", keyboard: "numeric" },
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

          {/* Fuel selector */}
          <Text style={{ fontSize: 12, fontWeight: "700", color: subColor, marginBottom: 8 }}>
            {fr ? "Carburant" : "Fuel type"}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {FUEL_OPTIONS.map((f) => {
              const active = form.fuel === f;
              return (
                <TouchableOpacity key={f} onPress={() => set("fuel", active ? "" : f)} activeOpacity={0.8}
                  style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: active ? C.primary : (isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.12)"), backgroundColor: active ? `${C.primary}18` : "transparent" }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "700", color: active ? C.primary : subColor }}>{f}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Gearbox selector */}
          <Text style={{ fontSize: 12, fontWeight: "700", color: subColor, marginBottom: 8 }}>
            {fr ? "Boîte de vitesses" : "Gearbox"}
          </Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 4 }}>
            {GEARBOX_OPTIONS.map((g) => {
              const active = form.gearbox === g;
              return (
                <TouchableOpacity key={g} onPress={() => set("gearbox", active ? "" : g)} activeOpacity={0.8}
                  style={{ flex: 1, paddingVertical: 10, borderRadius: 14, borderWidth: 1.5, alignItems: "center", borderColor: active ? C.primary : (isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.12)"), backgroundColor: active ? `${C.primary}18` : "transparent" }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "700", color: active ? C.primary : subColor }}>{g}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity onPress={handleEstimate} activeOpacity={0.85} disabled={loading} style={{ marginTop: 16 }}>
          <LinearGradient colors={primaryGrad} style={{ borderRadius: 16, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 10 }}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Ionicons name="calculator-outline" size={20} color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
                    {fr ? "Estimer la valeur" : "Estimate value"}
                  </Text>
                </>
            }
          </LinearGradient>
        </TouchableOpacity>

        {/* Results */}
        {result && (
          <View style={{ marginTop: 24 }}>
            {/* Price range */}
            <View style={[s.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: `${tierColors[result.tier] || "#7c6bff"}20` }}>
                    <Text style={{ fontSize: 11, fontWeight: "800", color: tierColors[result.tier] || "#7c6bff" }}>
                      {tierLabels[result.tier] || result.tier}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: subColor }}>{result.age} an{result.age !== 1 ? "s" : ""}</Text>
                </View>
                <Text style={{ fontSize: 13, color: subColor, marginBottom: 4 }}>{fr ? "Fourchette estimée" : "Estimated range"}</Text>
                <Text style={{ fontSize: 32, fontWeight: "900", color: titleColor, letterSpacing: -1 }}>
                  {result.mid.toLocaleString()} <Text style={{ fontSize: 18 }}>MAD</Text>
                </Text>
                <Text style={{ fontSize: 13, color: subColor, marginTop: 4 }}>
                  {result.low.toLocaleString()} – {result.high.toLocaleString()} MAD
                </Text>
              </View>

              {/* Range bar */}
              <View style={{ height: 8, borderRadius: 4, backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)", marginBottom: 8, overflow: "hidden" }}>
                <LinearGradient colors={["#22c55e", "#eab308", "#ef4444"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1, borderRadius: 4 }} />
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 11, color: "#22c55e", fontWeight: "700" }}>{fr ? "Bas" : "Low"}</Text>
                <Text style={{ fontSize: 11, color: subColor, fontWeight: "700" }}>{fr ? "Moyen" : "Mid"}</Text>
                <Text style={{ fontSize: 11, color: "#ef4444", fontWeight: "700" }}>{fr ? "Haut" : "High"}</Text>
              </View>
            </View>

            {/* Breakdown */}
            <View style={[s.card, { backgroundColor: cardBg, borderColor: cardBorder, marginTop: 12 }]}>
              <Text style={{ fontSize: 13, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase", color: isDark ? "#94a3b8" : "#64748b", marginBottom: 14 }}>
                {fr ? "Détail du calcul" : "Calculation breakdown"}
              </Text>
              {result.breakdown.map((item, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", paddingVertical: 12, borderBottomWidth: i < result.breakdown.length - 1 ? 1 : 0, borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)" }}>
                  <Ionicons
                    name={item.positive === null ? "information-circle-outline" : item.positive ? "arrow-up-circle-outline" : "arrow-down-circle-outline"}
                    size={18}
                    color={item.positive === null ? subColor : item.positive ? "#22c55e" : "#f97316"}
                    style={{ marginRight: 10, marginTop: 1 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: titleColor }}>{item.label}</Text>
                    <Text style={{ fontSize: 12, color: subColor, marginTop: 2, lineHeight: 18 }}>{item.note}</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: "800", color: item.positive === null ? subColor : item.positive ? "#22c55e" : "#f97316", marginLeft: 10 }}>
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>

            {/* Disclaimer */}
            <View style={{ marginTop: 10, paddingHorizontal: 4 }}>
              <Text style={{ fontSize: 11, color: isDark ? "#475569" : "#94a3b8", textAlign: "center", lineHeight: 16 }}>
                {fr
                  ? "Estimation basée sur les prix du marché marocain. La valeur réelle dépend de l'état général, des options et de la négociation."
                  : "Estimate based on the Moroccan market. Actual value depends on condition, options and negotiation."}
              </Text>
            </View>

            {/* Actions */}
            <TouchableOpacity onPress={handleCreateAlert} activeOpacity={0.85} disabled={alertSaving} style={{ marginTop: 20 }}>
              <LinearGradient colors={["#7c6bff", "#6248e8"]} style={{ borderRadius: 16, paddingVertical: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}>
                {alertSaving ? <ActivityIndicator color="#fff" />
                  : <>
                      <Ionicons name="notifications-outline" size={18} color="#fff" />
                      <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>
                        {fr ? "Créer une alerte à ce prix" : "Create alert at this price"}
                      </Text>
                    </>
                }
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push({ pathname: "/new-sale", params: { brand: form.brand, model: form.model, year: form.year, mileage: form.mileage, fuel: form.fuel, gearbox: form.gearbox } })}
              activeOpacity={0.85} style={{ marginTop: 10 }}
            >
              <View style={{ borderRadius: 16, paddingVertical: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, borderWidth: 1.5, borderColor: isDark ? "rgba(124,107,255,0.4)" : "rgba(98,72,232,0.3)", backgroundColor: isDark ? "rgba(124,107,255,0.08)" : "rgba(98,72,232,0.05)" }}>
                <Ionicons name="pricetag-outline" size={18} color={C.primary} />
                <Text style={{ color: C.primary, fontWeight: "800", fontSize: 15 }}>
                  {fr ? "Vendre ma voiture" : "Sell my car"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 20, padding: 18, borderWidth: 1,
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" } : {}),
    marginBottom: 0,
  },
  input: {
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, fontWeight: "600",
  },
});
