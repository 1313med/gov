import { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../src/context/ThemeContext";
import { useAppLang } from "../src/context/AppLangContext";
import { getMyCar, updateCar } from "../src/api/userCar";
import { PageLoader } from "../src/components/AppLoadingScreen";
import {
  getGarageItemConfig,
  isValidGarageItemId,
  loadGarageItemForm,
  buildGarageItemPayload,
} from "../src/utils/garageItemEdit";
import { syncGarageLocalReminders } from "../src/utils/garageLocalReminders";

function FieldLabel({ text, isDark }) {
  return (
    <Text style={[st.label, { color: isDark ? "#64748b" : "#94a3b8" }]}>{text}</Text>
  );
}

function DateField({ label, value, onChange, isDark, fr }) {
  const [show, setShow] = useState(false);
  const formatted = value
    ? new Date(value).toLocaleDateString(fr ? "fr-FR" : "en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : fr
      ? "Appuyez pour choisir"
      : "Tap to choose";

  return (
    <View>
      <FieldLabel text={label} isDark={isDark} />
      <TouchableOpacity
        onPress={() => setShow(true)}
        activeOpacity={0.75}
        style={[st.inputBtn, { borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)", backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff" }]}
      >
        <Text style={{ fontSize: 14, fontWeight: "600", color: value ? (isDark ? "#f1f5f9" : "#0f172a") : isDark ? "#475569" : "#94a3b8" }}>
          {formatted}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={isDark ? "#475569" : "#94a3b8"} />
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, d) => {
            setShow(Platform.OS === "ios");
            if (d) onChange(d.toISOString());
          }}
        />
      )}
    </View>
  );
}

export default function EditGarageItemScreen() {
  const { field: fieldParam } = useLocalSearchParams();
  const field = Array.isArray(fieldParam) ? fieldParam[0] : fieldParam;
  const { colors: C, isDark } = useTheme();
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const cfg = useMemo(() => (isValidGarageItemId(field) ? getGarageItemConfig(field) : null), [field]);

  const [car, setCar] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#94a3b8" : "#475569";
  const bgColor = C.bg ?? (isDark ? "#05060f" : "#f8fafc");
  const accent = cfg?.color ?? (isDark ? "#38bdf8" : "#0284c7");

  useEffect(() => {
    if (!cfg) {
      setLoading(false);
      return;
    }
    getMyCar()
      .then(({ data }) => {
        if (!data) {
          setCar(null);
          return;
        }
        setCar(data);
        setForm(loadGarageItemForm(data, field));
      })
      .catch(() => setCar(null))
      .finally(() => setLoading(false));
  }, [cfg, field]);

  const setField = useCallback((formKey, value) => {
    setForm((p) => ({ ...p, [formKey]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!car?._id || !cfg) return;
    const payload = buildGarageItemPayload(field, form);
    if (!payload) return;
    setSaving(true);
    try {
      const res = await updateCar(car._id, payload);
      const updated = res.data;
      const on = updated.garageSettings?.remindersEnabled !== false;
      syncGarageLocalReminders(updated, fr, on).catch(() => {});
      router.back();
    } catch (e) {
      Alert.alert(fr ? "Erreur" : "Error", e?.response?.data?.message || (fr ? "Impossible d'enregistrer." : "Could not save."));
    } finally {
      setSaving(false);
    }
  }, [car, cfg, field, form, fr, router]);

  const inputStyle = useMemo(
    () => ({
      paddingHorizontal: 14,
      paddingVertical: 13,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)",
      backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff",
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#f1f5f9" : "#0f172a",
    }),
    [isDark]
  );

  if (loading) return <PageLoader />;

  if (!cfg) {
    return (
      <View style={{ flex: 1, backgroundColor: bgColor, padding: 24, justifyContent: "center" }}>
        <Text style={{ color: titleColor, textAlign: "center", fontWeight: "700" }}>
          {fr ? "Élément inconnu." : "Unknown item."}
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: accent, textAlign: "center", fontWeight: "800" }}>{fr ? "Retour" : "Back"}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const title = fr ? cfg.titleFr : cfg.titleEn;
  const hint = fr ? cfg.hintFr : cfg.hintEn;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: bgColor }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <LinearGradient
        colors={isDark ? ["#03040a", "#0a1628", "#05060f"] : ["#f0f9ff", "#e0f2fe", "#f8fafc"]}
        style={{ paddingTop: insets.top + 8, paddingBottom: 16, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.8}
            style={[st.backBtn, { borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)" }]}
          >
            <Ionicons name="arrow-back" size={20} color={titleColor} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={[st.headerTitle, { color: titleColor }]} numberOfLines={1}>
              {title}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <LinearGradient colors={[`${accent}35`, `${accent}12`]} style={st.iconWrap}>
            <Ionicons name={cfg.icon} size={22} color={accent} />
          </LinearGradient>
          <Text style={{ flex: 1, fontSize: 14, lineHeight: 20, color: subColor, fontWeight: "500" }}>{hint}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {!car ? (
          <Text style={{ color: subColor, textAlign: "center", marginTop: 24 }}>
            {fr ? "Aucune voiture enregistrée." : "No car registered."}
          </Text>
        ) : (
          cfg.fields.map((f) => {
            const label = fr ? f.labelFr : f.labelEn;
            if (f.type === "date") {
              return (
                <DateField
                  key={f.formKey}
                  label={label}
                  value={form[f.formKey]}
                  onChange={(v) => setField(f.formKey, v)}
                  isDark={isDark}
                  fr={fr}
                />
              );
            }
            if (f.type === "number") {
              return (
                <View key={f.formKey}>
                  <FieldLabel text={label} isDark={isDark} />
                  <TextInput
                    style={inputStyle}
                    value={form[f.formKey] ?? ""}
                    onChangeText={(v) => setField(f.formKey, v)}
                    keyboardType="numeric"
                    placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                    placeholder={f.formKey === "intervalKm" ? "10000" : "0"}
                  />
                </View>
              );
            }
            return (
              <View key={f.formKey}>
                <FieldLabel text={label} isDark={isDark} />
                <TextInput
                  style={inputStyle}
                  value={form[f.formKey] ?? ""}
                  onChangeText={(v) => setField(f.formKey, v)}
                  placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                />
              </View>
            );
          })
        )}
      </ScrollView>

      {car ? (
        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 16,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)",
            backgroundColor: bgColor,
          }}
        >
          <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.88}>
            <LinearGradient colors={[accent, isDark ? "#0284c7" : "#0369a1"]} style={st.saveBtn}>
              {saving ? <ActivityIndicator color="#fff" /> : <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />}
              <Text style={st.saveText}>{fr ? "Enregistrer" : "Save"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  headerTitle: { fontSize: 17, fontWeight: "800", maxWidth: 240 },
  iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, marginTop: 16 },
  inputBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
  },
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
