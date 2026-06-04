import { useEffect, useMemo, useState, useRef } from "react";
import { PageLoader } from "../../src/components/AppLoadingScreen";
import {
  View, Text, TouchableOpacity, Image, RefreshControl,
  Alert, Modal, TextInput, StyleSheet, FlatList,
  KeyboardAvoidingView, Platform, Pressable, Animated, Easing, ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getOwnerRentals } from "../../src/api/rental";
import { getAllMaintenance, createMaintenanceRecord } from "../../src/api/maintenance";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { useTheme } from "../../src/context/ThemeContext";
import { resolveMediaUrl } from "../../src/utils/mediaUrl";
import { getApiErrorMessage } from "../../src/utils/apiErrorMessage";

/* ── type meta ─────────────────────────────────────────────── */
const TYPE_META = {
  oil_change:    { color: "#f59e0b", bg: "rgba(245,158,11,0.16)",  icon: "water-outline"                    },
  tire_rotation: { color: "#38bdf8", bg: "rgba(56,189,248,0.16)",  icon: "refresh-circle-outline"           },
  inspection:    { color: "#10b981", bg: "rgba(16,185,129,0.16)",  icon: "shield-checkmark-outline"         },
  repair:        { color: "#f87171", bg: "rgba(248,113,113,0.16)", icon: "construct-outline"                },
  cleaning:      { color: "#2dd4bf", bg: "rgba(45,212,191,0.16)",  icon: "sparkles-outline"                },
  other:         { color: "#a78bfa", bg: "rgba(167,139,250,0.16)", icon: "ellipsis-horizontal-circle-outline"},
};

const TYPE_OPTIONS = ["oil_change", "tire_rotation", "inspection", "repair", "cleaning", "other"];
const FLEET_FILTERS = ["all", "due_soon", "with_history", "no_history"];
const BLANK = { rentalId: "", type: "oil_change", cost: "", date: "", mileageAtService: "", provider: "", notes: "", nextServiceDate: "", nextServiceMileage: "" };

function isDueSoon(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  return (d - new Date()) / 86400000 >= 0 && (d - new Date()) / 86400000 <= 7;
}
function carHasDueSoon(recs) { return recs.some((r) => isDueSoon(r.nextServiceDate)); }

export default function MaintenanceScreen() {
  const { auth } = useAuth();
  const { lang, copy, pick, numberLocale } = useAppLang();
  const t = copy.maintenance;
  const { colors: C, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fr = lang === "fr";

  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor   = isDark ? "#94a3b8" : "#64748b";
  const ctaGrad    = isDark ? ["#7c6bff", "#5b4ddb"] : ["#6248e8", "#4f46e5"];
  const heroBg     = isDark ? ["#09090f", "#120b22"] : ["#f8f5ff", "#f0f9ff"];

  const [cars, setCars]           = useState([]);
  const [records, setRecords]     = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCar, setModalCar]   = useState(null);
  const [form, setForm]           = useState(BLANK);
  const [saving, setSaving]       = useState(false);
  const [fleetFilter, setFleetFilter] = useState("all");
  const [fleetSearch, setFleetSearch] = useState("");

  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(18)).current;

  async function load() {
    try {
      const [mainRes, carRes] = await Promise.all([getAllMaintenance(), getOwnerRentals()]);
      const data = mainRes.data;
      const allRecs = (data.byRental || []).flatMap((g) =>
        (g.records || []).map((r) => ({ ...r, _rentalTitle: g.rental?.title }))
      );
      setRecords(allRecs);
      setTotalCost(data.totalCost || 0);
      const raw = carRes.data;
      setCars(Array.isArray(raw) ? raw : raw?.rentals || []);
    } catch (e) {
      Alert.alert("Error", getApiErrorMessage(e, t.saveFail));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (loading) return;
    fade.setValue(0); slide.setValue(18);
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, [loading]);

  const byCarId = useMemo(() => records.reduce((acc, r) => {
    const id = (r.rentalId?._id || r.rentalId)?.toString();
    if (id) (acc[id] = acc[id] || []).push(r);
    return acc;
  }, {}), [records]);

  const dueSoonCount = useMemo(() => records.filter((r) => isDueSoon(r.nextServiceDate)).length, [records]);

  const filteredCars = useMemo(() => {
    const q = fleetSearch.trim().toLowerCase();
    return cars.filter((car) => {
      const recs = byCarId[car._id] || [];
      if (q && !`${car.title} ${car.brand} ${car.model} ${car.city}`.toLowerCase().includes(q)) return false;
      if (fleetFilter === "due_soon")    return carHasDueSoon(recs);
      if (fleetFilter === "with_history") return recs.length > 0;
      if (fleetFilter === "no_history")  return recs.length === 0;
      return true;
    });
  }, [cars, byCarId, fleetFilter, fleetSearch]);

  const fleetLabels = { all: { en: "All", fr: "Tout" }, due_soon: { en: "Due soon", fr: "Bientôt dû" }, with_history: { en: "With logs", fr: "Avec historique" }, no_history: { en: "No logs", fr: "Sans historique" } };

  const openModal = (car) => { setModalCar(car); setForm({ ...BLANK, rentalId: car._id }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setModalCar(null); setForm(BLANK); };

  const handleSave = async () => {
    if (!form.rentalId || !form.date || form.cost === "") { Alert.alert("Error", pick("Date and cost are required.", "Date et coût requis.")); return; }
    const costNum = Number(form.cost);
    if (Number.isNaN(costNum) || costNum < 0) { Alert.alert("Error", pick("Invalid cost.", "Coût invalide.")); return; }
    setSaving(true);
    try {
      await createMaintenanceRecord({ rentalId: form.rentalId, type: form.type, cost: costNum, date: form.date, mileageAtService: form.mileageAtService ? Number(form.mileageAtService) : undefined, nextServiceMileage: form.nextServiceMileage ? Number(form.nextServiceMileage) : undefined, nextServiceDate: form.nextServiceDate || undefined, provider: form.provider || undefined, notes: form.notes || undefined });
      closeModal(); await load();
    } catch (e) { Alert.alert("Error", getApiErrorMessage(e, t.saveFail)); }
    finally { setSaving(false); }
  };

  if (auth?.role !== "rental_owner") {
    return (
      <View style={[S.center, { backgroundColor: C.bg }]}>
        <View style={[S.deniedOrb, { borderColor: isDark ? "rgba(124,107,255,0.3)" : "rgba(98,72,232,0.22)" }]}>
          <Ionicons name="construct-outline" size={40} color={C.primary} />
        </View>
        <Text style={[S.deniedTitle, { color: titleColor }]}>{t.accessDenied}</Text>
        <TouchableOpacity onPress={() => router.replace("/(rental-owner)/profile")} activeOpacity={0.9}>
          <LinearGradient colors={ctaGrad} style={S.ctaBtn}><Text style={S.ctaBtnText}>{t.backProfile}</Text></LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) return <PageLoader />;

  const STATS = [
    { icon: "car-sport-outline",    val: cars.length,                                      lbl: t.summary.cars,    accent: C.primary },
    { icon: "document-text-outline",val: records.length,                                   lbl: t.summary.records, accent: "#38bdf8"  },
    { icon: "wallet-outline",       val: `${Number(totalCost).toLocaleString(numberLocale)} MAD`, lbl: t.summary.total,   accent: C.primary },
    { icon: "alert-circle-outline", val: dueSoonCount,                                     lbl: t.summary.dueSoon, accent: dueSoonCount > 0 ? "#f59e0b" : subColor },
  ];

  const Header = (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>

      {/* ── Hero ── */}
      <LinearGradient colors={heroBg} style={S.hero}>
        <View style={[S.heroBar, { backgroundColor: C.primary }]} />
        <Text style={[S.eyebrow, { color: C.primary }]}>{t.eyebrow}</Text>
        <Text style={[S.pageTitle, { color: titleColor }]}>{t.title}</Text>
        <Text style={[S.pageSub, { color: subColor }]}>{t.sub}</Text>

        {/* 2×2 stat grid */}
        <View style={S.statGrid}>
          {STATS.map(({ icon, val, lbl, accent }) => (
            <LinearGradient
              key={lbl}
              colors={isDark ? ["rgba(255,255,255,0.07)", "rgba(255,255,255,0.02)"] : ["rgba(255,255,255,0.98)", "rgba(248,250,252,0.9)"]}
              style={[S.statCell, { borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.07)" }]}
            >
              <View style={[S.statIconWrap, { backgroundColor: `${accent}22` }]}>
                <Ionicons name={icon} size={18} color={accent} />
              </View>
              <Text style={[S.statNum, { color: accent === subColor ? subColor : accent }]}>{val}</Text>
              <Text style={[S.statLbl, { color: subColor }]}>{lbl}</Text>
            </LinearGradient>
          ))}
        </View>
      </LinearGradient>

      {/* ── Due-soon banner ── */}
      {dueSoonCount > 0 && (
        <View style={S.dueBanner}>
          <Ionicons name="warning-outline" size={16} color="#f59e0b" />
          <Text style={S.dueBannerText}>
            {dueSoonCount} {t.summary.dueSoon} — {pick("service overdue soon", "entretien bientôt dû")}
          </Text>
        </View>
      )}

      {/* ── Search + filter panel ── */}
      <LinearGradient
        colors={isDark ? ["rgba(20,18,35,0.97)", "rgba(12,14,28,0.99)"] : ["#fff", "#f1f5f9"]}
        style={[S.filterPanel, { borderColor: isDark ? "rgba(124,107,255,0.16)" : "rgba(98,72,232,0.1)" }]}
      >
        <View style={[S.searchRow, { borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)", backgroundColor: isDark ? "rgba(0,0,0,0.22)" : "rgba(255,255,255,0.85)" }]}>
          <Ionicons name="search-outline" size={18} color={C.muted} />
          <TextInput value={fleetSearch} onChangeText={setFleetSearch} placeholder={pick("Search vehicle…", "Rechercher…")} placeholderTextColor={C.label} style={[S.searchInput, { color: titleColor }]} />
          {fleetSearch.length > 0 && <TouchableOpacity onPress={() => setFleetSearch("")} hitSlop={10}><Ionicons name="close-circle" size={20} color={C.muted} /></TouchableOpacity>}
        </View>
        <Text style={[S.filterLabel, { color: subColor }]}>{pick("Filter fleet", "Filtrer le parc")}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, flexDirection: "row" }}>
          {FLEET_FILTERS.map((key) => {
            const on = fleetFilter === key;
            const label = fr ? fleetLabels[key].fr : fleetLabels[key].en;
            return (
              <TouchableOpacity key={key} onPress={() => setFleetFilter(key)} activeOpacity={0.85}>
                {on
                  ? <LinearGradient colors={ctaGrad} style={S.chipOn}><Text style={S.chipOnTxt}>{label}</Text></LinearGradient>
                  : <View style={[S.chipOff, { borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)", backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)" }]}><Text style={[S.chipOffTxt, { color: subColor }]}>{label}</Text></View>
                }
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {(fleetFilter !== "all" || fleetSearch.trim().length > 0) && (
          <TouchableOpacity onPress={() => { setFleetFilter("all"); setFleetSearch(""); }} style={{ marginTop: 10 }}>
            <Text style={{ color: C.primary, fontSize: 13, fontWeight: "700" }}>{pick("Clear filters", "Réinitialiser")}</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* No cars */}
      {cars.length === 0 && (
        <View style={[S.emptyBox, { borderColor: isDark ? "rgba(124,107,255,0.2)" : "rgba(98,72,232,0.12)" }]}>
          <LinearGradient colors={isDark ? ["rgba(124,107,255,0.1)", "transparent"] : ["rgba(98,72,232,0.07)", "transparent"]} style={StyleSheet.absoluteFill} />
          <Ionicons name="car-outline" size={44} color={C.muted} />
          <Text style={[S.emptyTitle, { color: titleColor }]}>{t.emptyFleet}</Text>
          <TouchableOpacity onPress={() => router.push("/add-rental")} activeOpacity={0.9} style={{ marginTop: 16 }}>
            <LinearGradient colors={ctaGrad} style={S.ctaBtn}>
              <Text style={S.ctaBtnText}>{pick("Add rental", "Ajouter")}</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* No matches */}
      {cars.length > 0 && filteredCars.length === 0 && (
        <View style={[S.emptyBox, { borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.07)" }]}>
          <Ionicons name="funnel-outline" size={36} color={C.muted} />
          <Text style={[S.emptyTitle, { color: titleColor }]}>{pick("No matches", "Aucun résultat")}</Text>
          <Text style={[S.emptySub, { color: subColor }]}>{pick("Adjust your search or filter.", "Ajustez la recherche.")}</Text>
        </View>
      )}

      {cars.length > 0 && filteredCars.length > 0 && (
        <Text style={[S.sectionLabel, { color: subColor }]}>
          {filteredCars.length} {t.summary.cars}
        </Text>
      )}
    </Animated.View>
  );

  return (
    <View style={[S.screen, { backgroundColor: C.bg }]}>
      <FlatList
        data={filteredCars}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
        ListHeaderComponent={Header}
        renderItem={({ item: car, index }) => {
          const carRecs = byCarId[car._id] || [];
          const carCost = carRecs.reduce((s, r) => s + (r.cost || 0), 0);
          const uri     = resolveMediaUrl(car.images?.[0]);
          const due     = carHasDueSoon(carRecs);
          const lastTypes = [...new Set(carRecs.map((r) => r.type))].slice(0, 3);

          return (
            <View style={[S.card, { borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.07)", backgroundColor: isDark ? C.card : "#fff" }]}>

              {/* ── Hero image ── */}
              <Pressable onPress={() => router.push(`/maintenance/${car._id}`)} style={({ pressed }) => [S.cardHero, pressed && { opacity: 0.93 }]}>
                {uri
                  ? <Image source={{ uri }} style={S.cardHeroImg} resizeMode="cover" />
                  : (
                    <LinearGradient
                      colors={isDark ? ["#1a1830", "#0f0e1a"] : ["#e8eeff", "#f0f4ff"]}
                      style={[S.cardHeroImg, { alignItems: "center", justifyContent: "center" }]}
                    >
                      <Ionicons name="car-sport-outline" size={44} color={isDark ? "rgba(124,107,255,0.5)" : "rgba(98,72,232,0.35)"} />
                    </LinearGradient>
                  )
                }
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.15)", "rgba(0,0,0,0.78)"]}
                  style={StyleSheet.absoluteFill}
                />

                {/* Due badge */}
                {due && (
                  <View style={S.cardDueBadge}>
                    <Ionicons name="alert-circle" size={11} color="#f59e0b" />
                    <Text style={S.cardDueBadgeTxt}>{pick("Due soon", "Bientôt dû")}</Text>
                  </View>
                )}

                {/* Navigate hint */}
                <View style={S.cardChevron}>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.85)" />
                </View>

                {/* Car name overlay */}
                <View style={S.cardHeroText}>
                  <Text style={S.cardHeroTitle} numberOfLines={1}>{car.title || `${car.brand} ${car.model}`}</Text>
                  <Text style={S.cardHeroMeta} numberOfLines={1}>{car.brand} {car.model} · {car.year}{car.city ? ` · ${car.city}` : ""}</Text>
                </View>
              </Pressable>

              {/* ── Card body ── */}
              <View style={[S.cardBody, { borderTopColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.05)" }]}>
                <View style={S.cardBodyRow}>
                  {/* Record count pill */}
                  <View style={[S.infoPill, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.05)" }]}>
                    <Ionicons name="document-text-outline" size={13} color={subColor} />
                    <Text style={[S.infoPillTxt, { color: titleColor }]}>{carRecs.length} {t.listRecordsCount || "records"}</Text>
                  </View>
                  {carCost > 0 && (
                    <View style={[S.infoPill, { backgroundColor: isDark ? "rgba(124,107,255,0.14)" : "rgba(98,72,232,0.08)" }]}>
                      <Ionicons name="wallet-outline" size={13} color={C.primary} />
                      <Text style={[S.infoPillTxt, { color: C.primary }]}>{Number(carCost).toLocaleString(numberLocale)} MAD</Text>
                    </View>
                  )}
                </View>

                {/* Last service type dots */}
                {lastTypes.length > 0 && (
                  <View style={S.typeDots}>
                    {lastTypes.map((typ) => {
                      const m = TYPE_META[typ] || TYPE_META.other;
                      return (
                        <View key={typ} style={[S.typeDot, { backgroundColor: m.bg, borderColor: `${m.color}44` }]}>
                          <Ionicons name={m.icon} size={11} color={m.color} />
                        </View>
                      );
                    })}
                    {lastTypes.length > 0 && <Text style={[S.typeDotsHint, { color: subColor }]}>{pick("Recent services", "Services récents")}</Text>}
                  </View>
                )}
              </View>

              {/* ── Add button ── */}
              <TouchableOpacity onPress={() => openModal(car)} activeOpacity={0.88}>
                <LinearGradient
                  colors={isDark ? ["rgba(124,107,255,0.18)", "rgba(124,107,255,0.06)"] : ["rgba(98,72,232,0.1)", "rgba(98,72,232,0.03)"]}
                  style={[S.addBtn, { borderTopColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.05)" }]}
                >
                  <Ionicons name="add-circle-outline" size={19} color={C.primary} />
                  <Text style={[S.addBtnTxt, { color: C.primary }]}>{t.addBtn}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* ── Add Record Modal ── */}
      <Modal visible={modalOpen} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={S.modalRoot}>
          <Pressable style={S.modalBackdrop} onPress={closeModal} />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ maxHeight: "92%", width: "100%" }}>
            <View style={[S.modalSheet, { backgroundColor: isDark ? "#0f0e1a" : "#fff", borderColor: isDark ? "rgba(124,107,255,0.2)" : "rgba(98,72,232,0.15)" }]}>

              {/* Handle + header */}
              <LinearGradient colors={isDark ? ["#18152e", "#0f0e1a"] : ["#f5f3ff", "#fff"]} style={S.modalHeader}>
                <View style={S.modalGrab}><View style={[S.modalGrabBar, { backgroundColor: isDark ? "rgba(255,255,255,0.18)" : "rgba(15,23,42,0.14)" }]} /></View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20 }}>
                  <View style={[S.modalIconWrap, { backgroundColor: isDark ? "rgba(124,107,255,0.15)" : "rgba(98,72,232,0.1)" }]}>
                    <Ionicons name="construct-outline" size={20} color={C.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[S.modalTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>{t.modal.title}</Text>
                    {modalCar && <Text style={[S.modalSub, { color: subColor }]}>{modalCar.title}</Text>}
                  </View>
                  <TouchableOpacity onPress={closeModal} hitSlop={10} style={[S.modalCloseBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.05)" }]}>
                    <Ionicons name="close" size={18} color={subColor} />
                  </TouchableOpacity>
                </View>
              </LinearGradient>

              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={S.modalBody}>

                {/* Type selector — color coded */}
                <Text style={[S.fieldLabel, { color: subColor }]}>{t.modal.serviceType}</Text>
                <View style={S.typeGrid}>
                  {TYPE_OPTIONS.map((typ) => {
                    const m = TYPE_META[typ] || TYPE_META.other;
                    const active = form.type === typ;
                    return (
                      <TouchableOpacity
                        key={typ}
                        onPress={() => setForm((p) => ({ ...p, type: typ }))}
                        activeOpacity={0.8}
                        style={[
                          S.typeChip,
                          { borderColor: active ? m.color : isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)", backgroundColor: active ? m.bg : isDark ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.03)" },
                        ]}
                      >
                        <Ionicons name={m.icon} size={15} color={active ? m.color : subColor} />
                        <Text style={[S.typeChipTxt, { color: active ? m.color : subColor, fontWeight: active ? "800" : "600" }]}>{t.types[typ]}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Service details section */}
                <Text style={[S.sectionDivider, { color: C.primary, borderBottomColor: isDark ? "rgba(124,107,255,0.18)" : "rgba(98,72,232,0.12)" }]}>{pick("Service details", "Détails du service")}</Text>
                <View style={S.row2}>
                  <View style={{ flex: 1 }}>
                    <Text style={[S.fieldLabel, { color: subColor }]}>{t.modal.date}</Text>
                    <TextInput style={[S.input, { borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc", color: isDark ? "#f8fafc" : "#0f172a" }]} value={form.date} onChangeText={(v) => setForm((p) => ({ ...p, date: v }))} placeholder="YYYY-MM-DD" placeholderTextColor={subColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[S.fieldLabel, { color: subColor }]}>{t.modal.cost}</Text>
                    <TextInput style={[S.input, { borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc", color: isDark ? "#f8fafc" : "#0f172a" }]} value={String(form.cost)} onChangeText={(v) => setForm((p) => ({ ...p, cost: v }))} placeholder={t.modal.costPh} placeholderTextColor={subColor} keyboardType="decimal-pad" />
                  </View>
                </View>
                <View style={S.row2}>
                  <View style={{ flex: 1 }}>
                    <Text style={[S.fieldLabel, { color: subColor }]}>{t.modal.mileage}</Text>
                    <TextInput style={[S.input, { borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc", color: isDark ? "#f8fafc" : "#0f172a" }]} value={String(form.mileageAtService)} onChangeText={(v) => setForm((p) => ({ ...p, mileageAtService: v }))} placeholder={t.modal.mileagePh} placeholderTextColor={subColor} keyboardType="number-pad" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[S.fieldLabel, { color: subColor }]}>{t.modal.provider}</Text>
                    <TextInput style={[S.input, { borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc", color: isDark ? "#f8fafc" : "#0f172a" }]} value={form.provider} onChangeText={(v) => setForm((p) => ({ ...p, provider: v }))} placeholder={t.modal.providerPh} placeholderTextColor={subColor} />
                  </View>
                </View>

                {/* Next service */}
                <Text style={[S.sectionDivider, { color: C.primary, borderBottomColor: isDark ? "rgba(124,107,255,0.18)" : "rgba(98,72,232,0.12)" }]}>{pick("Next service", "Prochain entretien")}</Text>
                <View style={S.row2}>
                  <View style={{ flex: 1 }}>
                    <Text style={[S.fieldLabel, { color: subColor }]}>{t.modal.nextDate}</Text>
                    <TextInput style={[S.input, { borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc", color: isDark ? "#f8fafc" : "#0f172a" }]} value={form.nextServiceDate} onChangeText={(v) => setForm((p) => ({ ...p, nextServiceDate: v }))} placeholder="YYYY-MM-DD" placeholderTextColor={subColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[S.fieldLabel, { color: subColor }]}>{t.modal.nextMileage}</Text>
                    <TextInput style={[S.input, { borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc", color: isDark ? "#f8fafc" : "#0f172a" }]} value={String(form.nextServiceMileage)} onChangeText={(v) => setForm((p) => ({ ...p, nextServiceMileage: v }))} placeholder={t.modal.nextMileagePh} placeholderTextColor={subColor} keyboardType="number-pad" />
                  </View>
                </View>

                {/* Notes */}
                <Text style={[S.fieldLabel, { color: subColor, marginTop: 4 }]}>{t.modal.notes}</Text>
                <TextInput style={[S.input, S.textarea, { borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc", color: isDark ? "#f8fafc" : "#0f172a" }]} value={form.notes} onChangeText={(v) => setForm((p) => ({ ...p, notes: v }))} placeholder={t.modal.notesPh} placeholderTextColor={subColor} multiline />

                <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.88}>
                  <LinearGradient colors={ctaGrad} style={[S.saveBtn, saving && { opacity: 0.6 }]}>
                    <Text style={S.saveBtnTxt}>{saving ? t.modal.saving : t.modal.save}</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={closeModal} style={{ paddingVertical: 16, alignItems: "center" }}>
                  <Text style={{ color: subColor, fontWeight: "700", fontSize: 15 }}>{pick("Cancel", "Annuler")}</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const S = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  deniedOrb: { width: 88, height: 88, borderRadius: 28, alignItems: "center", justifyContent: "center", borderWidth: 1.5, backgroundColor: "rgba(124,107,255,0.07)", marginBottom: 16 },
  deniedTitle: { fontSize: 16, fontWeight: "700", textAlign: "center", maxWidth: 260, marginBottom: 8 },
  ctaBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  ctaBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },

  /* hero */
  hero: { borderRadius: 22, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: "rgba(124,107,255,0.16)", overflow: "hidden" },
  heroBar: { position: "absolute", left: 0, top: 20, bottom: 20, width: 4, borderRadius: 2 },
  eyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6, marginLeft: 8 },
  pageTitle: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5, marginLeft: 8 },
  pageSub: { fontSize: 13, marginTop: 6, marginBottom: 16, marginLeft: 8, lineHeight: 20 },

  /* stat grid */
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCell: { flex: 1, minWidth: "44%", borderRadius: 16, borderWidth: 1, padding: 14, gap: 6 },
  statIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statNum: { fontSize: 20, fontWeight: "800", letterSpacing: -0.4 },
  statLbl: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },

  /* due banner */
  dueBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(245,158,11,0.12)", borderWidth: 1, borderColor: "rgba(245,158,11,0.3)", borderRadius: 14, padding: 12, marginBottom: 12 },
  dueBannerText: { color: "#f59e0b", fontSize: 13, fontWeight: "700", flex: 1 },

  /* filters */
  filterPanel: { borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1 },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14 },
  searchInput: { flex: 1, fontSize: 15, fontWeight: "500", padding: 0 },
  filterLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 },
  chipOn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 },
  chipOnTxt: { color: "#fff", fontWeight: "800", fontSize: 12 },
  chipOff: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1 },
  chipOffTxt: { fontWeight: "700", fontSize: 12 },

  /* section label */
  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, marginBottom: 10, marginTop: 2 },

  /* empty */
  emptyBox: { padding: 36, borderRadius: 22, borderWidth: 1, alignItems: "center", marginBottom: 16, overflow: "hidden" },
  emptyTitle: { fontSize: 16, fontWeight: "800", marginTop: 14, textAlign: "center" },
  emptySub: { fontSize: 13, marginTop: 6, textAlign: "center" },

  /* card */
  card: { borderRadius: 22, marginBottom: 16, borderWidth: 1, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 5 },
  cardHero: { height: 158, overflow: "hidden" },
  cardHeroImg: { width: "100%", height: 158 },
  cardDueBadge: { position: "absolute", top: 12, left: 12, flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(245,158,11,0.25)", borderWidth: 1, borderColor: "rgba(245,158,11,0.5)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99 },
  cardDueBadgeTxt: { color: "#f59e0b", fontSize: 10, fontWeight: "800" },
  cardChevron: { position: "absolute", top: 12, right: 12, width: 30, height: 30, borderRadius: 99, backgroundColor: "rgba(0,0,0,0.3)", alignItems: "center", justifyContent: "center" },
  cardHeroText: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 14 },
  cardHeroTitle: { color: "#fff", fontSize: 17, fontWeight: "800", letterSpacing: -0.3, textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 },
  cardHeroMeta: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 3, fontWeight: "600" },
  cardBody: { paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: 1 },
  cardBodyRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  infoPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99 },
  infoPillTxt: { fontSize: 12, fontWeight: "700" },
  typeDots: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  typeDot: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99, borderWidth: 1 },
  typeDotsHint: { fontSize: 10, fontWeight: "600", marginLeft: 2 },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderTopWidth: 1 },
  addBtnTxt: { fontWeight: "800", fontSize: 14 },

  /* modal */
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.58)" },
  modalSheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, maxHeight: "92%", borderWidth: 1, overflow: "hidden" },
  modalHeader: { paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  modalGrab: { alignItems: "center", paddingTop: 12, paddingBottom: 16 },
  modalGrabBar: { width: 40, height: 4, borderRadius: 2 },
  modalIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  modalTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  modalSub: { fontSize: 13, marginTop: 3 },
  modalCloseBtn: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  modalBody: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 20 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  typeChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, minWidth: "30%", flex: 1 },
  typeChipTxt: { fontSize: 11, letterSpacing: 0.2 },
  sectionDivider: { fontSize: 10, fontWeight: "800", letterSpacing: 1.3, textTransform: "uppercase", paddingBottom: 10, borderBottomWidth: 1, marginBottom: 12, marginTop: 8 },
  fieldLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 7, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15 },
  textarea: { minHeight: 84, textAlignVertical: "top" },
  row2: { flexDirection: "row", gap: 10 },
  saveBtn: { borderRadius: 15, paddingVertical: 17, alignItems: "center", marginTop: 18 },
  saveBtnTxt: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
