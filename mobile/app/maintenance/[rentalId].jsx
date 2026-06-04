import { useCallback, useEffect, useLayoutEffect, useMemo, useState, useRef } from "react";
import { PageLoader } from "../../src/components/AppLoadingScreen";
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  RefreshControl, Alert, StyleSheet, Animated, Easing, TextInput,
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

/* ── type meta ─────────────────────────────────────────────── */
const TYPE_META = {
  oil_change:    { color: "#f59e0b", bg: "rgba(245,158,11,0.14)",  border: "rgba(245,158,11,0.28)",  icon: "water-outline"                     },
  tire_rotation: { color: "#38bdf8", bg: "rgba(56,189,248,0.14)",  border: "rgba(56,189,248,0.28)",  icon: "refresh-circle-outline"            },
  inspection:    { color: "#10b981", bg: "rgba(16,185,129,0.14)",  border: "rgba(16,185,129,0.28)",  icon: "shield-checkmark-outline"          },
  repair:        { color: "#f87171", bg: "rgba(248,113,113,0.14)", border: "rgba(248,113,113,0.28)", icon: "construct-outline"                 },
  cleaning:      { color: "#2dd4bf", bg: "rgba(45,212,191,0.14)",  border: "rgba(45,212,191,0.28)",  icon: "sparkles-outline"                 },
  other:         { color: "#a78bfa", bg: "rgba(167,139,250,0.14)", border: "rgba(167,139,250,0.28)", icon: "ellipsis-horizontal-circle-outline" },
};

const TYPE_OPTIONS = ["oil_change", "tire_rotation", "inspection", "repair", "cleaning", "other"];
const PERIOD_KEYS  = ["all", "last30", "last90", "last365", "due_soon"];

function isDueSoon(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const diff = (d - new Date()) / 86400000;
  return diff >= 0 && diff <= 7;
}
function fmtDate(d, lang) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function matchesPeriod(r, p) {
  if (p === "all") return true;
  if (p === "due_soon") return isDueSoon(r.nextServiceDate);
  const t = new Date(r.date).getTime();
  if (Number.isNaN(t)) return false;
  const now = Date.now();
  if (p === "last30")  return t >= now - 30  * 86400000;
  if (p === "last90")  return t >= now - 90  * 86400000;
  if (p === "last365") return t >= now - 365 * 86400000;
  return true;
}

export default function MaintenanceDetailScreen() {
  const { rentalId: rid }   = useLocalSearchParams();
  const rentalId            = Array.isArray(rid) ? rid[0] : rid;
  const { auth }            = useAuth();
  const { lang, copy, pick, numberLocale } = useAppLang();
  const t                   = copy.maintenance;
  const { colors: C, isDark } = useTheme();
  const router              = useRouter();
  const navigation          = useNavigation();
  const insets              = useSafeAreaInsets();
  const fr                  = lang === "fr";

  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor   = isDark ? "#94a3b8" : "#64748b";
  const ctaGrad    = isDark ? ["#7c6bff", "#5b4ddb"] : ["#6248e8", "#4f46e5"];

  const [car, setCar]             = useState(null);
  const [records, setRecords]     = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [periodFilter, setPeriodFilter] = useState("all");
  const [typeFilter,   setTypeFilter]   = useState("all");
  const [recordSearch, setRecordSearch] = useState("");

  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(22)).current;

  const periodLabels = { all: { en: "All time", fr: "Tout" }, last30: { en: "30 days", fr: "30 j" }, last90: { en: "90 days", fr: "90 j" }, last365: { en: "12 months", fr: "12 mois" }, due_soon: { en: "Due ≤7d", fr: "Dû ≤7j" } };

  const load = useCallback(async () => {
    if (!rentalId) return;
    try {
      const [carRes, mainRes] = await Promise.all([getOwnerRentals(), getMaintenanceForRental(rentalId)]);
      const raw  = carRes.data;
      const list = Array.isArray(raw) ? raw : raw?.rentals || [];
      setCar(list.find((c) => String(c._id) === String(rentalId)) || null);
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

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (loading) return;
    fade.setValue(0); slide.setValue(22);
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, [loading]);

  const filteredRecords = useMemo(() => {
    const q = recordSearch.trim().toLowerCase();
    let list = records.filter((r) => matchesPeriod(r, periodFilter));
    if (typeFilter !== "all") list = list.filter((r) => r.type === typeFilter);
    if (q) list = list.filter((r) => `${t.types[r.type] || r.type} ${r.provider || ""} ${r.notes || ""}`.toLowerCase().includes(q));
    return [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [records, periodFilter, typeFilter, recordSearch, t.types]);

  const filteredCost = useMemo(() => filteredRecords.reduce((s, r) => s + (Number(r.cost) || 0), 0), [filteredRecords]);
  const filtersActive = periodFilter !== "all" || typeFilter !== "all" || recordSearch.trim().length > 0;
  const clearFilters  = () => { setPeriodFilter("all"); setTypeFilter("all"); setRecordSearch(""); };

  useLayoutEffect(() => {
    const title = car?.title || (car?.brand ? `${car.brand} ${car.model}`.trim() : t.screenTitle);
    navigation.setOptions({ headerTitle: title });
  }, [navigation, car, t.screenTitle]);

  const handleDelete = (id) => {
    Alert.alert(t.delete, t.confirmDelete, [
      { text: pick("Cancel", "Annuler"), style: "cancel" },
      { text: t.delete, style: "destructive", onPress: async () => { try { await deleteMaintenanceRecord(id); await load(); } catch { Alert.alert("Error", t.deleteFail); } } },
    ]);
  };

  if (auth?.role !== "rental_owner") {
    return (
      <View style={[S.center, { backgroundColor: C.bg }]}>
        <Text style={[S.denied, { color: titleColor }]}>{t.accessDenied}</Text>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.9}>
          <LinearGradient colors={ctaGrad} style={S.ctaBtn}><Text style={S.ctaBtnTxt}>{t.backProfile}</Text></LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) return <PageLoader />;

  if (!car) {
    return (
      <View style={[S.center, { backgroundColor: C.bg }]}>
        <View style={[S.missOrb, { borderColor: C.border }]}><Ionicons name="car-outline" size={44} color={C.muted} /></View>
        <Text style={[S.denied, { color: titleColor }]}>{pick("Vehicle not found.", "Véhicule introuvable.")}</Text>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.9}>
          <LinearGradient colors={ctaGrad} style={S.ctaBtn}><Text style={S.ctaBtnTxt}>{pick("Go back", "Retour")}</Text></LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  const uri = resolveMediaUrl(car.images?.[0]);

  /* stat chips at top */
  const statChips = [
    { icon: "document-text-outline", val: records.length,                                          lbl: t.summary.records, accent: C.primary },
    { icon: "wallet-outline",        val: `${Number(totalCost).toLocaleString(numberLocale)} MAD`, lbl: t.summary.total,   accent: C.primary },
    { icon: "alert-circle-outline",  val: records.filter((r) => isDueSoon(r.nextServiceDate)).length, lbl: t.summary.dueSoon, accent: records.some((r) => isDueSoon(r.nextServiceDate)) ? "#f59e0b" : subColor },
  ];

  return (
    <View style={[S.screen, { backgroundColor: C.bg }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
      >
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>

          {/* ── Hero image ── */}
          <View style={S.heroWrap}>
            {uri
              ? <Image source={{ uri }} style={S.heroImg} resizeMode="cover" />
              : (
                <LinearGradient colors={isDark ? ["#1a1830", "#0f0e1a"] : ["#e8eeff", "#f0f4ff"]} style={S.heroImg}>
                  <Ionicons name="car-sport-outline" size={64} color={isDark ? "rgba(124,107,255,0.4)" : "rgba(98,72,232,0.3)"} />
                </LinearGradient>
              )
            }
            <LinearGradient colors={["transparent", "rgba(0,0,0,0.18)", "rgba(0,0,0,0.82)"]} style={StyleSheet.absoluteFill} />
            <View style={S.heroText}>
              <Text style={S.heroTitle}>{car.title || `${car.brand} ${car.model}`}</Text>
              <Text style={S.heroMeta}>{car.brand} {car.model} · {car.year}{car.city ? ` · ${car.city}` : ""}</Text>
            </View>
          </View>

          <View style={S.body}>

            {/* ── Stat chips ── */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 2 }} style={{ marginBottom: 16 }}>
              {statChips.map(({ icon, val, lbl, accent }) => (
                <LinearGradient
                  key={lbl}
                  colors={isDark ? ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)"] : ["#fff", "#f8fafc"]}
                  style={[S.statChip, { borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)" }]}
                >
                  <View style={[S.statChipIcon, { backgroundColor: `${accent}1a` }]}>
                    <Ionicons name={icon} size={16} color={accent} />
                  </View>
                  <Text style={[S.statChipNum, { color: accent === subColor ? subColor : accent }]}>{val}</Text>
                  <Text style={[S.statChipLbl, { color: subColor }]}>{lbl}</Text>
                </LinearGradient>
              ))}
            </ScrollView>

            {/* ── Filter panel ── */}
            <LinearGradient
              colors={isDark ? ["rgba(20,18,35,0.97)", "rgba(12,14,28,0.99)"] : ["#fff", "#f1f5f9"]}
              style={[S.filterPanel, { borderColor: isDark ? "rgba(124,107,255,0.16)" : "rgba(98,72,232,0.1)" }]}
            >
              <Text style={[S.filterTitle, { color: C.primary }]}>{pick("Filter records", "Filtrer l'historique")}</Text>

              {/* Search */}
              <View style={[S.searchRow, { borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)", backgroundColor: isDark ? "rgba(0,0,0,0.22)" : "rgba(255,255,255,0.85)" }]}>
                <Ionicons name="search-outline" size={16} color={C.muted} />
                <TextInput value={recordSearch} onChangeText={setRecordSearch} placeholder={pick("Type, provider, notes…", "Type, prestataire, notes…")} placeholderTextColor={C.label} style={[S.searchInput, { color: titleColor }]} />
                {recordSearch.length > 0 && <TouchableOpacity onPress={() => setRecordSearch("")} hitSlop={10}><Ionicons name="close-circle" size={18} color={C.muted} /></TouchableOpacity>}
              </View>

              {/* Period chips */}
              <Text style={[S.filterSub, { color: subColor }]}>{pick("Period", "Période")}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, flexDirection: "row" }}>
                {PERIOD_KEYS.map((key) => {
                  const on = periodFilter === key;
                  const label = fr ? periodLabels[key].fr : periodLabels[key].en;
                  return (
                    <TouchableOpacity key={key} onPress={() => setPeriodFilter(key)} activeOpacity={0.85}>
                      {on
                        ? <LinearGradient colors={ctaGrad} style={S.chipOn}><Text style={S.chipOnTxt}>{label}</Text></LinearGradient>
                        : <View style={[S.chipOff, { borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)", backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)" }]}><Text style={[S.chipOffTxt, { color: subColor }]}>{label}</Text></View>
                      }
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Type chips */}
              <Text style={[S.filterSub, { color: subColor }]}>{pick("Service type", "Type de service")}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, flexDirection: "row" }}>
                <TouchableOpacity onPress={() => setTypeFilter("all")} activeOpacity={0.85}>
                  {typeFilter === "all"
                    ? <LinearGradient colors={ctaGrad} style={S.chipOn}><Text style={S.chipOnTxt}>{pick("All", "Tous")}</Text></LinearGradient>
                    : <View style={[S.chipOff, { borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)", backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)" }]}><Text style={[S.chipOffTxt, { color: subColor }]}>{pick("All", "Tous")}</Text></View>
                  }
                </TouchableOpacity>
                {TYPE_OPTIONS.map((typ) => {
                  const on = typeFilter === typ;
                  const m  = TYPE_META[typ] || TYPE_META.other;
                  return (
                    <TouchableOpacity key={typ} onPress={() => setTypeFilter(on ? "all" : typ)} activeOpacity={0.85}>
                      <View style={[S.chipOff, { borderColor: on ? m.color : isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)", backgroundColor: on ? m.bg : isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)" }]}>
                        <Ionicons name={m.icon} size={12} color={on ? m.color : subColor} />
                        <Text style={[S.chipOffTxt, { color: on ? m.color : subColor, fontWeight: on ? "800" : "700" }]}>{t.types[typ]}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {filtersActive && (
                <TouchableOpacity onPress={clearFilters} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12 }}>
                  <Ionicons name="refresh-outline" size={14} color={C.primary} />
                  <Text style={{ color: C.primary, fontSize: 13, fontWeight: "700" }}>{pick("Reset filters", "Réinitialiser")}</Text>
                </TouchableOpacity>
              )}
            </LinearGradient>

            {/* ── Section header ── */}
            <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 }}>
              <View>
                <Text style={[S.sectionEyebrow, { color: C.primary }]}>{pick("History", "Historique")}</Text>
                <Text style={[S.sectionTitle, { color: titleColor }]}>{t.detailTitle}</Text>
              </View>
              {filtersActive && records.length > 0 && (
                <Text style={[S.filteredHint, { color: subColor }]}>
                  {filteredRecords.length}/{records.length} · {Number(filteredCost).toLocaleString(numberLocale)} MAD
                </Text>
              )}
            </View>

            {/* ── Records ── */}
            {records.length === 0 ? (
              <View style={[S.emptyBox, { borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.07)", backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#fff" }]}>
                <Ionicons name="document-text-outline" size={40} color={C.muted} />
                <Text style={[S.emptyTxt, { color: subColor }]}>{t.detailEmpty}</Text>
              </View>
            ) : filteredRecords.length === 0 ? (
              <View style={[S.emptyBox, { borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.07)", backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#fff" }]}>
                <Ionicons name="funnel-outline" size={38} color={C.muted} />
                <Text style={[S.emptyTxt, { color: titleColor }]}>{pick("No records match.", "Aucun enregistrement.")}</Text>
                <TouchableOpacity onPress={clearFilters} style={{ marginTop: 14 }}>
                  <Text style={{ color: C.primary, fontWeight: "800", fontSize: 14 }}>{pick("Clear filters", "Effacer")}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredRecords.map((r) => {
                const m   = TYPE_META[r.type] || TYPE_META.other;
                const due = isDueSoon(r.nextServiceDate);
                return (
                  <View
                    key={r._id}
                    style={[
                      S.recCard,
                      {
                        backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff",
                        borderColor: m.border,
                        shadowColor: m.color,
                      },
                    ]}
                  >
                    {/* Colored left accent */}
                    <View style={[S.recAccent, { backgroundColor: m.color }]} />

                    {/* Header row */}
                    <View style={S.recTop}>
                      <View style={[S.recTypePill, { backgroundColor: m.bg, borderColor: m.border }]}>
                        <Ionicons name={m.icon} size={13} color={m.color} />
                        <Text style={[S.recTypeTxt, { color: m.color }]}>{t.types[r.type] || r.type}</Text>
                      </View>
                      <TouchableOpacity onPress={() => handleDelete(r._id)} hitSlop={12} style={[S.trashBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
                        <Ionicons name="trash-outline" size={18} color={isDark ? "rgba(255,255,255,0.35)" : "rgba(15,23,42,0.35)"} />
                      </TouchableOpacity>
                    </View>

                    {/* Data rows */}
                    <View style={[S.recDivider, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)" }]} />
                    <RecRow lbl={t.lblServiceDate} val={fmtDate(r.date, lang)} titleColor={titleColor} subColor={subColor} />
                    <RecRow lbl={t.lblCost} val={`${Number(r.cost).toLocaleString(numberLocale)} MAD`} titleColor={titleColor} subColor={subColor} accent={m.color} />
                    {r.mileageAtService != null && r.mileageAtService !== "" && (
                      <RecRow lbl={t.lblMileage} val={`${Number(r.mileageAtService).toLocaleString(numberLocale)} km`} titleColor={titleColor} subColor={subColor} />
                    )}
                    {r.provider ? <RecRow lbl={t.lblProvider} val={r.provider} titleColor={titleColor} subColor={subColor} /> : null}
                    {r.nextServiceDate ? (
                      <RecRow lbl={t.lblNextDate} val={fmtDate(r.nextServiceDate, lang)} titleColor={due ? "#f59e0b" : titleColor} subColor={due ? "#f59e0b" : subColor} warn={due} />
                    ) : null}
                    {r.nextServiceMileage != null && r.nextServiceMileage !== "" ? (
                      <RecRow lbl={t.lblNextMileage} val={`${Number(r.nextServiceMileage).toLocaleString(numberLocale)} km`} titleColor={titleColor} subColor={subColor} />
                    ) : null}
                    {r.notes ? (
                      <View style={[S.notesBlock, { borderTopColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.07)" }]}>
                        <Text style={[S.notesLbl, { color: subColor }]}>{t.lblNotes}</Text>
                        <Text style={[S.notesTxt, { color: titleColor }]}>{r.notes}</Text>
                      </View>
                    ) : null}
                  </View>
                );
              })
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function RecRow({ lbl, val, titleColor, subColor, accent, warn }) {
  return (
    <View style={S.recRow}>
      <Text style={[S.recLbl, { color: warn ? "#f59e0b" : subColor }]}>{lbl}</Text>
      <Text style={[S.recVal, { color: accent || (warn ? "#f59e0b" : titleColor), fontWeight: accent || warn ? "800" : "700" }]}>{val}</Text>
    </View>
  );
}

const S = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  denied: { fontSize: 16, textAlign: "center", fontWeight: "600", maxWidth: 260, marginBottom: 12 },
  missOrb: { width: 90, height: 90, borderRadius: 28, alignItems: "center", justifyContent: "center", borderWidth: 1, marginBottom: 16 },
  ctaBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  ctaBtnTxt: { color: "#fff", fontWeight: "800", fontSize: 15 },

  heroWrap: { position: "relative" },
  heroImg: { width: "100%", height: 230, alignItems: "center", justifyContent: "center" },
  heroText: { position: "absolute", left: 20, right: 20, bottom: 20 },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: -0.4, textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 8 },
  heroMeta: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 5, fontWeight: "600" },

  body: { paddingHorizontal: 18, paddingTop: 18 },

  /* stat chips */
  statChip: { borderRadius: 16, borderWidth: 1, padding: 14, alignItems: "flex-start", gap: 5, minWidth: 130 },
  statChipIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statChipNum: { fontSize: 19, fontWeight: "800", letterSpacing: -0.4 },
  statChipLbl: { fontSize: 9, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },

  /* filter panel */
  filterPanel: { borderRadius: 20, padding: 16, marginBottom: 20, borderWidth: 1 },
  filterTitle: { fontSize: 10, fontWeight: "800", letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 12 },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: "500", padding: 0 },
  filterSub: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10, marginTop: 14 },
  chipOn: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999 },
  chipOnTxt: { color: "#fff", fontWeight: "800", fontSize: 11 },
  chipOff: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, borderWidth: 1 },
  chipOffTxt: { fontWeight: "700", fontSize: 11 },

  /* section */
  sectionEyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 },
  sectionTitle: { fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  filteredHint: { fontSize: 12, fontWeight: "600" },

  /* empty */
  emptyBox: { padding: 36, borderRadius: 20, borderWidth: 1, alignItems: "center" },
  emptyTxt: { fontSize: 14, textAlign: "center", marginTop: 14, lineHeight: 21 },

  /* record card */
  recCard: { marginBottom: 14, borderRadius: 20, borderWidth: 1.5, overflow: "hidden", paddingLeft: 18, paddingRight: 16, paddingTop: 14, paddingBottom: 14, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 4 },
  recAccent: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4, borderTopLeftRadius: 20, borderBottomLeftRadius: 20 },
  recTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  recTypePill: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  recTypeTxt: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.3 },
  trashBtn: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  recDivider: { height: 1, marginBottom: 10 },
  recRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 8, gap: 12 },
  recLbl: { fontSize: 12, fontWeight: "600", flex: 1 },
  recVal: { fontSize: 13, flex: 1, textAlign: "right" },
  notesBlock: { marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  notesLbl: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 },
  notesTxt: { fontSize: 14, lineHeight: 22, fontWeight: "500" },
});
