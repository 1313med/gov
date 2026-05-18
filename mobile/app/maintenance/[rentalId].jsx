import { useCallback, useEffect, useLayoutEffect, useMemo, useState, useRef } from "react";
import { PageLoader } from '../../src/components/AppLoadingScreen';
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
  Animated,
  Easing,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { getOwnerRentals } from "../../src/api/rental";
import { getMaintenanceForRental, deleteMaintenanceRecord } from "../../src/api/maintenance";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { useTheme } from "../../src/context/ThemeContext";
import { resolveMediaUrl } from "../../src/utils/mediaUrl";
import { getApiErrorMessage } from "../../src/utils/apiErrorMessage";

const TYPE_OPTIONS = ["oil_change", "tire_rotation", "inspection", "repair", "cleaning", "other"];
const PERIOD_KEYS = ["all", "last30", "last90", "last365", "due_soon"];

function isDueSoon(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const diff = (d - new Date()) / 86400000;
  return diff >= 0 && diff <= 7;
}

function fmtDate(d, lang) {
  if (!d) return "—";
  const locale = lang === "fr" ? "fr-FR" : "en-GB";
  return new Date(d).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
}

function recordMatchesPeriod(r, period) {
  if (period === "all") return true;
  if (period === "due_soon") return isDueSoon(r.nextServiceDate);
  const t = new Date(r.date).getTime();
  if (Number.isNaN(t)) return false;
  const now = Date.now();
  if (period === "last30") return t >= now - 30 * 86400000;
  if (period === "last90") return t >= now - 90 * 86400000;
  if (period === "last365") return t >= now - 365 * 86400000;
  return true;
}

export default function MaintenanceDetailScreen() {
  const { rentalId: rid } = useLocalSearchParams();
  const rentalId = Array.isArray(rid) ? rid[0] : rid;
  const { auth } = useAuth();
  const { lang, copy } = useAppLang();
  const t = copy.maintenance;
  const { colors: C, isDark } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const fr = lang === "fr";
  const numLocale = fr ? "fr-FR" : "en-US";
  const s = useMemo(() => createStyles(C, isDark), [C, isDark]);

  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#94a3b8" : "#64748b";
  const ctaGrad = isDark ? ["#7c6bff", "#5b4ddb"] : ["#6248e8", "#4f46e5"];

  const [car, setCar] = useState(null);
  const [records, setRecords] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [periodFilter, setPeriodFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [recordSearch, setRecordSearch] = useState("");

  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(24)).current;

  const periodLabels = useMemo(
    () => ({
      all: { en: "All time", fr: "Tout" },
      last30: { en: "30 days", fr: "30 jours" },
      last90: { en: "90 days", fr: "90 jours" },
      last365: { en: "12 months", fr: "12 mois" },
      due_soon: { en: "Due ≤7d", fr: "Dû ≤7j" },
    }),
    [],
  );

  const load = useCallback(async () => {
    if (!rentalId) return;
    try {
      const [carRes, mainRes] = await Promise.all([getOwnerRentals(), getMaintenanceForRental(rentalId)]);
      const raw = carRes.data;
      const list = Array.isArray(raw) ? raw : raw?.rentals || [];
      const found = list.find((c) => String(c._id) === String(rentalId));
      setCar(found || null);
      const { records: recs, totalCost: tc } = mainRes.data || {};
      setRecords(Array.isArray(recs) ? recs : []);
      setTotalCost(tc || 0);
    } catch (e) {
      Alert.alert("Error", getApiErrorMessage(e, t.saveFail));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [rentalId, t.saveFail]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (loading) return;
    contentFade.setValue(0);
    contentSlide.setValue(24);
    Animated.parallel([
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(contentSlide, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [loading, contentFade, contentSlide]);

  const filteredRecords = useMemo(() => {
    const q = recordSearch.trim().toLowerCase();
    let list = records.filter((r) => recordMatchesPeriod(r, periodFilter));
    if (typeFilter !== "all") list = list.filter((r) => r.type === typeFilter);
    if (q) {
      list = list.filter((r) => {
        const typeLabel = (t.types[r.type] || r.type || "").toLowerCase();
        const prov = (r.provider || "").toLowerCase();
        const notes = (r.notes || "").toLowerCase();
        return typeLabel.includes(q) || prov.includes(q) || notes.includes(q);
      });
    }
    return [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [records, periodFilter, typeFilter, recordSearch, t.types]);

  const filteredCost = useMemo(
    () => filteredRecords.reduce((sum, r) => sum + (Number(r.cost) || 0), 0),
    [filteredRecords],
  );

  const filtersActive =
    periodFilter !== "all" || typeFilter !== "all" || recordSearch.trim().length > 0;

  useLayoutEffect(() => {
    const title = car?.title || car?.brand ? `${car?.brand || ""} ${car?.model || ""}`.trim() : t.detailTitle;
    navigation.setOptions({ headerTitle: title || t.screenTitle });
  }, [navigation, car, t.detailTitle, t.screenTitle]);

  const handleDelete = (id) => {
    Alert.alert(t.delete, t.confirmDelete, [
      { text: fr ? "Annuler" : "Cancel", style: "cancel" },
      {
        text: t.delete,
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMaintenanceRecord(id);
            await load();
          } catch {
            Alert.alert("Error", t.deleteFail);
          }
        },
      },
    ]);
  };

  const clearRecordFilters = () => {
    setPeriodFilter("all");
    setTypeFilter("all");
    setRecordSearch("");
  };

  if (auth?.role !== "rental_owner") {
    return (
      <View style={[s.center, { backgroundColor: C.bg }]}>
        <Text style={[s.denied, { color: titleColor }]}>{t.accessDenied}</Text>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.9}>
          <LinearGradient colors={ctaGrad} style={s.backBtn}>
            <Text style={s.backBtnText}>{t.backProfile}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) return <PageLoader />;

  if (!car) {
    return (
      <View style={[s.center, { backgroundColor: C.bg }]}>
        <View style={s.missOrb}>
          <Ionicons name="car-outline" size={48} color={C.muted} />
        </View>
        <Text style={[s.denied, { color: titleColor }]}>{fr ? "Véhicule introuvable." : "Vehicle not found."}</Text>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.9}>
          <LinearGradient colors={ctaGrad} style={s.backBtn}>
            <Text style={s.backBtnText}>{fr ? "Retour" : "Go back"}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  const uri = resolveMediaUrl(car.images?.[0]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        style={s.screen}
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />
        }
      >
        <Animated.View style={{ opacity: contentFade, transform: [{ translateY: contentSlide }] }}>
          <View style={s.heroWrap}>
            {uri ? (
              <Image source={{ uri }} style={s.heroImg} resizeMode="cover" />
            ) : (
              <View style={s.heroPh}>
                <Ionicons name="car-sport-outline" size={56} color={C.muted} />
              </View>
            )}
            <LinearGradient colors={["transparent", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.85)"]} style={s.heroGrad} />
            <View style={s.heroTextBlock}>
              <Text style={s.heroTitle}>{car.title || `${car.brand} ${car.model}`}</Text>
              <Text style={s.heroMeta}>
                {car.brand} {car.model} · {car.year} · {car.city}
              </Text>
            </View>
          </View>

          <View style={s.bodyPad}>
            <LinearGradient
              colors={
                isDark
                  ? ["rgba(124,107,255,0.14)", "rgba(20,21,40,0.95)"]
                  : ["rgba(98,72,232,0.1)", "#ffffff"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.totalCard}
            >
              <View style={s.totalRowInner}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.totalLabel, { color: subColor }]}>{t.detailTotal}</Text>
                  <Text style={[s.totalValue, { color: C.primary }]}>
                    {Number(totalCost).toLocaleString(numLocale)} {t.mad}
                  </Text>
                  {filtersActive && records.length > 0 && (
                    <Text style={[s.filteredHint, { color: subColor }]}>
                      {fr
                        ? `Filtre : ${filteredRecords.length}/${records.length} · ${Number(filteredCost).toLocaleString(numLocale)} ${t.mad}`
                        : `Filtered: ${filteredRecords.length}/${records.length} · ${Number(filteredCost).toLocaleString(numLocale)} ${t.mad}`}
                    </Text>
                  )}
                </View>
                <View style={s.totalIcon}>
                  <Ionicons name="wallet-outline" size={26} color={C.primary} />
                </View>
              </View>
            </LinearGradient>

            <LinearGradient
              colors={isDark ? ["rgba(20,18,35,0.95)", "rgba(12,14,28,0.98)"] : ["#ffffff", "#f1f5f9"]}
              style={s.filterPanel}
            >
              <Text style={[s.filterPanelTitle, { color: C.primary }]}>
                {fr ? "Filtrer l'historique" : "Filter records"}
              </Text>
              <View style={[s.searchRow, { borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)" }]}>
                <Ionicons name="search-outline" size={18} color={C.muted} />
                <TextInput
                  value={recordSearch}
                  onChangeText={setRecordSearch}
                  placeholder={fr ? "Type, prestataire, notes…" : "Type, provider, notes…"}
                  placeholderTextColor={C.label}
                  style={[s.searchInput, { color: titleColor }]}
                />
                {recordSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setRecordSearch("")} hitSlop={10}>
                    <Ionicons name="close-circle" size={20} color={C.muted} />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={[s.filterSubLabel, { color: subColor }]}>{fr ? "Période" : "Period"}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hChips}>
                {PERIOD_KEYS.map((key) => {
                  const on = periodFilter === key;
                  const label = fr ? periodLabels[key].fr : periodLabels[key].en;
                  return (
                    <TouchableOpacity key={key} onPress={() => setPeriodFilter(key)} activeOpacity={0.85}>
                      {on ? (
                        <LinearGradient colors={ctaGrad} style={s.chipOn}>
                          <Text style={s.chipOnText}>{label}</Text>
                        </LinearGradient>
                      ) : (
                        <View style={[s.chipOff, { borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)" }]}>
                          <Text style={[s.chipOffText, { color: subColor }]}>{label}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <Text style={[s.filterSubLabel, { color: subColor }]}>{fr ? "Type d'intervention" : "Service type"}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hChips}>
                <TouchableOpacity onPress={() => setTypeFilter("all")} activeOpacity={0.85}>
                  {typeFilter === "all" ? (
                    <LinearGradient colors={ctaGrad} style={s.chipOn}>
                      <Text style={s.chipOnText}>{fr ? "Tous" : "All types"}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={[s.chipOff, { borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)" }]}>
                      <Text style={[s.chipOffText, { color: subColor }]}>{fr ? "Tous" : "All types"}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {TYPE_OPTIONS.map((typ) => {
                  const on = typeFilter === typ;
                  return (
                    <TouchableOpacity key={typ} onPress={() => setTypeFilter(on ? "all" : typ)} activeOpacity={0.85}>
                      {on ? (
                        <LinearGradient colors={ctaGrad} style={s.chipOn}>
                          <Text style={s.chipOnText}>{t.types[typ]}</Text>
                        </LinearGradient>
                      ) : (
                        <View style={[s.chipOff, { borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)" }]}>
                          <Text style={[s.chipOffText, { color: subColor }]}>{t.types[typ]}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              {filtersActive && (
                <TouchableOpacity onPress={clearRecordFilters} style={s.clearRow}>
                  <Ionicons name="refresh-outline" size={16} color={C.primary} />
                  <Text style={[s.clearText, { color: C.primary }]}>
                    {fr ? "Réinitialiser les filtres" : "Reset filters"}
                  </Text>
                </TouchableOpacity>
              )}
            </LinearGradient>

            <Text style={[s.sectionEyebrow, { color: C.primary }]}>{fr ? "Historique" : "History"}</Text>
            <Text style={[s.sectionTitle, { color: titleColor }]}>{t.detailTitle}</Text>

            {records.length === 0 ? (
              <LinearGradient
                colors={isDark ? ["rgba(255,255,255,0.04)", "rgba(12,14,28,0.98)"] : ["#ffffff", "#f8fafc"]}
                style={s.emptyBox}
              >
                <Ionicons name="document-text-outline" size={40} color={C.muted} />
                <Text style={[s.emptyText, { color: subColor }]}>{t.detailEmpty}</Text>
              </LinearGradient>
            ) : filteredRecords.length === 0 ? (
              <LinearGradient
                colors={isDark ? ["rgba(255,255,255,0.04)", "rgba(12,14,28,0.98)"] : ["#ffffff", "#f8fafc"]}
                style={s.emptyBox}
              >
                <Ionicons name="funnel-outline" size={40} color={C.muted} />
                <Text style={[s.emptyText, { color: titleColor }]}>{fr ? "Aucun enregistrement ne correspond." : "No records match your filters."}</Text>
                <TouchableOpacity onPress={clearRecordFilters} style={{ marginTop: 14 }}>
                  <Text style={{ color: C.primary, fontWeight: "800" }}>{fr ? "Effacer les filtres" : "Clear filters"}</Text>
                </TouchableOpacity>
              </LinearGradient>
            ) : (
              filteredRecords.map((r) => (
                <LinearGradient
                  key={r._id}
                  colors={
                    isDark
                      ? ["rgba(255,255,255,0.05)", "rgba(12,14,28,0.98)"]
                      : ["#ffffff", "#f8fafc"]
                  }
                  style={[
                    s.recordCard,
                    {
                      borderColor: isDark ? "rgba(124,107,255,0.2)" : "rgba(98,72,232,0.12)",
                    },
                  ]}
                >
                  <View style={[s.recordAccent, { backgroundColor: C.primary }]} />
                  <View style={s.recordTop}>
                    <View style={s.recordTypePill}>
                      <Ionicons name="construct-outline" size={14} color={C.primary} />
                      <Text style={[s.recordType, { color: C.primary }]}>{t.types[r.type] || r.type}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(r._id)} hitSlop={12} style={s.trashBtn}>
                      <Ionicons name="trash-outline" size={20} color={C.muted} />
                    </TouchableOpacity>
                  </View>
                  <View style={s.row}>
                    <Text style={[s.lbl, { color: subColor }]}>{t.lblServiceDate}</Text>
                    <Text style={[s.val, { color: titleColor }]}>{fmtDate(r.date, lang)}</Text>
                  </View>
                  <View style={s.row}>
                    <Text style={[s.lbl, { color: subColor }]}>{t.lblCost}</Text>
                    <Text style={[s.val, { color: titleColor }]}>
                      {Number(r.cost).toLocaleString(numLocale)} {t.mad}
                    </Text>
                  </View>
                  {r.mileageAtService != null && r.mileageAtService !== "" && (
                    <View style={s.row}>
                      <Text style={[s.lbl, { color: subColor }]}>{t.lblMileage}</Text>
                      <Text style={[s.val, { color: titleColor }]}>
                        {Number(r.mileageAtService).toLocaleString(numLocale)} km
                      </Text>
                    </View>
                  )}
                  {r.provider ? (
                    <View style={s.row}>
                      <Text style={[s.lbl, { color: subColor }]}>{t.lblProvider}</Text>
                      <Text style={[s.val, { color: titleColor }]}>{r.provider}</Text>
                    </View>
                  ) : null}
                  {r.nextServiceDate ? (
                    <View style={s.row}>
                      <Text style={[s.lbl, isDueSoon(r.nextServiceDate) && { color: "#f59e0b" }]}>{t.lblNextDate}</Text>
                      <Text
                        style={[
                          s.val,
                          isDueSoon(r.nextServiceDate) && { color: "#f59e0b", fontWeight: "800" },
                          !isDueSoon(r.nextServiceDate) && { color: titleColor },
                        ]}
                      >
                        {fmtDate(r.nextServiceDate, lang)}
                      </Text>
                    </View>
                  ) : null}
                  {r.nextServiceMileage != null && r.nextServiceMileage !== "" ? (
                    <View style={s.row}>
                      <Text style={[s.lbl, { color: subColor }]}>{t.lblNextMileage}</Text>
                      <Text style={[s.val, { color: titleColor }]}>
                        {Number(r.nextServiceMileage).toLocaleString(numLocale)} km
                      </Text>
                    </View>
                  ) : null}
                  {r.notes ? (
                    <View style={[s.notesBlock, { borderTopColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)" }]}>
                      <Text style={[s.lbl, { color: subColor }]}>{t.lblNotes}</Text>
                      <Text style={[s.notes, { color: titleColor }]}>{r.notes}</Text>
                    </View>
                  ) : null}
                </LinearGradient>
              ))
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function createStyles(C, isDark) {
  return StyleSheet.create({
    screen: { flex: 1 },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
    denied: { fontSize: 16, textAlign: "center", fontWeight: "600", maxWidth: 280 },
    loaderRing: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: isDark ? "rgba(124,107,255,0.3)" : "rgba(98,72,232,0.25)",
    },
    missOrb: {
      width: 100,
      height: 100,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
    },
    backBtn: { marginTop: 20, paddingHorizontal: 26, paddingVertical: 14, borderRadius: 14 },
    backBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
    heroWrap: { position: "relative" },
    heroImg: { width: "100%", height: 220, backgroundColor: C.inputBg },
    heroPh: { width: "100%", height: 220, backgroundColor: C.inputBg, alignItems: "center", justifyContent: "center" },
    heroGrad: { ...StyleSheet.absoluteFillObject, height: 220 },
    heroTextBlock: { position: "absolute", left: 20, right: 20, bottom: 20 },
    heroTitle: { color: "#fff", fontSize: 24, fontWeight: "800", letterSpacing: -0.4, textShadowColor: "rgba(0,0,0,0.4)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 8 },
    heroMeta: { color: "rgba(255,255,255,0.9)", fontSize: 13, marginTop: 6, fontWeight: "600" },
    bodyPad: { paddingHorizontal: 18, paddingTop: 18 },
    totalCard: {
      borderRadius: 20,
      padding: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? "rgba(124,107,255,0.3)" : "rgba(98,72,232,0.2)",
      shadowColor: "#7c6bff",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.25 : 0.12,
      shadowRadius: 16,
      elevation: 6,
    },
    totalRowInner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    totalLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" },
    totalValue: { fontSize: 26, fontWeight: "800", marginTop: 6, letterSpacing: -0.5 },
    filteredHint: { fontSize: 12, marginTop: 10, fontWeight: "600", lineHeight: 17 },
    totalIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "rgba(124,107,255,0.15)" : "rgba(98,72,232,0.1)",
    },
    filterPanel: {
      borderRadius: 20,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: isDark ? "rgba(124,107,255,0.18)" : "rgba(98,72,232,0.12)",
    },
    filterPanelTitle: { fontSize: 11, fontWeight: "800", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.85)",
    },
    searchInput: { flex: 1, fontSize: 15, fontWeight: "500", padding: 0 },
    filterSubLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase", marginTop: 14, marginBottom: 10 },
    hChips: { flexDirection: "row", gap: 8, alignItems: "center", paddingBottom: 4 },
    chipOn: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999 },
    chipOnText: { color: "#fff", fontWeight: "800", fontSize: 11 },
    chipOff: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, borderWidth: 1, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.65)" },
    chipOffText: { fontWeight: "700", fontSize: 11 },
    clearRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 },
    clearText: { fontSize: 13, fontWeight: "700" },
    sectionEyebrow: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 2,
      textTransform: "uppercase",
      marginBottom: 6,
    },
    sectionTitle: { fontSize: 20, fontWeight: "800", marginBottom: 14, letterSpacing: -0.3 },
    emptyBox: {
      padding: 32,
      borderRadius: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
    },
    emptyText: { fontSize: 14, textAlign: "center", marginTop: 14, lineHeight: 21 },
    recordCard: {
      marginBottom: 14,
      padding: 18,
      paddingLeft: 20,
      borderRadius: 20,
      borderWidth: 1,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.2 : 0.06,
      shadowRadius: 14,
      elevation: 4,
    },
    recordAccent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4, borderTopLeftRadius: 20, borderBottomLeftRadius: 20 },
    recordTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
    recordTypePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: isDark ? "rgba(124,107,255,0.12)" : "rgba(98,72,232,0.08)",
    },
    recordType: { fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.4 },
    trashBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 10, gap: 12 },
    lbl: { fontSize: 12, flex: 1, fontWeight: "600" },
    val: { fontSize: 14, fontWeight: "700", flex: 1, textAlign: "right" },
    notesBlock: { marginTop: 14, paddingTop: 14, borderTopWidth: 1 },
    notes: { fontSize: 14, marginTop: 8, lineHeight: 22, fontWeight: "500" },
  });
}
