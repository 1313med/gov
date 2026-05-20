import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../src/api/client";
import { useTheme } from "../src/context/ThemeContext";
import { useAppLang } from "../src/context/AppLangContext";

export default function FuelTrackerScreen() {
  const { colors: C } = useTheme();
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [cars, setCars] = useState([]);
  const [car, setCar] = useState(null);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [coo, setCoo] = useState(null);
  const [tab, setTab] = useState("logs");
  const [form, setForm] = useState({ liters: "", pricePerLiter: "", kmAtFillup: "", fuelType: "essence" });
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.get("/user-car")
      .then(({ data }) => {
        const list = data?.cars || (Array.isArray(data) ? data : []);
        setCars(list);
        if (list.length) setCar(list[0]);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  useEffect(() => {
    if (!car) return;
    api.get(`/fuel-logs/${car._id}`)
      .then(({ data }) => { setLogs(data.logs || []); setStats(data.stats); })
      .catch(() => {});
    api.get(`/fuel-logs/${car._id}/cost-of-ownership`)
      .then(({ data }) => setCoo(data))
      .catch(() => {});
  }, [car?._id]);

  const handleAdd = async () => {
    if (!form.liters || !form.pricePerLiter || !form.kmAtFillup) {
      Alert.alert(fr ? "Erreur" : "Error", fr ? "Remplissez tous les champs." : "Fill all required fields.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/fuel-logs", { ...form, userCarId: car._id, date: new Date().toISOString() });
      const { data } = await api.get(`/fuel-logs/${car._id}`);
      setLogs(data.logs || []);
      setStats(data.stats);
      setForm({ liters: "", pricePerLiter: "", kmAtFillup: "", fuelType: "essence" });
      Alert.alert(fr ? "Succès" : "Saved", fr ? "Plein enregistré !" : "Fillup recorded!");
    } catch (e) {
      Alert.alert(fr ? "Erreur" : "Error", e?.response?.data?.message || (fr ? "Enregistrement échoué." : "Failed."));
    } finally {
      setSaving(false);
    }
  };

  if (fetching) return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={C.primary} size="large" />
    </View>
  );

  if (!cars.length) return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center", padding: 40 }}>
      <TouchableOpacity onPress={() => router.back()} style={{ position: "absolute", top: insets.top + 12, left: 16 }}>
        <Ionicons name="chevron-back" size={26} color={C.white} />
      </TouchableOpacity>
      <Text style={{ fontSize: 48, marginBottom: 12 }}>⛽</Text>
      <Text style={{ color: C.white, fontSize: 18, fontWeight: "700", marginBottom: 8 }}>{fr ? "Suivi de carburant" : "Fuel Tracker"}</Text>
      <Text style={{ color: C.muted, fontSize: 13, textAlign: "center" }}>{fr ? "Ajoutez une voiture dans Mon Garage pour commencer." : "Add a vehicle in My Garage to get started."}</Text>
    </View>
  );

  const totalCost = form.liters && form.pricePerLiter
    ? (parseFloat(form.liters) * parseFloat(form.pricePerLiter)).toFixed(2)
    : null;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border, flexDirection: "row", alignItems: "center", gap: 12 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={C.white} />
        </TouchableOpacity>
        <Text style={{ color: C.white, fontWeight: "800", fontSize: 16 }}>⛽ {fr ? "Suivi carburant" : "Fuel Tracker"}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}>
        {/* Car selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {cars.map((c) => (
            <TouchableOpacity key={c._id} onPress={() => setCar(c)} style={[s.carChip, { borderColor: C.border, backgroundColor: car?._id === c._id ? C.primary : C.card }]}>
              <Text style={[s.carChipText, { color: car?._id === c._id ? "#fff" : C.muted }]}>{c.brand} {c.model}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats */}
        {stats && (
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
            <View style={[s.stat, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[s.statVal, { color: "#60a5fa" }]}>{stats.avgConsumptionL100km}</Text>
              <Text style={[s.statLabel, { color: C.muted }]}>L/100km</Text>
            </View>
            <View style={[s.stat, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[s.statVal, { color: "#34d399" }]}>{stats.totalFuelSpentMad?.toLocaleString(fr ? "fr-FR" : "en-US")}</Text>
              <Text style={[s.statLabel, { color: C.muted }]}>{fr ? "MAD dépensés" : "MAD spent"}</Text>
            </View>
            <View style={[s.stat, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[s.statVal, { color: C.primary }]}>{stats.totalFillups}</Text>
              <Text style={[s.statLabel, { color: C.muted }]}>{fr ? "Pleins" : "Fillups"}</Text>
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          {[[fr ? "Historique" : "History", "logs"], [fr ? "+ Ajouter" : "+ Add", "add"], [fr ? "Coûts" : "Costs", "costs"]].map(([l, t]) => (
            <TouchableOpacity key={t} onPress={() => setTab(t)} style={[s.tabBtn, { borderColor: C.border, backgroundColor: tab === t ? C.primary : C.card }]}>
              <Text style={[s.tabTxt, { color: tab === t ? "#fff" : C.muted }]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === "add" && (
          <View style={[s.formBox, { backgroundColor: C.card, borderColor: C.border }]}>
            <TextInput style={[s.input, { color: C.white, borderColor: C.border, backgroundColor: C.inputBg }]}
              value={form.liters} onChangeText={(v) => setForm((p) => ({ ...p, liters: v }))}
              placeholder={fr ? "Litres (ex: 45.5)" : "Liters (e.g. 45.5)"} placeholderTextColor={C.muted} keyboardType="decimal-pad" />
            <TextInput style={[s.input, { color: C.white, borderColor: C.border, backgroundColor: C.inputBg }]}
              value={form.pricePerLiter} onChangeText={(v) => setForm((p) => ({ ...p, pricePerLiter: v }))}
              placeholder={fr ? "Prix/litre MAD (ex: 14.50)" : "Price/liter MAD"} placeholderTextColor={C.muted} keyboardType="decimal-pad" />
            <TextInput style={[s.input, { color: C.white, borderColor: C.border, backgroundColor: C.inputBg }]}
              value={form.kmAtFillup} onChangeText={(v) => setForm((p) => ({ ...p, kmAtFillup: v }))}
              placeholder={fr ? "Kilométrage actuel" : "Current mileage"} placeholderTextColor={C.muted} keyboardType="number-pad" />
            {totalCost && <View style={[s.totalBox, { backgroundColor: C.surface }]}><Text style={{ color: C.primary, fontWeight: "600", fontSize: 14 }}>{fr ? `Total : ${totalCost} MAD` : `Total: ${totalCost} MAD`}</Text></View>}
            <TouchableOpacity style={[s.btn, { backgroundColor: C.primary }, saving && { opacity: 0.6 }]} onPress={handleAdd} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{fr ? "Enregistrer le plein" : "Save fillup"}</Text>}
            </TouchableOpacity>
          </View>
        )}

        {tab === "logs" && (
          <View>
            {!logs.length && <Text style={{ color: C.muted, textAlign: "center", marginVertical: 20 }}>{fr ? "Aucun plein. Ajoutez votre premier !" : "No fillups yet. Add your first!"}</Text>}
            {logs.map((log) => (
              <View key={log._id} style={[s.logCard, { backgroundColor: C.card, borderColor: C.border }]}>
                <Text style={{ color: C.white, fontSize: 14, fontWeight: "600" }}>{log.liters}L — {log.totalCost?.toFixed(2)} MAD</Text>
                <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{new Date(log.date).toLocaleDateString(fr ? "fr-FR" : "en-GB")} · {log.kmAtFillup?.toLocaleString(fr ? "fr-FR" : "en-US")} km · {log.pricePerLiter} MAD/L</Text>
              </View>
            ))}
          </View>
        )}

        {tab === "costs" && coo && (
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={[s.cooCard, { backgroundColor: C.card, borderColor: C.border, flex: 1 }]}>
                <Text style={{ color: C.muted, fontSize: 12 }}>{fr ? "Carburant" : "Fuel"}</Text>
                <Text style={{ color: "#60a5fa", fontWeight: "700", fontSize: 18, marginTop: 4 }}>{coo.totals.fuel.toLocaleString(fr ? "fr-FR" : "en-US")} MAD</Text>
              </View>
              <View style={[s.cooCard, { backgroundColor: C.card, borderColor: C.border, flex: 1 }]}>
                <Text style={{ color: C.muted, fontSize: 12 }}>{fr ? "Entretien" : "Maintenance"}</Text>
                <Text style={{ color: "#fb923c", fontWeight: "700", fontSize: 18, marginTop: 4 }}>{coo.totals.maintenance.toLocaleString(fr ? "fr-FR" : "en-US")} MAD</Text>
              </View>
            </View>
            <View style={[s.cooCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={{ color: C.muted, fontSize: 12 }}>{fr ? "Coût mensuel moyen" : "Monthly average cost"}</Text>
              <Text style={{ color: C.primary, fontWeight: "700", fontSize: 24, marginTop: 4 }}>{coo.totals.monthlyAvg.toLocaleString(fr ? "fr-FR" : "en-US")} MAD/mois</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  carChip:     { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8 },
  carChipText: { fontSize: 13 },
  stat:        { flex: 1, borderWidth: 1, borderRadius: 14, padding: 12, alignItems: "center" },
  statVal:     { fontSize: 20, fontWeight: "700" },
  statLabel:   { fontSize: 10, marginTop: 2 },
  tabBtn:      { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  tabTxt:      { fontSize: 13, fontWeight: "600" },
  formBox:     { borderWidth: 1, borderRadius: 16, padding: 16 },
  input:       { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 10 },
  totalBox:    { borderRadius: 10, padding: 10, marginBottom: 10, alignItems: "center" },
  btn:         { borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  btnText:     { color: "#fff", fontWeight: "700", fontSize: 14 },
  logCard:     { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8 },
  cooCard:     { borderWidth: 1, borderRadius: 14, padding: 14 },
});
