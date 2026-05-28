import { useEffect, useMemo, useState, useRef } from "react";
import { PageLoader } from '../../src/components/AppLoadingScreen';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Animated,
  Easing,
  ScrollView,
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

const TYPE_OPTIONS = ["oil_change", "tire_rotation", "inspection", "repair", "cleaning", "other"];

const BLANK = {
  rentalId: "",
  type: "oil_change",
  cost: "",
  date: "",
  mileageAtService: "",
  provider: "",
  notes: "",
  nextServiceDate: "",
  nextServiceMileage: "",
};

const FLEET_FILTERS = ["all", "due_soon", "with_history", "no_history"];

function isDueSoon(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const diff = (d - new Date()) / 86400000;
  return diff >= 0 && diff <= 7;
}

function carHasDueSoon(carRecords) {
  return carRecords.some((r) => isDueSoon(r.nextServiceDate));
}

export default function MaintenanceScreen() {
  const { auth } = useAuth();
  const { lang, copy, pick, numberLocale } = useAppLang();
  const t = copy.maintenance;
  const { colors: C, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fr = lang === "fr";
  const s = useMemo(() => createStyles(C, isDark), [C, isDark]);

  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#94a3b8" : "#64748b";
  const heroGrad = isDark
    ? ["#080514", "#120b22", "#0a1520"]
    : ["#faf5ff", "#ecfeff", "#f8fafc"];
  const ctaGrad = isDark ? ["#7c6bff", "#5b4ddb"] : ["#6248e8", "#4f46e5"];

  const [cars, setCars] = useState([]);
  const [records, setRecords] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCar, setModalCar] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [fleetFilter, setFleetFilter] = useState("all");
  const [fleetSearch, setFleetSearch] = useState("");

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(20)).current;

  async function load() {
    try {
      const [mainRes, carRes] = await Promise.all([getAllMaintenance(), getOwnerRentals()]);
      const data = mainRes.data;
      const allRecords = (data.byRental || []).flatMap((g) =>
        (g.records || []).map((r) => ({ ...r, _rentalTitle: g.rental?.title })),
      );
      setRecords(allRecords);
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

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (loading) return;
    headerFade.setValue(0);
    headerSlide.setValue(20);
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(headerSlide, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [loading, headerFade, headerSlide]);

  const byCarId = useMemo(() => {
    return records.reduce((acc, r) => {
      const id = (r.rentalId?._id || r.rentalId)?.toString();
      if (id) (acc[id] = acc[id] || []).push(r);
      return acc;
    }, {});
  }, [records]);

  const dueSoonCount = useMemo(() => records.filter((r) => isDueSoon(r.nextServiceDate)).length, [records]);

  const filteredCars = useMemo(() => {
    const q = fleetSearch.trim().toLowerCase();
    return cars.filter((car) => {
      const carRecords = byCarId[car._id] || [];
      if (q) {
        const hay = `${car.title || ""} ${car.brand || ""} ${car.model || ""} ${car.city || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (fleetFilter === "due_soon") return carHasDueSoon(carRecords);
      if (fleetFilter === "with_history") return carRecords.length > 0;
      if (fleetFilter === "no_history") return carRecords.length === 0;
      return true;
    });
  }, [cars, byCarId, fleetFilter, fleetSearch]);

  const fleetLabels = useMemo(
    () => ({
      all: { en: "All", fr: "Tout" },
      due_soon: { en: "Due soon", fr: "Bientôt dû" },
      with_history: { en: "With logs", fr: "Avec historique" },
      no_history: { en: "No logs yet", fr: "Sans historique" },
    }),
    [],
  );

  const openModal = (car) => {
    setModalCar(car);
    setForm({ ...BLANK, rentalId: car._id });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalCar(null);
    setForm(BLANK);
  };

  const handleSave = async () => {
    if (!form.rentalId || !form.date || form.cost === "" || form.cost === undefined) {
      Alert.alert("Error", pick("Date and cost are required.", "Date et coût requis."));
      return;
    }
    const costNum = Number(form.cost);
    if (Number.isNaN(costNum) || costNum < 0) {
      Alert.alert("Error", pick("Invalid cost.", "Coût invalide."));
      return;
    }
    setSaving(true);
    try {
      await createMaintenanceRecord({
        rentalId: form.rentalId,
        type: form.type,
        cost: costNum,
        date: form.date,
        mileageAtService: form.mileageAtService ? Number(form.mileageAtService) : undefined,
        nextServiceMileage: form.nextServiceMileage ? Number(form.nextServiceMileage) : undefined,
        nextServiceDate: form.nextServiceDate || undefined,
        provider: form.provider || undefined,
        notes: form.notes || undefined,
      });
      closeModal();
      await load();
    } catch (e) {
      Alert.alert("Error", getApiErrorMessage(e, t.saveFail));
    } finally {
      setSaving(false);
    }
  };

  const filterActive = fleetFilter !== "all" || fleetSearch.trim().length > 0;

  if (auth?.role !== "rental_owner") {
    return (
      <View style={[s.center, { backgroundColor: C.bg }]}>
        <LinearGradient
          colors={isDark ? ["rgba(124,107,255,0.2)", "transparent"] : ["rgba(98,72,232,0.12)", "transparent"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={s.deniedOrb}>
          <Ionicons name="construct-outline" size={52} color={C.primary} />
        </View>
        <Text style={[s.deniedTitle, { color: titleColor }]}>{t.accessDenied}</Text>
        <TouchableOpacity onPress={() => router.replace("/(rental-owner)/profile")} activeOpacity={0.9}>
          <LinearGradient colors={ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.backBtn}>
            <Text style={s.backBtnText}>{t.backProfile}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) return <PageLoader />;

  const statPills = [
    [cars.length, t.summary.cars, C.primary],
    [records.length, t.summary.records, C.accent],
    [Number(totalCost).toLocaleString(numberLocale), t.summary.total, C.primary],
    [dueSoonCount, t.summary.dueSoon, dueSoonCount > 0 ? "#f59e0b" : subColor],
  ];

  const SummaryHeader = (
    <Animated.View style={{ opacity: headerFade, transform: [{ translateY: headerSlide }] }}>
      <LinearGradient colors={heroGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
        <View style={s.heroAccentBar} />
        <Text style={[s.eyebrow, { color: C.primary }]}>{t.eyebrow}</Text>
        <Text style={[s.pageTitle, { color: titleColor }]}>{t.title}</Text>
        <Text style={[s.pageSub, { color: subColor }]}>{t.sub}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.statsScroll}>
          {statPills.map(([val, label, accent]) => (
            <LinearGradient
              key={label}
              colors={
                isDark
                  ? ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)"]
                  : ["rgba(255,255,255,0.98)", "rgba(248,250,252,0.92)"]
              }
              style={[s.statPill, { borderColor: isDark ? "rgba(124,107,255,0.28)" : "rgba(98,72,232,0.14)" }]}
            >
              <View style={[s.statPillDot, { backgroundColor: accent }]} />
              <Text style={[s.statPillNum, { color: accent === subColor ? titleColor : accent }]}>{val}</Text>
              <Text style={[s.statPillLbl, { color: subColor }]}>{label}</Text>
            </LinearGradient>
          ))}
        </ScrollView>
      </LinearGradient>

      <LinearGradient
        colors={isDark ? ["rgba(20,18,35,0.95)", "rgba(12,14,28,0.98)"] : ["#ffffff", "#f1f5f9"]}
        style={s.filterPanel}
      >
        <View style={[s.searchRow, { borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)" }]}>
          <Ionicons name="search-outline" size={18} color={C.muted} />
          <TextInput
            value={fleetSearch}
            onChangeText={setFleetSearch}
            placeholder={pick("Search vehicle, city…", "Rechercher véhicule, ville…")}
            placeholderTextColor={C.label}
            style={[s.searchInput, { color: titleColor }]}
          />
          {fleetSearch.length > 0 && (
            <TouchableOpacity onPress={() => setFleetSearch("")} hitSlop={10}>
              <Ionicons name="close-circle" size={20} color={C.muted} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={[s.filterLabel, { color: subColor }]}>{pick("Filter fleet", "Filtrer le parc")}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
          {FLEET_FILTERS.map((key) => {
            const on = fleetFilter === key;
            const label = fr ? fleetLabels[key].fr : fleetLabels[key].en;
            return (
              <TouchableOpacity key={key} onPress={() => setFleetFilter(key)} activeOpacity={0.85}>
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
        {filterActive && (
          <TouchableOpacity onPress={() => { setFleetFilter("all"); setFleetSearch(""); }} style={s.clearFilters}>
            <Text style={[s.clearFiltersText, { color: C.primary }]}>
              {pick("Clear filters", "Réinitialiser filtres")}
            </Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </Animated.View>
  );

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      <FlatList
        data={filteredCars}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[s.listContent, { paddingBottom: insets.bottom + 32 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />
        }
        ListHeaderComponent={
          <>
            {SummaryHeader}
            {cars.length === 0 && (
              <View style={s.emptyFleet}>
                <LinearGradient
                  colors={isDark ? ["rgba(124,107,255,0.12)", "rgba(56,189,248,0.06)"] : ["rgba(98,72,232,0.1)", "rgba(14,165,233,0.05)"]}
                  style={s.emptyFleetInner}
                >
                  <Ionicons name="car-outline" size={48} color={C.primary} />
                  <Text style={[s.emptyFleetText, { color: subColor }]}>{t.emptyFleet}</Text>
                  <TouchableOpacity onPress={() => router.push("/add-rental")} activeOpacity={0.9}>
                    <LinearGradient colors={ctaGrad} style={s.emptyFleetBtn}>
                      <Text style={s.emptyFleetBtnText}>{pick("Add rental", "Ajouter une location")}</Text>
                      <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}
            {cars.length > 0 && filteredCars.length === 0 && (
              <View style={s.noMatch}>
                <Ionicons name="funnel-outline" size={36} color={C.muted} />
                <Text style={[s.noMatchTitle, { color: titleColor }]}>{pick("No matches", "Aucun résultat")}</Text>
                <Text style={[s.noMatchSub, { color: subColor }]}>
                  {pick("Try a different search or filter.", "Ajustez la recherche ou les filtres.")}
                </Text>
              </View>
            )}
          </>
        }
        renderItem={({ item: car }) => {
          const carRecords = byCarId[car._id] || [];
          const carCost = carRecords.reduce((sum, r) => sum + (r.cost || 0), 0);
          const uri = resolveMediaUrl(car.images?.[0]);
          const due = carHasDueSoon(carRecords);
          return (
            <View style={s.card}>
              <Pressable
                onPress={() => router.push(`/maintenance/${car._id}`)}
                style={({ pressed }) => [s.cardMain, pressed && { opacity: 0.96 }]}
              >
                <LinearGradient
                  colors={isDark ? ["rgba(124,107,255,0.12)", "transparent"] : ["rgba(98,72,232,0.06)", "transparent"]}
                  style={s.cardThumbRing}
                >
                  {uri ? (
                    <Image source={{ uri }} style={s.cardThumb} resizeMode="cover" />
                  ) : (
                    <View style={s.cardThumbPh}>
                      <Ionicons name="car-sport-outline" size={32} color={C.muted} />
                    </View>
                  )}
                </LinearGradient>
                <View style={s.cardBody}>
                  <View style={s.cardTitleRow}>
                    <Text style={[s.cardTitle, { color: titleColor }]} numberOfLines={2}>
                      {car.title || `${car.brand} ${car.model}`}
                    </Text>
                    {due && (
                      <View style={s.dueBadge}>
                        <Ionicons name="alert-circle" size={12} color="#f59e0b" />
                        <Text style={s.dueBadgeText}>{pick("7d", "7j")}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[s.cardMeta, { color: subColor }]} numberOfLines={1}>
                    {car.brand} {car.model} · {car.year} · {car.city}
                  </Text>
                  <View style={s.pillRow}>
                    <View style={[s.miniPill, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.05)" }]}>
                      <Text style={[s.miniPillText, { color: titleColor }]}>
                        {carRecords.length} {t.listRecordsCount}
                      </Text>
                    </View>
                    {carRecords.length > 0 && (
                      <View style={[s.miniPill, { backgroundColor: isDark ? "rgba(124,107,255,0.15)" : "rgba(98,72,232,0.1)" }]}>
                        <Text style={[s.miniPillText, { color: C.primary }]}>
                          {Number(carCost).toLocaleString(numberLocale)} {t.mad}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[s.listHint, { color: subColor }]}>{t.listHint}</Text>
                </View>
                <View style={[s.chevronBtn, { borderColor: isDark ? "rgba(124,107,255,0.25)" : "rgba(98,72,232,0.2)" }]}>
                  <Ionicons name="chevron-forward" size={18} color={C.primary} />
                </View>
              </Pressable>
              <TouchableOpacity onPress={() => openModal(car)} activeOpacity={0.9} style={s.addBtn}>
                <LinearGradient
                  colors={isDark ? ["rgba(124,107,255,0.2)", "rgba(124,107,255,0.06)"] : ["rgba(98,72,232,0.14)", "rgba(98,72,232,0.04)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.addBtnInner}
                >
                  <Ionicons name="add-circle" size={20} color={C.primary} />
                  <Text style={[s.addBtnText, { color: C.primary }]}>{t.addBtn}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <Modal visible={modalOpen} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={s.modalRoot}>
          <Pressable style={s.modalBackdrop} onPress={closeModal} />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.modalKb}>
            <View style={[s.modalSheet, { borderColor: isDark ? "rgba(124,107,255,0.2)" : "rgba(98,72,232,0.15)" }]}>
              <LinearGradient
                colors={isDark ? ["#141028", "#0c0e18"] : ["#ffffff", "#f8fafc"]}
                style={s.modalHero}
              >
                <View style={s.modalGrab}>
                  <View style={[s.modalGrabBar, { backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(15,23,42,0.15)" }]} />
                </View>
                <Text style={[s.modalTitle, { color: titleColor }]}>{t.modal.title}</Text>
                {modalCar && <Text style={[s.modalSub, { color: subColor }]}>{modalCar.title}</Text>}
              </LinearGradient>
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={s.modalScroll}>
                <Text style={[s.fieldLabel, { color: C.label }]}>{t.modal.serviceType}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.typeScroll}>
                  {TYPE_OPTIONS.map((typ) => {
                    const active = form.type === typ;
                    return (
                      <TouchableOpacity
                        key={typ}
                        onPress={() => setForm((p) => ({ ...p, type: typ }))}
                        activeOpacity={0.85}
                      >
                        {active ? (
                          <LinearGradient colors={ctaGrad} style={s.typeChipActive}>
                            <Text style={s.typeChipTextActive}>{t.types[typ]}</Text>
                          </LinearGradient>
                        ) : (
                          <View style={[s.typeChip, { borderColor: C.border, backgroundColor: C.inputBg }]}>
                            <Text style={[s.typeChipText, { color: subColor }]}>{t.types[typ]}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <Text style={[s.fieldLabel, { color: C.label }]}>{t.modal.date}</Text>
                <TextInput
                  style={[s.input, { borderColor: C.border, backgroundColor: C.inputBg, color: titleColor }]}
                  value={form.date}
                  onChangeText={(v) => setForm((p) => ({ ...p, date: v }))}
                  placeholder="2025-06-01"
                  placeholderTextColor={C.label}
                />

                <View style={s.row2}>
                  <View style={s.row2Item}>
                    <Text style={[s.fieldLabel, { color: C.label }]}>{t.modal.cost}</Text>
                    <TextInput
                      style={[s.input, { borderColor: C.border, backgroundColor: C.inputBg, color: titleColor }]}
                      value={String(form.cost)}
                      onChangeText={(v) => setForm((p) => ({ ...p, cost: v }))}
                      placeholder={t.modal.costPh}
                      placeholderTextColor={C.label}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View style={s.row2Item}>
                    <Text style={[s.fieldLabel, { color: C.label }]}>{t.modal.mileage}</Text>
                    <TextInput
                      style={[s.input, { borderColor: C.border, backgroundColor: C.inputBg, color: titleColor }]}
                      value={String(form.mileageAtService)}
                      onChangeText={(v) => setForm((p) => ({ ...p, mileageAtService: v }))}
                      placeholder={t.modal.mileagePh}
                      placeholderTextColor={C.label}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                <Text style={[s.fieldLabel, { color: C.label }]}>{t.modal.provider}</Text>
                <TextInput
                  style={[s.input, { borderColor: C.border, backgroundColor: C.inputBg, color: titleColor }]}
                  value={form.provider}
                  onChangeText={(v) => setForm((p) => ({ ...p, provider: v }))}
                  placeholder={t.modal.providerPh}
                  placeholderTextColor={C.label}
                />

                <View style={s.row2}>
                  <View style={s.row2Item}>
                    <Text style={[s.fieldLabel, { color: C.label }]}>{t.modal.nextDate}</Text>
                    <TextInput
                      style={[s.input, { borderColor: C.border, backgroundColor: C.inputBg, color: titleColor }]}
                      value={form.nextServiceDate}
                      onChangeText={(v) => setForm((p) => ({ ...p, nextServiceDate: v }))}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={C.label}
                    />
                  </View>
                  <View style={s.row2Item}>
                    <Text style={[s.fieldLabel, { color: C.label }]}>{t.modal.nextMileage}</Text>
                    <TextInput
                      style={[s.input, { borderColor: C.border, backgroundColor: C.inputBg, color: titleColor }]}
                      value={String(form.nextServiceMileage)}
                      onChangeText={(v) => setForm((p) => ({ ...p, nextServiceMileage: v }))}
                      placeholder={t.modal.nextMileagePh}
                      placeholderTextColor={C.label}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                <Text style={[s.fieldLabel, { color: C.label }]}>{t.modal.notes}</Text>
                <TextInput
                  style={[s.input, s.textArea, { borderColor: C.border, backgroundColor: C.inputBg, color: titleColor }]}
                  value={form.notes}
                  onChangeText={(v) => setForm((p) => ({ ...p, notes: v }))}
                  placeholder={t.modal.notesPh}
                  placeholderTextColor={C.label}
                  multiline
                />

                <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.9}>
                  <LinearGradient colors={ctaGrad} style={[s.saveBtn, saving && { opacity: 0.65 }]}>
                    <Text style={s.saveBtnText}>{saving ? t.modal.saving : t.modal.save}</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={closeModal} style={s.cancelBtn}>
                  <Text style={[s.cancelBtnText, { color: subColor }]}>{pick("Cancel", "Annuler")}</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

function createStyles(C, isDark) {
  return StyleSheet.create({
    screen: { flex: 1 },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
    deniedOrb: {
      width: 100,
      height: 100,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: isDark ? "rgba(124,107,255,0.35)" : "rgba(98,72,232,0.28)",
      backgroundColor: isDark ? "rgba(124,107,255,0.08)" : "rgba(98,72,232,0.06)",
    },
    loaderRing: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: isDark ? "rgba(124,107,255,0.3)" : "rgba(98,72,232,0.25)",
    },
    loadingText: { marginTop: 16, fontSize: 14, fontWeight: "600" },
    deniedTitle: { fontSize: 18, fontWeight: "800", marginTop: 20, textAlign: "center", maxWidth: 280 },
    backBtn: { marginTop: 24, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
    backBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
    listContent: { paddingHorizontal: 16, paddingTop: 0 },
    hero: {
      borderRadius: 22,
      padding: 20,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? "rgba(124,107,255,0.22)" : "rgba(98,72,232,0.12)",
      overflow: "hidden",
    },
    heroAccentBar: {
      position: "absolute",
      left: 0,
      top: 18,
      bottom: 18,
      width: 4,
      borderRadius: 2,
      backgroundColor: C.primary,
    },
    eyebrow: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 2,
      textTransform: "uppercase",
      marginBottom: 8,
      marginLeft: 8,
    },
    pageTitle: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5, marginLeft: 8 },
    pageSub: { fontSize: 14, marginTop: 10, marginBottom: 14, lineHeight: 21, marginLeft: 8, fontWeight: "500" },
    statsScroll: { paddingLeft: 8, paddingRight: 4, gap: 10, paddingBottom: 4 },
    statPill: {
      width: 118,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderWidth: 1,
      marginRight: 10,
    },
    statPillDot: { width: 6, height: 6, borderRadius: 3, marginBottom: 10 },
    statPillNum: { fontSize: 20, fontWeight: "800", letterSpacing: -0.4 },
    statPillLbl: { fontSize: 9, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: "700" },
    filterPanel: {
      borderRadius: 20,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark ? "rgba(124,107,255,0.18)" : "rgba(98,72,232,0.12)",
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.8)",
    },
    searchInput: { flex: 1, fontSize: 15, fontWeight: "500", padding: 0 },
    filterLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase", marginTop: 14, marginBottom: 10 },
    chipsRow: { flexDirection: "row", gap: 8, alignItems: "center", flexWrap: "nowrap" },
    chipOn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 },
    chipOnText: { color: "#fff", fontWeight: "800", fontSize: 12 },
    chipOff: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.6)" },
    chipOffText: { fontWeight: "700", fontSize: 12 },
    clearFilters: { marginTop: 12, alignSelf: "flex-start" },
    clearFiltersText: { fontSize: 13, fontWeight: "700" },
    emptyFleet: { marginBottom: 16, borderRadius: 22, overflow: "hidden" },
    emptyFleetInner: {
      alignItems: "center",
      padding: 32,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: isDark ? "rgba(124,107,255,0.25)" : "rgba(98,72,232,0.18)",
    },
    emptyFleetText: { fontSize: 14, textAlign: "center", marginTop: 14, lineHeight: 21 },
    emptyFleetBtn: {
      marginTop: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 22,
      paddingVertical: 14,
      borderRadius: 14,
    },
    emptyFleetBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
    noMatch: { alignItems: "center", paddingVertical: 40, paddingHorizontal: 24 },
    noMatchTitle: { fontSize: 18, fontWeight: "800", marginTop: 12 },
    noMatchSub: { fontSize: 14, marginTop: 8, textAlign: "center" },
    card: {
      borderRadius: 22,
      marginBottom: 14,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.09)" : "rgba(15,23,42,0.08)",
      backgroundColor: isDark ? C.card : "#fff",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.3 : 0.07,
      shadowRadius: 18,
      elevation: 6,
    },
    cardMain: { flexDirection: "row", alignItems: "center", padding: 12, gap: 12 },
    cardThumbRing: {
      borderRadius: 18,
      padding: 3,
    },
    cardThumb: { width: 96, height: 96, borderRadius: 15 },
    cardThumbPh: {
      width: 96,
      height: 96,
      borderRadius: 15,
      backgroundColor: C.inputBg,
      alignItems: "center",
      justifyContent: "center",
    },
    cardBody: { flex: 1, minWidth: 0 },
    cardTitleRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
    cardTitle: { flex: 1, fontSize: 16, fontWeight: "800", letterSpacing: -0.2 },
    dueBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "rgba(245,158,11,0.15)",
      borderWidth: 1,
      borderColor: "rgba(245,158,11,0.4)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    dueBadgeText: { fontSize: 10, fontWeight: "800", color: "#f59e0b" },
    cardMeta: { fontSize: 12, marginTop: 6, fontWeight: "500" },
    pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
    miniPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
    miniPillText: { fontSize: 11, fontWeight: "800" },
    listHint: { fontSize: 10, marginTop: 10, fontStyle: "italic" },
    chevronBtn: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      backgroundColor: isDark ? "rgba(124,107,255,0.08)" : "rgba(98,72,232,0.06)",
    },
    addBtn: { overflow: "hidden" },
    addBtnInner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)",
    },
    addBtnText: { fontWeight: "800", fontSize: 14 },
    modalRoot: { flex: 1, justifyContent: "flex-end" },
    modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
    modalKb: { maxHeight: "92%", width: "100%" },
    modalSheet: {
      backgroundColor: C.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: "92%",
      borderWidth: 1,
      overflow: "hidden",
    },
    modalHero: {
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)",
    },
    modalScroll: { paddingHorizontal: 20, paddingBottom: 32 },
    modalGrab: { alignItems: "center", paddingVertical: 12 },
    modalGrabBar: { width: 44, height: 5, borderRadius: 3 },
    modalTitle: { fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
    modalSub: { fontSize: 14, marginBottom: 4, marginTop: 6 },
    fieldLabel: { fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8, marginTop: 14, fontWeight: "700" },
    typeScroll: { marginBottom: 4, maxHeight: 44 },
    typeChip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 1,
      marginRight: 8,
    },
    typeChipActive: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      marginRight: 8,
    },
    typeChipText: { fontSize: 12, fontWeight: "600" },
    typeChipTextActive: { color: "#fff", fontSize: 12, fontWeight: "800" },
    input: {
      borderWidth: 1,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 14,
      fontSize: 15,
    },
    textArea: { minHeight: 88, textAlignVertical: "top" },
    row2: { flexDirection: "row", gap: 12 },
    row2Item: { flex: 1 },
    saveBtn: { borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 20 },
    saveBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
    cancelBtn: { paddingVertical: 16, alignItems: "center" },
    cancelBtnText: { fontWeight: "700", fontSize: 15 },
  });
}
