import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/context/ThemeContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { getMyCar, deleteCar } from "../../src/api/userCar";
import { getRecommendations } from "../../src/utils/garageRecommendations";
import { useAuth } from "../../src/context/AuthContext";
import { isGarageSetupDeferred, clearGarageSetupDefer } from "../../src/utils/garageSetupStorage";

function daysLeft(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}

function kmLeft(car) {
  if (!car?.vidange?.lastKm || !car?.vidange?.intervalKm || !car?.currentMileage) return null;
  return car.vidange.lastKm + car.vidange.intervalKm - car.currentMileage;
}

function statusColor(value, type, C) {
  if (type === "km") {
    if (value === null) return C.muted ?? "#94a3b8";
    if (value <= 0)   return "#ef4444";
    if (value <= 500) return "#f97316";
    if (value <= 1500) return "#eab308";
    return C.green ?? "#22c55e";
  }
  if (value === null) return C.muted ?? "#94a3b8";
  if (value <= 0)    return "#ef4444";
  if (value <= 7)    return "#ef4444";
  if (value <= 30)   return "#f97316";
  return C.green ?? "#22c55e";
}

function statusIcon(value, type) {
  if (type === "km") {
    if (value === null) return "ellipse-outline";
    if (value <= 0)    return "warning";
    if (value <= 1500) return "alert-circle-outline";
    return "checkmark-circle-outline";
  }
  if (value === null) return "ellipse-outline";
  if (value <= 0)    return "warning";
  if (value <= 30)   return "alert-circle-outline";
  return "checkmark-circle-outline";
}

function formatDate(dateStr, fr) {
  if (!dateStr) return fr ? "Non renseigné" : "Not set";
  return new Date(dateStr).toLocaleDateString(fr ? "fr-FR" : "en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function statusLabel(value, type, fr) {
  if (type === "km") {
    if (value === null) return fr ? "Non renseigné" : "Not set";
    if (value <= 0)    return fr ? "Dépassé" : "Overdue";
    return `${value.toLocaleString()} km`;
  }
  if (value === null) return fr ? "Non renseigné" : "Not set";
  if (value <= 0)    return fr ? "Expiré" : "Expired";
  if (value === 1)   return fr ? "1 jour" : "1 day";
  return fr ? `${value} jours` : `${value} days`;
}

function SectionHeader({ icon, title, color, isDark }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12, marginTop: 8 }}>
      <LinearGradient
        colors={[`${color}30`, `${color}10`]}
        style={{ width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" }}
      >
        <Ionicons name={icon} size={16} color={color} />
      </LinearGradient>
      <Text style={{ fontSize: 13, fontWeight: "800", letterSpacing: 1.4, textTransform: "uppercase", color: isDark ? "#94a3b8" : "#64748b" }}>
        {title}
      </Text>
    </View>
  );
}

function ItemRow({ label, expiry, value, type, fr, C, isDark, onEdit }) {
  const color = statusColor(value, type, C);
  const icon  = statusIcon(value, type);
  const lbl   = statusLabel(value, type, fr);
  const sub   = type === "km" ? (expiry ? `${(expiry).toLocaleString()} km` : "") : formatDate(expiry, fr);

  return (
    <TouchableOpacity onPress={onEdit} activeOpacity={0.75}>
      <View style={[rowStyles.row, { borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.06)", backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)" }]}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: isDark ? "#f1f5f9" : "#0f172a" }}>{label}</Text>
          {sub ? <Text style={{ fontSize: 12, color: isDark ? "#64748b" : "#94a3b8", marginTop: 2 }}>{sub}</Text> : null}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name={icon} size={16} color={color} />
          <Text style={{ fontSize: 13, fontWeight: "800", color }}>{lbl}</Text>
        </View>
        <Ionicons name="chevron-forward" size={14} color={isDark ? "#334155" : "#cbd5e1"} style={{ marginLeft: 6 }} />
      </View>
    </TouchableOpacity>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", paddingVertical: 14,
    paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, marginBottom: 8,
  },
});

export default function CarOwnerGarageScreen() {
  const { auth } = useAuth();
  const { colors: C, isDark } = useTheme();
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setupPrompted = useRef(false);

  const [car, setCar]         = useState(null);
  const [loading, setLoading] = useState(true);

  const headerOpacity  = useRef(new Animated.Value(0)).current;
  const headerSlide    = useRef(new Animated.Value(24)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyCar();
      setCar(res.data);
    } catch {
      setCar(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useFocusEffect(
    useCallback(() => {
      if (loading || car || !auth?._id) return;
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
    }, [loading, car, auth?._id, router])
  );

  useEffect(() => {
    if (car) setupPrompted.current = false;
  }, [car]);

  useEffect(() => {
    if (loading) return;
    Animated.parallel([
      Animated.timing(headerOpacity,  { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(headerSlide,    { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.timing(contentOpacity, { toValue: 1, duration: 500, delay: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [loading]);

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
              setupPrompted.current = false;
              if (auth?._id) await clearGarageSetupDefer(auth._id);
            } catch {
              Alert.alert(fr ? "Erreur" : "Error", fr ? "Impossible de supprimer." : "Could not delete.");
            }
          },
        },
      ]
    );
  }, [car, fr]);

  const primaryGrad = isDark ? ["#38bdf8", "#0ea5e9"] : ["#0284c7", "#0369a1"];
  const bgColor     = C.bg ?? (isDark ? "#05060f" : "#f8fafc");
  const titleColor  = isDark ? "#f8fafc" : "#0f172a";
  const subColor    = isDark ? "#94a3b8" : "#475569";
  const cardBg      = isDark ? ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"] : ["rgba(255,255,255,0.95)", "rgba(248,250,252,0.88)"];
  const cardBorder  = isDark ? "rgba(56,189,248,0.22)" : "rgba(2,132,199,0.14)";

  const statuses = useMemo(() => {
    if (!car) return null;
    return {
      assurance:       daysLeft(car.assurance?.expiryDate),
      visiteTechnique: daysLeft(car.visiteTechnique?.expiryDate),
      vignette:        daysLeft(car.vignette?.expiryDate),
      permis:          daysLeft(car.permis?.expiryDate),
      vidange:         kmLeft(car),
      pneus:           daysLeft(car.pneus?.lastChangeDate ? new Date(new Date(car.pneus.lastChangeDate).getTime() + 365 * 2 * 86400000).toISOString() : null),
      batterie:        daysLeft(car.batterie?.lastChangeDate ? new Date(new Date(car.batterie.lastChangeDate).getTime() + 365 * 3 * 86400000).toISOString() : null),
      freins:          daysLeft(car.freins?.lastChangeDate ? new Date(new Date(car.freins.lastChangeDate).getTime() + 365 * 2 * 86400000).toISOString() : null),
    };
  }, [car]);

  const recommendations = useMemo(() => car ? getRecommendations(car) : [], [car]);

  const alertCount = useMemo(() => {
    if (!statuses) return 0;
    let n = 0;
    const check = (v, type) => {
      if (type === "km") { if (v !== null && v <= 1500) n++; }
      else { if (v !== null && v <= 30) n++; }
    };
    check(statuses.assurance, "days");
    check(statuses.visiteTechnique, "days");
    check(statuses.vignette, "days");
    check(statuses.permis, "days");
    check(statuses.vidange, "km");
    return n;
  }, [statuses]);

  const goEdit     = useCallback(() => router.push({ pathname: "/add-car", params: { id: car?._id } }), [car, router]);
  const goAdd      = useCallback(() => router.push("/add-car"), [router]);
  const goEstimate = useCallback(() => router.push({
    pathname: "/estimate",
    params: { brand: car?.brand || "", model: car?.model || "", year: String(car?.year || ""), mileage: String(car?.currentMileage || ""), fuel: car?.fuelType || "" },
  }), [car, router]);
  const goSell     = useCallback(() => router.push("/new-sale"), [router]);
  const goAlerts   = useCallback(() => router.push("/price-alerts"), [router]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: bgColor, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <LinearGradient
        colors={isDark ? ["#03040a", "#0a1628", "#05060f"] : ["#f0f9ff", "#e0f2fe", "#f8fafc"]}
        style={{ paddingTop: insets.top + 8, paddingBottom: 20, paddingHorizontal: 22 }}
      >
        <Animated.View style={{ opacity: headerOpacity, transform: [{ translateY: headerSlide }] }}>
          {/* header top bar */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <View>
              <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase", color: isDark ? "#38bdf8" : "#0284c7", marginBottom: 2 }}>
                {fr ? "MON GARAGE" : "MY GARAGE"}
              </Text>
              <Text style={{ fontSize: 20, fontWeight: "800", color: titleColor, letterSpacing: -0.4 }}>
                {car ? `${car.brand} ${car.model}` : (fr ? "Aucune voiture" : "No car added")}
              </Text>
              {car && (
                <Text style={{ fontSize: 12, color: subColor, marginTop: 2, fontWeight: "500" }}>
                  {car.year} · {car.fuelType} · {car.currentMileage?.toLocaleString()} km
                </Text>
              )}
            </View>
            {car && (
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity onPress={goEdit} activeOpacity={0.8}
                  style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: isDark ? "rgba(56,189,248,0.4)" : "rgba(2,132,199,0.3)", backgroundColor: isDark ? "rgba(56,189,248,0.1)" : "rgba(2,132,199,0.06)" }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "700", color: isDark ? "#38bdf8" : "#0284c7" }}>{fr ? "Modifier" : "Edit"}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} activeOpacity={0.8}
                  style={{ width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: "center", justifyContent: "center", borderColor: isDark ? "rgba(239,68,68,0.3)" : "rgba(239,68,68,0.2)", backgroundColor: isDark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.05)" }}
                >
                  <Ionicons name="trash-outline" size={17} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Alert summary */}
          {car && alertCount > 0 && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: isDark ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.08)", borderWidth: 1, borderColor: isDark ? "rgba(239,68,68,0.3)" : "rgba(239,68,68,0.2)" }}>
              <Ionicons name="alert-circle" size={18} color="#ef4444" />
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#ef4444", flex: 1 }}>
                {fr ? `${alertCount} échéance(s) à renouveler` : `${alertCount} item(s) need attention`}
              </Text>
            </View>
          )}
          {car && alertCount === 0 && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: isDark ? "rgba(34,197,94,0.1)" : "rgba(34,197,94,0.07)", borderWidth: 1, borderColor: isDark ? "rgba(34,197,94,0.25)" : "rgba(34,197,94,0.2)" }}>
              <Ionicons name="checkmark-circle" size={18} color={C.green ?? "#22c55e"} />
              <Text style={{ fontSize: 13, fontWeight: "700", color: C.green ?? "#22c55e" }}>
                {fr ? "Tout est à jour !" : "Everything is up to date!"}
              </Text>
            </View>
          )}
        </Animated.View>
      </LinearGradient>

      {!car ? (
        <Animated.View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, opacity: contentOpacity }}>
          <LinearGradient
            colors={[isDark ? "rgba(56,189,248,0.2)" : "rgba(2,132,199,0.12)", isDark ? "rgba(56,189,248,0.06)" : "rgba(2,132,199,0.04)"]}
            style={{ width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", marginBottom: 24, borderWidth: 1, borderColor: isDark ? "rgba(56,189,248,0.3)" : "rgba(2,132,199,0.25)" }}
          >
            <Ionicons name="car-outline" size={40} color={isDark ? "#38bdf8" : "#0284c7"} />
          </LinearGradient>
          <Text style={{ fontSize: 22, fontWeight: "800", color: titleColor, textAlign: "center", marginBottom: 10, letterSpacing: -0.3 }}>
            {fr ? "Votre voiture, au centre" : "Your car comes first"}
          </Text>
          <Text style={{ fontSize: 14, color: subColor, textAlign: "center", lineHeight: 22, marginBottom: 12 }}>
            {fr
              ? "Ajoutez votre véhicule pour activer le suivi assurance, visite technique, vidange et alertes — c'est la fonction principale de votre compte."
              : "Add your vehicle to unlock insurance, inspection, oil-change tracking and alerts — the core of your account."}
          </Text>
          <Text style={{ fontSize: 13, color: isDark ? "#38bdf8" : "#0284c7", textAlign: "center", lineHeight: 20, marginBottom: 28, fontWeight: "600" }}>
            {fr
              ? "Pour vendre votre voiture, la marketplace est à portée de main."
              : "When you're ready to sell, the marketplace is right here."}
          </Text>
          <TouchableOpacity onPress={goAdd} activeOpacity={0.85} style={{ width: "100%" }}>
            <LinearGradient
              colors={primaryGrad}
              style={{ borderRadius: 16, paddingVertical: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10, shadowColor: "#0284c7", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 18, elevation: 10 }}
            >
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
                {fr ? "Ajouter ma voiture" : "Add my car"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          style={{ opacity: contentOpacity }}
          contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 20, paddingBottom: insets.bottom + 40 }}
        >
          {car.image && (
            <View style={{ borderRadius: 18, overflow: "hidden", height: 190, marginBottom: 14 }}>
              <Image source={{ uri: car.image }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.5)"]}
                style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, justifyContent: "flex-end", paddingHorizontal: 14, paddingBottom: 10 }}
              >
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>
                  {car.brand} {car.model ?? ""} {car.year ?? ""}
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Papers section */}
          <LinearGradient colors={cardBg} style={[styles.card, { borderColor: cardBorder }]}>
            <SectionHeader icon="document-text-outline" title={fr ? "Papiers" : "Papers"} color="#f97316" isDark={isDark} />
            <ItemRow label={fr ? "Assurance" : "Insurance"}              expiry={car.assurance?.expiryDate}       value={statuses.assurance}       type="days" fr={fr} C={C} isDark={isDark} onEdit={goEdit} />
            <ItemRow label={fr ? "Visite technique" : "Car inspection"}  expiry={car.visiteTechnique?.expiryDate} value={statuses.visiteTechnique} type="days" fr={fr} C={C} isDark={isDark} onEdit={goEdit} />
            <ItemRow label={fr ? "Vignette" : "Road tax"}                expiry={car.vignette?.expiryDate}        value={statuses.vignette}        type="days" fr={fr} C={C} isDark={isDark} onEdit={goEdit} />
            <ItemRow label={fr ? "Permis de conduire" : "Driving licence"} expiry={car.permis?.expiryDate}        value={statuses.permis}          type="days" fr={fr} C={C} isDark={isDark} onEdit={goEdit} />
          </LinearGradient>

          {/* Maintenance section */}
          <LinearGradient colors={cardBg} style={[styles.card, { borderColor: cardBorder, marginTop: 12 }]}>
            <SectionHeader icon="construct-outline" title={fr ? "Mécanique" : "Maintenance"} color="#38bdf8" isDark={isDark} />
            <ItemRow
              label={fr ? "Vidange" : "Oil change"}
              expiry={car.vidange?.lastKm ? car.vidange.lastKm + car.vidange.intervalKm : null}
              value={statuses.vidange}
              type="km"
              fr={fr} C={C} isDark={isDark} onEdit={goEdit}
            />
            <ItemRow label={fr ? "Pneus" : "Tyres"}      expiry={car.pneus?.lastChangeDate}    value={statuses.pneus}    type="days" fr={fr} C={C} isDark={isDark} onEdit={goEdit} />
            <ItemRow label={fr ? "Batterie" : "Battery"} expiry={car.batterie?.lastChangeDate} value={statuses.batterie} type="days" fr={fr} C={C} isDark={isDark} onEdit={goEdit} />
            <ItemRow label={fr ? "Freins" : "Brakes"}    expiry={car.freins?.lastChangeDate}   value={statuses.freins}   type="days" fr={fr} C={C} isDark={isDark} onEdit={goEdit} />
            {car.chainDistribution?.lastChangeDate && (
              <ItemRow
                label={fr ? "Chaîne de distribution" : "Timing chain"}
                expiry={car.chainDistribution.lastChangeDate}
                value={daysLeft(new Date(new Date(car.chainDistribution.lastChangeDate).getTime() + 365 * 5 * 86400000).toISOString())}
                type="days" fr={fr} C={C} isDark={isDark} onEdit={goEdit}
              />
            )}
          </LinearGradient>

          {/* Estimate + Sell CTAs */}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <TouchableOpacity onPress={goEstimate} activeOpacity={0.85} style={{ flex: 1 }}>
              <LinearGradient
                colors={isDark ? ["rgba(56,189,248,0.22)", "rgba(14,165,233,0.12)"] : ["rgba(2,132,199,0.12)", "rgba(3,105,161,0.06)"]}
                style={[styles.card, { borderColor: isDark ? "rgba(56,189,248,0.35)" : "rgba(2,132,199,0.25)", alignItems: "center", paddingVertical: 16 }]}
              >
                <LinearGradient colors={primaryGrad} style={{ width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                  <Ionicons name="calculator-outline" size={18} color="#fff" />
                </LinearGradient>
                <Text style={{ fontSize: 13, fontWeight: "800", color: titleColor, textAlign: "center" }}>
                  {fr ? "Estimer la valeur" : "Estimate value"}
                </Text>
                <Text style={{ fontSize: 11, color: subColor, marginTop: 2 }}>
                  {fr ? "Prix du marché" : "Market price"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={goSell} activeOpacity={0.85} style={{ flex: 1 }}>
              <LinearGradient
                colors={isDark ? ["rgba(124,107,255,0.22)", "rgba(91,77,219,0.12)"] : ["rgba(98,72,232,0.12)", "rgba(79,70,229,0.06)"]}
                style={[styles.card, { borderColor: isDark ? "rgba(124,107,255,0.35)" : "rgba(98,72,232,0.25)", alignItems: "center", paddingVertical: 16 }]}
              >
                <LinearGradient colors={["#a78bfa", "#7c6bff"]} style={{ width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                  <Ionicons name="pricetag-outline" size={18} color="#fff" />
                </LinearGradient>
                <Text style={{ fontSize: 13, fontWeight: "800", color: titleColor, textAlign: "center" }}>
                  {fr ? "Vendre cette voiture" : "Sell this car"}
                </Text>
                <Text style={{ fontSize: 11, color: subColor, marginTop: 2 }}>
                  {fr ? "Créer une annonce" : "Create listing"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Price alerts */}
          <TouchableOpacity onPress={goAlerts} activeOpacity={0.82} style={{ marginTop: 10 }}>
            <LinearGradient
              colors={isDark ? ["rgba(34,197,94,0.12)", "rgba(22,163,74,0.06)"] : ["rgba(34,197,94,0.09)", "rgba(22,163,74,0.04)"]}
              style={[styles.card, { borderColor: isDark ? "rgba(34,197,94,0.28)" : "rgba(34,197,94,0.22)", flexDirection: "row", alignItems: "center", gap: 12 }]}
            >
              <LinearGradient colors={["#22c55e", "#16a34a"]} style={{ width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="notifications-outline" size={18} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: titleColor }}>
                  {fr ? "Alertes prix" : "Price alerts"}
                </Text>
                <Text style={{ fontSize: 12, color: subColor }}>
                  {fr ? "Suivez les prix des voitures qui vous intéressent" : "Track prices of cars you're watching"}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color={isDark ? "#22c55e" : "#16a34a"} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <LinearGradient colors={cardBg} style={[styles.card, { borderColor: cardBorder, marginTop: 12 }]}>
              <SectionHeader icon="bulb-outline" title={fr ? "Recommandations" : "Recommendations"} color="#a78bfa" isDark={isDark} />
              {recommendations.map((rec, i) => (
                <TouchableOpacity
                  key={i}
                  activeOpacity={rec.action === "estimate" ? 0.8 : 1}
                  onPress={rec.action === "estimate" ? goEstimate : undefined}
                  style={{ flexDirection: "row", alignItems: "flex-start", paddingVertical: 12, borderBottomWidth: i < recommendations.length - 1 ? 1 : 0, borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)", gap: 12 }}
                >
                  <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: `${rec.color}20`, alignItems: "center", justifyContent: "center", marginTop: 1, flexShrink: 0 }}>
                    <Ionicons name={rec.icon} size={16} color={rec.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <Text style={{ fontSize: 14, fontWeight: "800", color: titleColor, flex: 1 }}>{rec.title}</Text>
                      {rec.action === "estimate" && <Ionicons name="arrow-forward" size={13} color={rec.color} />}
                    </View>
                    <Text style={{ fontSize: 13, color: subColor, lineHeight: 19 }}>{rec.body}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </LinearGradient>
          )}

          {/* Marketplace bridge — secondary discovery CTA */}
          <TouchableOpacity activeOpacity={0.82} onPress={() => router.push("/(car-owner)/explore")} style={{ marginTop: 12 }}>
            <LinearGradient
              colors={isDark ? ["rgba(124,107,255,0.18)", "rgba(56,189,248,0.08)"] : ["rgba(98,72,232,0.12)", "rgba(14,165,233,0.06)"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={[styles.card, { borderColor: isDark ? "rgba(124,107,255,0.35)" : "rgba(98,72,232,0.25)", flexDirection: "row", alignItems: "center", gap: 14 }]}
            >
              <LinearGradient colors={["#7c6bff", "#5b4ddb"]} style={{ width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="storefront-outline" size={20} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: titleColor, marginBottom: 3 }}>
                  {fr ? "Découvrir la marketplace" : "Discover the marketplace"}
                </Text>
                <Text style={{ fontSize: 12, color: subColor }}>
                  {fr ? "Achetez, vendez ou louez sur la marketplace." : "Buy, sell, or rent on the marketplace."}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color={C.primary} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" } : {}),
  },
});
