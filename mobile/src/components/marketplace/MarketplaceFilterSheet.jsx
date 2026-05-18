import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  StyleSheet,
  Platform,
  Animated,
  PanResponder,
  Pressable,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  EMPTY_FILTERS,
  FUEL_OPTIONS,
  GEARBOX_OPTIONS,
  BRAND_OPTIONS,
  MOROCCO_CITIES,
  SALE_PRICE_BANDS,
  RENT_PRICE_BANDS,
  YEAR_BANDS,
} from "../../utils/marketplaceFilters";

const DISMISS_DRAG = 88;
const DISMISS_VELOCITY = 1.1;

function Section({ title, children, isDark }) {
  return (
    <View style={{ marginBottom: 22 }}>
      <Text style={[st.sectionTitle, { color: isDark ? "#94a3b8" : "#64748b" }]}>{title}</Text>
      {children}
    </View>
  );
}

function Chip({ label, active, onPress, accent, isDark }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      {active ? (
        <LinearGradient colors={[accent, isDark ? "#4338ca" : "#4f46e5"]} style={st.chipActive}>
          <Text style={st.chipActiveText}>{label}</Text>
        </LinearGradient>
      ) : (
        <View style={[st.chip, { borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)", backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff" }]}>
          <Text style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: 12, fontWeight: "700" }}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function DateRow({ label, value, onChange, isDark, fr }) {
  const [show, setShow] = useState(false);
  const formatted = value
    ? new Date(value).toLocaleDateString(fr ? "fr-FR" : "en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : fr
      ? "Choisir"
      : "Choose";

  return (
    <View style={{ flex: 1 }}>
      <Text style={[st.fieldLabel, { color: isDark ? "#64748b" : "#94a3b8" }]}>{label}</Text>
      <TouchableOpacity
        onPress={() => setShow(true)}
        style={[st.dateBtn, { borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)", backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff" }]}
      >
        <Text style={{ color: value ? (isDark ? "#f1f5f9" : "#0f172a") : isDark ? "#475569" : "#94a3b8", fontWeight: "600", fontSize: 14 }}>
          {formatted}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={isDark ? "#475569" : "#94a3b8"} />
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={new Date()}
          onChange={(_, d) => {
            setShow(Platform.OS === "ios");
            if (d) onChange(d.toISOString());
          }}
        />
      )}
    </View>
  );
}

export default function MarketplaceFilterSheet({ visible, mode, filters, fr, isDark, accent, onClose, onApply }) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState(filters);
  const translateY = useRef(new Animated.Value(0)).current;
  const closingRef = useRef(false);

  useEffect(() => {
    if (visible) {
      setDraft(filters);
      translateY.setValue(0);
      closingRef.current = false;
    }
  }, [visible, filters]);

  const dismiss = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    Animated.timing(translateY, {
      toValue: 420,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      translateY.setValue(0);
      closingRef.current = false;
      onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 4 && Math.abs(g.dy) > Math.abs(g.dx) * 1.2,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > DISMISS_DRAG || g.vy > DISMISS_VELOCITY) {
          dismiss();
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 9, tension: 65 }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  const priceBands = mode === "rent" ? RENT_PRICE_BANDS : SALE_PRICE_BANDS;
  const titleColor = isDark ? "#f8fafc" : "#0f172a";

  const apply = () => {
    onApply(draft);
    onClose();
  };

  const reset = () => setDraft({ ...EMPTY_FILTERS });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={dismiss}>
      <View style={st.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} accessibilityRole="button" accessibilityLabel={fr ? "Fermer" : "Close"} />

        <Animated.View
          style={[
            st.sheet,
            {
              backgroundColor: isDark ? "#0f172a" : "#fff",
              paddingBottom: insets.bottom + 16,
              transform: [{ translateY }],
            },
          ]}
        >
          <View {...panResponder.panHandlers} style={st.dragZone}>
            <View style={st.handle} />
            <Text style={[st.dragHint, { color: isDark ? "#64748b" : "#94a3b8" }]}>
              {fr ? "Glisser vers le bas pour fermer" : "Swipe down to close"}
            </Text>
            <TouchableOpacity onPress={dismiss} hitSlop={12} style={st.closeBtn} accessibilityLabel={fr ? "Fermer" : "Close"}>
              <Ionicons name="chevron-down" size={26} color={isDark ? "#94a3b8" : "#64748b"} />
            </TouchableOpacity>
          </View>

          <View style={st.sheetHead}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[st.sheetTitle, { color: titleColor }]}>
                {fr ? "Filtres avancés" : "Advanced filters"}
              </Text>
              <Text style={{ color: isDark ? "#64748b" : "#94a3b8", fontSize: 13, marginTop: 4 }}>
                {mode === "rent"
                  ? fr
                    ? "Affinez les locations disponibles"
                    : "Refine available rentals"
                  : fr
                    ? "Trouvez la voiture idéale à acheter"
                    : "Find your ideal car to buy"}
              </Text>
            </View>
            <TouchableOpacity onPress={reset} hitSlop={12}>
              <Text style={{ color: accent, fontWeight: "800", fontSize: 13 }}>{fr ? "Réinitialiser" : "Reset"}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
            <Section title={fr ? "Ville" : "City"} isDark={isDark}>
              <TextInput
                value={draft.city}
                onChangeText={(v) => setDraft((p) => ({ ...p, city: v }))}
                placeholder={fr ? "Ex. Casablanca" : "e.g. Casablanca"}
                placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                style={[st.input, { color: titleColor, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)", backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff" }]}
              />
              <View style={st.chipWrap}>
                {MOROCCO_CITIES.map((c) => (
                  <Chip
                    key={c}
                    label={c}
                    active={draft.city === c}
                    accent={accent}
                    isDark={isDark}
                    onPress={() => setDraft((p) => ({ ...p, city: p.city === c ? "" : c }))}
                  />
                ))}
              </View>
            </Section>

            <Section title={fr ? "Marque" : "Brand"} isDark={isDark}>
              <TextInput
                value={draft.brand}
                onChangeText={(v) => setDraft((p) => ({ ...p, brand: v }))}
                placeholder={fr ? "Ex. Dacia" : "e.g. Dacia"}
                placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                style={[st.input, { color: titleColor, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)", backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff" }]}
              />
              <View style={st.chipWrap}>
                {BRAND_OPTIONS.map((b) => (
                  <Chip
                    key={b}
                    label={b}
                    active={draft.brand.toLowerCase() === b.toLowerCase()}
                    accent={accent}
                    isDark={isDark}
                    onPress={() => setDraft((p) => ({ ...p, brand: p.brand.toLowerCase() === b.toLowerCase() ? "" : b }))}
                  />
                ))}
              </View>
            </Section>

            <Section title={fr ? "Carburant" : "Fuel"} isDark={isDark}>
              <View style={st.chipWrap}>
                {FUEL_OPTIONS.map((o) => (
                  <Chip
                    key={o.id || "all"}
                    label={fr ? o.fr : o.en}
                    active={draft.fuel === o.id}
                    accent={accent}
                    isDark={isDark}
                    onPress={() => setDraft((p) => ({ ...p, fuel: o.id }))}
                  />
                ))}
              </View>
            </Section>

            <Section title={fr ? "Boîte de vitesse" : "Gearbox"} isDark={isDark}>
              <View style={st.chipWrap}>
                {GEARBOX_OPTIONS.map((o) => (
                  <Chip
                    key={o.id || "all"}
                    label={fr ? o.fr : o.en}
                    active={draft.gearbox === o.id}
                    accent={accent}
                    isDark={isDark}
                    onPress={() => setDraft((p) => ({ ...p, gearbox: o.id }))}
                  />
                ))}
              </View>
            </Section>

            <Section title={mode === "rent" ? (fr ? "Prix par jour (MAD)" : "Price per day (MAD)") : fr ? "Prix de vente (MAD)" : "Sale price (MAD)"} isDark={isDark}>
              <View style={st.chipWrap}>
                {priceBands.map((b) => (
                  <Chip
                    key={b.key}
                    label={fr ? b.fr : b.en}
                    active={draft.priceKey === b.key}
                    accent={accent}
                    isDark={isDark}
                    onPress={() => setDraft((p) => ({ ...p, priceKey: b.key }))}
                  />
                ))}
              </View>
            </Section>

            {mode === "buy" ? (
              <Section title={fr ? "Année du véhicule" : "Vehicle year"} isDark={isDark}>
                <View style={st.chipWrap}>
                  {YEAR_BANDS.map((b) => (
                    <Chip
                      key={b.key}
                      label={fr ? b.fr : b.en}
                      active={draft.yearKey === b.key}
                      accent={accent}
                      isDark={isDark}
                      onPress={() => setDraft((p) => ({ ...p, yearKey: b.key }))}
                    />
                  ))}
                </View>
              </Section>
            ) : (
              <>
                <Section title={fr ? "Disponibilité" : "Availability"} isDark={isDark}>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <DateRow
                      label={fr ? "Début" : "Start"}
                      value={draft.startDate}
                      onChange={(v) => setDraft((p) => ({ ...p, startDate: v }))}
                      isDark={isDark}
                      fr={fr}
                    />
                    <DateRow
                      label={fr ? "Fin" : "End"}
                      value={draft.endDate}
                      onChange={(v) => setDraft((p) => ({ ...p, endDate: v }))}
                      isDark={isDark}
                      fr={fr}
                    />
                  </View>
                  <Text style={{ color: isDark ? "#64748b" : "#94a3b8", fontSize: 12, marginTop: 8, lineHeight: 18 }}>
                    {fr
                      ? "Masque les voitures déjà réservées sur cette période."
                      : "Hides cars already booked for these dates."}
                  </Text>
                </Section>
                <View
                  style={[
                    st.toggleRow,
                    { borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)", backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc" },
                  ]}
                >
                  <Ionicons name="airplane-outline" size={22} color={accent} />
                  <Text style={{ flex: 1, marginLeft: 12, color: titleColor, fontWeight: "700", fontSize: 15 }}>
                    {fr ? "Livraison aéroport uniquement" : "Airport delivery only"}
                  </Text>
                  <Switch
                    value={draft.airportOnly}
                    onValueChange={(v) => setDraft((p) => ({ ...p, airportOnly: v }))}
                    trackColor={{ false: "#cbd5e1", true: accent }}
                  />
                </View>
              </>
            )}
          </ScrollView>

          <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
            <TouchableOpacity onPress={apply} activeOpacity={0.9}>
              <LinearGradient colors={[accent, isDark ? "#4338ca" : "#0369a1"]} style={st.applyBtn}>
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                <Text style={st.applyText}>{fr ? "Voir les résultats" : "Show results"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "92%" },
  dragZone: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 6,
    paddingHorizontal: 20,
  },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: "rgba(148,163,184,0.55)", marginBottom: 6 },
  dragHint: { fontSize: 11, fontWeight: "600", marginBottom: 4 },
  closeBtn: { position: "absolute", right: 16, top: 8, padding: 4 },
  sheetHead: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12 },
  sheetTitle: { fontSize: 22, fontWeight: "900", letterSpacing: -0.4 },
  sectionTitle: { fontSize: 11, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontWeight: "600", marginBottom: 10 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  chipActive: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  chipActiveText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  fieldLabel: { fontSize: 11, fontWeight: "700", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 },
  dateBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12 },
  toggleRow: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  applyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 16 },
  applyText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
