import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Alert,
  RefreshControl,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { isGarageSetupDeferred } from "../../utils/garageSetupStorage";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAppLang } from "../../context/AppLangContext";
import {
  getMyCar,
  deleteCar,
  patchMileage,
  patchGarageReminders,
  getServiceLogs,
  createServiceLog,
  deleteServiceLog,
} from "../../api/userCar";
import { getRecommendations } from "../../utils/garageRecommendations";
import { buildGarageTimeline } from "../../utils/garageTimeline";
import { computeGarageCosts } from "../../utils/garageCosts";
import { syncGarageLocalReminders, cancelGarageLocalReminders } from "../../utils/garageLocalReminders";
import {
  GarageTabBar,
  GarageStatusCard,
  GarageTodoList,
  GarageSimpleRow,
  GarageGroupCard,
  GarageMileageSimple,
  GarageRemindersSimple,
  GarageActionGrid,
  GarageBudgetSimple,
  GarageServiceSimple,
  GarageTipsSimple,
  AddServiceLogModal,
} from "./GarageSimpleUI";
import { computeStatuses, buildTrackItems, countAlerts, soonestDeadline } from "../../utils/garageStatus";
import { PageLoader } from "../AppLoadingScreen";
import AppBrandMark from "../AppBrandMark";

const { width: SW } = Dimensions.get("window");

const ACCENTS = {
  cyan: {
    primary: { dark: "#38bdf8", light: "#0284c7" },
    grad: { dark: ["#38bdf8", "#0ea5e9", "#0284c7"], light: ["#0ea5e9", "#0284c7", "#0369a1"] },
    hero: { dark: ["#03040a", "#0a1628", "#051018"], light: ["#f0f9ff", "#e0f2fe", "#f8fafc"] },
    glass: { dark: "rgba(56,189,248,0.14)", light: "rgba(2,132,199,0.1)" },
    border: { dark: "rgba(56,189,248,0.28)", light: "rgba(2,132,199,0.18)" },
  },
  purple: {
    primary: { dark: "#a78bfa", light: "#6248e8" },
    grad: { dark: ["#7c6bff", "#5b4ddb", "#4338ca"], light: ["#6248e8", "#4f46e5", "#4338ca"] },
    hero: { dark: ["#03040a", "#120a24", "#05060f"], light: ["#faf5ff", "#e0f2fe", "#f8fafc"] },
    glass: { dark: "rgba(124,107,255,0.14)", light: "rgba(98,72,232,0.1)" },
    border: { dark: "rgba(124,107,255,0.28)", light: "rgba(98,72,232,0.18)" },
  },
};

function GlowOrb({ scaleAnim, colors, style }) {
  return (
    <Animated.View pointerEvents="none" style={[style, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

/**
 * Elite garage command center — shared by car-owner tab & mon-garage stack.
 * @param {'tab'|'stack'} mode
 * @param {'cyan'|'purple'} accentKey
 * @param {string} sellPath — route for sell CTA
 * @param {boolean} promptSetupWhenEmpty — first-visit add-car prompt (car-owner tab)
 */
export default function GarageEliteScreen({
  mode = "tab",
  accentKey = "cyan",
  sellPath = "/new-sale",
  promptSetupWhenEmpty = false,
}) {
  const { auth } = useAuth();
  const { colors: C, isDark } = useTheme();
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = ACCENTS[accentKey] || ACCENTS.cyan;
  const accent = isDark ? theme.primary.dark : theme.primary.light;
  const primaryGrad = isDark ? theme.grad.dark : theme.grad.light;
  const heroGrad = isDark ? theme.hero.dark : theme.hero.light;

  const [car, setCar] = useState(null);
  const [serviceLogs, setServiceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("today");
  const [mileageSaving, setMileageSaving] = useState(false);
  const [logModal, setLogModal] = useState(false);
  const [logSaving, setLogSaving] = useState(false);
  const [remindersOn, setRemindersOn] = useState(true);

  const setupPrompted = useRef(false);
  const orbPulse = useRef(new Animated.Value(1)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(20)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#94a3b8" : "#475569";
  const bgColor = C.bg ?? (isDark ? "#05060f" : "#f8fafc");

  const load = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [carRes, logsRes] = await Promise.all([getMyCar(), getServiceLogs().catch(() => ({ data: [] }))]);
      const c = carRes.data;
      setCar(c);
      setServiceLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
      if (c) {
        const on = c.garageSettings?.remindersEnabled !== false;
        setRemindersOn(on);
        syncGarageLocalReminders(c, fr, on).catch(() => {});
      }
    } catch {
      setCar(null);
      setServiceLogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fr]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (car) setupPrompted.current = false;
  }, [car]);

  useFocusEffect(
    useCallback(() => {
      if (car?._id) load(true);
    }, [car?._id, load])
  );

  useFocusEffect(
    useCallback(() => {
      if (!promptSetupWhenEmpty || loading || car || !auth?._id) return;
      let active = true;
      (async () => {
        const deferred = await isGarageSetupDeferred(auth._id);
        if (!active || deferred || setupPrompted.current) return;
        setupPrompted.current = true;
        router.push("/add-car?required=1");
      })();
      return () => {
        active = false;
      };
    }, [promptSetupWhenEmpty, loading, car, auth?._id, router])
  );

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, { toValue: 1.08, duration: 5200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orbPulse, { toValue: 1, duration: 5200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [orbPulse]);

  useEffect(() => {
    if (loading) return;
    Animated.parallel([
      Animated.timing(heroOpacity, { toValue: 1, duration: 550, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(heroSlide, { toValue: 0, friction: 9, tension: 48, useNativeDriver: true }),
      Animated.timing(contentOpacity, { toValue: 1, duration: 480, delay: 120, useNativeDriver: true }),
    ]).start();
  }, [loading, heroOpacity, heroSlide, contentOpacity]);

  const statuses = useMemo(() => computeStatuses(car), [car]);
  const trackItems = useMemo(() => buildTrackItems(car, statuses, fr), [car, statuses, fr]);
  const alertCount = useMemo(() => countAlerts(trackItems), [trackItems]);
  const nextDue = useMemo(() => soonestDeadline(trackItems, fr), [trackItems, fr]);
  const recommendations = useMemo(() => (car ? getRecommendations(car, fr) : []), [car, fr]);
  const timeline = useMemo(() => buildGarageTimeline(car, statuses, fr, 30), [car, statuses, fr]);
  const costs = useMemo(() => computeGarageCosts(car, serviceLogs, fr), [car, serviceLogs, fr]);
  const todoEvents = useMemo(() => timeline.flat || [], [timeline]);
  const paperItems = useMemo(() => trackItems.filter((i) => i.category === "papers"), [trackItems]);
  const mechItems = useMemo(() => trackItems.filter((i) => i.category === "mechanical"), [trackItems]);

  const goEdit = useCallback(() => router.push({ pathname: "/add-car", params: { id: car?._id } }), [car, router]);
  const goEditItem = useCallback(
    (item) => {
      const field = typeof item === "string" ? item : item?.id;
      if (!field) return;
      router.push({ pathname: "/edit-garage-item", params: { field } });
    },
    [router]
  );
  const goAdd = useCallback(() => router.push("/add-car"), [router]);
  const goEstimate = useCallback(
    () =>
      router.push({
        pathname: "/estimate",
        params: {
          brand: car?.brand || "",
          model: car?.model || "",
          year: String(car?.year || ""),
          mileage: String(car?.currentMileage || ""),
          fuel: car?.fuelType || "",
        },
      }),
    [car, router]
  );
  const goSell = useCallback(() => {
    if (sellPath === "/verify-seller") {
      router.push({
        pathname: sellPath,
        params: {
          brand: car?.brand || "",
          model: car?.model || "",
          year: String(car?.year || ""),
          mileage: String(car?.currentMileage || ""),
          fuel: car?.fuelType || "",
        },
      });
    } else {
      router.push(sellPath);
    }
  }, [car, router, sellPath]);
  const goAlerts = useCallback(() => router.push("/price-alerts"), [router]);
  const goExplore = useCallback(
    () => router.push(mode === "tab" ? "/(car-owner)/explore" : "/(customer)"),
    [mode, router]
  );

  const handleDelete = useCallback(() => {
    Alert.alert(
      fr ? "Supprimer ma voiture ?" : "Remove my car?",
      fr ? "Cette action est irréversible." : "This cannot be undone.",
      [
        { text: fr ? "Annuler" : "Cancel", style: "cancel" },
        {
          text: fr ? "Supprimer" : "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCar(car._id);
              setCar(null);
            } catch {
              Alert.alert(fr ? "Erreur" : "Error", fr ? "Impossible de supprimer." : "Could not delete.");
            }
          },
        },
      ]
    );
  }, [car, fr]);

  const handleMileageBump = useCallback(
    async (addKm) => {
      if (!car?._id) return;
      setMileageSaving(true);
      try {
        const res = await patchMileage(car._id, { addKm });
        setCar(res.data);
        syncGarageLocalReminders(res.data, fr, remindersOn).catch(() => {});
      } catch {
        Alert.alert(fr ? "Oups" : "Oops", fr ? "Km non enregistrés" : "Could not save mileage");
      } finally {
        setMileageSaving(false);
      }
    },
    [car, fr, remindersOn]
  );

  const handleRemindersToggle = useCallback(
    async (on) => {
      setRemindersOn(on);
      if (!car?._id) return;
      try {
        await patchGarageReminders(car._id, on);
        if (on) await syncGarageLocalReminders(car, fr, true);
        else await cancelGarageLocalReminders();
      } catch {
        setRemindersOn(!on);
      }
    },
    [car, fr]
  );

  const handleSaveLog = useCallback(
    async (payload) => {
      setLogSaving(true);
      try {
        await createServiceLog(payload);
        setLogModal(false);
        await load(true);
      } catch {
        Alert.alert(fr ? "Erreur" : "Error", fr ? "Impossible d'enregistrer" : "Could not save");
      } finally {
        setLogSaving(false);
      }
    },
    [fr, load]
  );

  const handleDeleteLog = useCallback(
    (log) => {
      Alert.alert(fr ? "Supprimer ?" : "Delete?", log.title, [
        { text: fr ? "Annuler" : "Cancel", style: "cancel" },
        {
          text: fr ? "Supprimer" : "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteServiceLog(log._id);
              await load(true);
            } catch {
              Alert.alert(fr ? "Erreur" : "Error", fr ? "Échec" : "Failed");
            }
          },
        },
      ]);
    },
    [fr, load]
  );

  if (loading) return <PageLoader />;

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <LinearGradient colors={heroGrad} style={{ paddingTop: insets.top + 6, paddingBottom: 4 }}>
        <GlowOrb
          scaleAnim={orbPulse}
          colors={isDark ? [`${accent}55`, `${accent}00`] : [`${accent}30`, `${accent}00`]}
          style={s.orbRight}
        />
        <GlowOrb
          scaleAnim={orbPulse}
          colors={isDark ? ["rgba(56,189,248,0.2)", "transparent"] : ["rgba(14,165,233,0.12)", "transparent"]}
          style={s.orbLeft}
        />

        <Animated.View style={{ opacity: heroOpacity, transform: [{ translateY: heroSlide }], paddingHorizontal: 20 }}>
          <View style={s.headerRow}>
            {mode === "stack" ? (
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.8}
                style={[s.iconBtn, { borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)" }]}
              >
                <Ionicons name="arrow-back" size={20} color={titleColor} />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 40 }} />
            )}
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={[s.headerTitle, { color: titleColor }]} numberOfLines={1}>
                {fr ? "Mon garage" : "My garage"}
              </Text>
              {car ? (
                <Text style={[s.headerSub, { color: subColor }]} numberOfLines={1}>
                  {car.brand} {car.model} · {car.year}
                </Text>
              ) : null}
            </View>
            {car ? (
              <View style={{ flexDirection: "row", gap: 6 }}>
                <TouchableOpacity onPress={goEdit} activeOpacity={0.8} style={[s.iconBtn, { borderColor: `${accent}44` }]}>
                  <Ionicons name="create-outline" size={18} color={accent} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} activeOpacity={0.8} style={[s.iconBtn, { borderColor: "rgba(239,68,68,0.35)" }]}>
                  <Ionicons name="trash-outline" size={17} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ width: 40 }} />
            )}
          </View>

        </Animated.View>
      </LinearGradient>

      {!car ? (
        <Animated.ScrollView
          style={{ flex: 1, opacity: contentOpacity }}
          contentContainerStyle={[s.emptyScroll, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient colors={[`${accent}28`, `${accent}08`]} style={s.emptyHero}>
            <AppBrandMark size={64} radius={20} halo />
          </LinearGradient>
          <Text style={[s.emptyTitle, { color: titleColor }]}>
            {fr ? "Ajoutez votre voiture" : "Add your car"}
          </Text>
          <Text style={[s.emptyBody, { color: subColor }]}>
            {fr
              ? "On vous rappelle l'assurance, la visite technique, la vidange… tout en un seul endroit."
              : "We remind you about insurance, inspection, oil changes… all in one place."}
          </Text>
          <TouchableOpacity onPress={goAdd} activeOpacity={0.88} style={{ width: "100%" }}>
            <LinearGradient colors={primaryGrad} style={s.ctaBtn}>
              <Ionicons name="add" size={22} color="#fff" />
              <Text style={s.ctaText}>{fr ? "Commencer" : "Get started"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.ScrollView>
      ) : (
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          style={{ opacity: contentOpacity }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 36 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={accent} />
          }
        >
          <GarageTabBar active={activeTab} fr={fr} accent={accent} isDark={isDark} onChange={setActiveTab} />

          <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
            {activeTab === "today" && (
              <>
                <GarageStatusCard
                  alertCount={alertCount}
                  nextDue={nextDue}
                  fr={fr}
                  isDark={isDark}
                  onFix={() => setActiveTab("car")}
                />
                <Text style={[s.sectionLead, { color: titleColor }]}>
                  {fr ? "À faire bientôt" : "Coming up"}
                </Text>
                <Text style={[s.sectionHint, { color: subColor }]}>
                  {fr ? "Appuyez sur une ligne pour mettre à jour la date." : "Tap a row to update the date."}
                </Text>
                <GarageTodoList events={todoEvents} fr={fr} isDark={isDark} onPress={(ev) => goEditItem(ev)} />
                <View style={{ marginTop: 20 }}>
                  <GarageRemindersSimple enabled={remindersOn} fr={fr} accent={accent} isDark={isDark} onToggle={handleRemindersToggle} />
                </View>
                <View style={{ marginTop: 12 }}>
                  <GarageMileageSimple car={car} fr={fr} accent={accent} isDark={isDark} onBump={handleMileageBump} saving={mileageSaving} />
                </View>
              </>
            )}

            {activeTab === "car" && (
              <>
                <TouchableOpacity onPress={goEdit} activeOpacity={0.9} style={[s.editBanner, { backgroundColor: accent }]}>
                  <Ionicons name="create-outline" size={20} color="#fff" />
                  <Text style={s.editBannerText}>{fr ? "Modifier les dates et infos" : "Edit dates & info"}</Text>
                </TouchableOpacity>

                <GarageGroupCard
                  title={fr ? "Papiers officiels" : "Official papers"}
                  subtitle={fr ? "Assurance, visite, vignette, permis" : "Insurance, inspection, tax, licence"}
                  icon="document-text-outline"
                  isDark={isDark}
                >
                  {paperItems.map((item) => (
                    <GarageSimpleRow key={item.id} item={item} fr={fr} isDark={isDark} onPress={() => goEditItem(item)} />
                  ))}
                </GarageGroupCard>

                <GarageGroupCard
                  title={fr ? "Entretien" : "Maintenance"}
                  subtitle={fr ? "Vidange, pneus, freins, batterie…" : "Oil, tyres, brakes, battery…"}
                  icon="construct-outline"
                  isDark={isDark}
                >
                  {mechItems.map((item) => (
                    <GarageSimpleRow key={item.id} item={item} fr={fr} isDark={isDark} onPress={() => goEditItem(item)} />
                  ))}
                </GarageGroupCard>
              </>
            )}

            {activeTab === "more" && (
              <>
                <GarageBudgetSimple costs={costs} fr={fr} isDark={isDark} accent={accent} />
                <GarageServiceSimple
                  logs={serviceLogs}
                  fr={fr}
                  accent={accent}
                  isDark={isDark}
                  onAdd={() => setLogModal(true)}
                  onDelete={handleDeleteLog}
                />
                <GarageTipsSimple tips={recommendations} fr={fr} isDark={isDark} onEstimate={goEstimate} />
                <Text style={[s.sectionLead, { color: titleColor, marginTop: 8 }]}>
                  {fr ? "Autres actions" : "Other actions"}
                </Text>
                <GarageActionGrid
                  isDark={isDark}
                  actions={[
                    { key: "est", icon: "calculator-outline", label: fr ? "Estimer le prix" : "Estimate price", color: "#6366f1", onPress: goEstimate },
                    { key: "sell", icon: "pricetag-outline", label: fr ? "Vendre ma voiture" : "Sell my car", color: "#a78bfa", onPress: goSell },
                    { key: "alert", icon: "notifications-outline", label: fr ? "Alertes prix" : "Price alerts", color: "#22c55e", onPress: goAlerts },
                    { key: "shop", icon: "storefront-outline", label: fr ? "Voir le marché" : "Browse market", color: "#f97316", onPress: goExplore },
                  ]}
                />
              </>
            )}
          </View>
        </Animated.ScrollView>
      )}

      <AddServiceLogModal
        visible={logModal}
        fr={fr}
        accent={accent}
        isDark={isDark}
        car={car}
        onClose={() => setLogModal(false)}
        onSave={handleSaveLog}
        saving={logSaving}
      />
    </View>
  );
}

const s = StyleSheet.create({
  orbRight: { position: "absolute", width: 260, height: 260, borderRadius: 130, top: -80, right: -90, opacity: 0.5 },
  orbLeft: { position: "absolute", width: 200, height: 200, borderRadius: 100, bottom: -40, left: -70, opacity: 0.4 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.4, marginTop: 2, maxWidth: SW * 0.55 },
  headerSub: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  sectionLead: { fontSize: 17, fontWeight: "800", marginTop: 20, marginBottom: 4 },
  sectionHint: { fontSize: 13, fontWeight: "500", marginBottom: 10 },
  editBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  editBannerText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  emptyScroll: { paddingHorizontal: 24, paddingTop: 8 },
  emptyHero: { width: 120, height: 120, borderRadius: 36, alignSelf: "center", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  emptyTitle: { fontSize: 24, fontWeight: "900", textAlign: "center", letterSpacing: -0.5, marginBottom: 12 },
  emptyBody: { fontSize: 15, lineHeight: 24, textAlign: "center", marginBottom: 28 },
  ctaBtn: { borderRadius: 18, paddingVertical: 17, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  ctaText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
