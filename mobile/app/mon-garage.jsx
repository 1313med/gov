import { useEffect, useRef, useCallback, useState, useMemo, memo } from "react";
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
import { useTheme } from "../src/context/ThemeContext";
import { useAppLang } from "../src/context/AppLangContext";
import { getMyCar, deleteCar } from "../src/api/userCar";
import { getRecommendations } from "../src/utils/garageRecommendations";

// ── helpers ────────────────────────────────────────────────────────────────────
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

// ── sub-components ─────────────────────────────────────────────────────────────
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
  const sub   = type === "km"
    ? (expiry ? `${(expiry).toLocaleString()} km` : "")
    : formatDate(expiry, fr);

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
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
});

// ── main screen ────────────────────────────────────────────────────────────────
export default function MonGarageScreen() {
  const { colors: C, isDark } = useTheme();
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [car, setCar]       = useState(null);
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

  useEffect(() => {
    if (loading) return;
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(headerSlide,   { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.timing(contentOpacity, { toValue: 1, duration: 500, delay: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [loading, headerOpacity, headerSlide, contentOpacity]);

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

  const primaryGrad = isDark ? ["#7c6bff", "#5b4ddb", "#4338ca"] : ["#6248e8", "#4f46e5", "#4338ca"];
  const bgColor     = C.bg ?? (isDark ? "#05060f" : "#f8fafc");
  const titleColor  = isDark ? "#f8fafc" : "#0f172a";
  const subColor    = isDark ? "#94a3b8" : "#475569";
  const cardBg      = isDark ? ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"] : ["rgba(255,255,255,0.95)", "rgba(248,250,252,0.88)"];
  const cardBorder  = isDark ? "rgba(124,107,255,0.22)" : "rgba(98,72,232,0.14)";

  // Compute all status values
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
  const goSell     = useCallback(() => router.push({
    pathname: "/verify-seller",
    params: { brand: car?.brand || "", model: car?.model || "", year: String(car?.year || ""), mileage: String(car?.currentMileage || ""), fuel: car?.fuelType || "" },
  }), [car, router]);
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
      {/* Header */}
      <LinearGradient
        colors={isDark ? ["#03040a", "#120a24", "#05060f"] : ["#faf5ff", "#e0f2fe", "#f8fafc"]}
        style={{ paddingTop: insets.top + 8, paddingBottom: 20, paddingHorizontal: 22 }}
      >
        <Animated.View style={{ opacity: headerOpacity, transform: [{ translateY: headerSlide }] }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.8}
              style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: "center", justifyContent: "center", borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.7)" }}
            >
              <Ionicons name="arrow-back" size={20} color={titleColor} />
            </TouchableOpacity>

            <View style={{ flexDirection: "row", gap: 8 }}>
              {car && (
                <>
                  <TouchableOpacity onPress={goEdit} activeOpacity={0.8}
                    style={{ paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: isDark ? "rgba(124,107,255,0.4)" : "rgba(98,72,232,0.3)", backgroundColor: isDark ? "rgba(124,107,255,0.1)" : "rgba(98,72,232,0.06)" }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: "700", color: C.primary }}>{fr ? "Modifier" : "Edit"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDelete} activeOpacity={0.8}
                    style={{ width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: "center", justifyContent: "center", borderColor: isDark ? "rgba(239,68,68,0.3)" : "rgba(239,68,68,0.2)", backgroundColor: isDark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.05)" }}
                  >
                    <Ionicons name="trash-outline" size={17} color="#ef4444" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            {car?.image ? (
              <Image
                source={{ uri: car.image }}
                style={{ width: 64, height: 52, borderRadius: 14, backgroundColor: isDark ? "#1e293b" : "#e2e8f0" }}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient colors={primaryGrad} style={{ width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", shadowColor: "#7c6bff", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10 }}>
                <Ionicons name="car-sport" size={24} color="#fff" />
              </LinearGradient>
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase", color: C.primary, marginBottom: 4 }}>
                {fr ? "Mon Garage" : "My Garage"}
              </Text>
              <Text style={{ fontSize: 22, fontWeight: "800", color: titleColor, letterSpacing: -0.5 }}>
                {car ? `${car.brand} ${car.model}` : (fr ? "Aucune voiture" : "No car added")}
              </Text>
              {car && (
                <Text style={{ fontSize: 13, color: subColor, marginTop: 2, fontWeight: "500" }}>
                  {car.year} · {car.fuelType} · {car.currentMileage?.toLocaleString()} km
                  {!car.firstOwner ? (fr ? " · 2ème main" : " · 2nd hand") : ""}
                </Text>
              )}
            </View>
          </View>

          {/* Alert summary badge */}
          {car && alertCount > 0 && (
            <View style={{ marginTop: 16, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: isDark ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.08)", borderWidth: 1, borderColor: isDark ? "rgba(239,68,68,0.3)" : "rgba(239,68,68,0.2)" }}>
              <Ionicons name="alert-circle" size={18} color="#ef4444" />
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#ef4444", flex: 1 }}>
                {fr ? `${alertCount} échéance(s) à renouveler` : `${alertCount} item(s) need attention`}
              </Text>
            </View>
          )}
          {car && alertCount === 0 && (
            <View style={{ marginTop: 16, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: isDark ? "rgba(34,197,94,0.1)" : "rgba(34,197,94,0.07)", borderWidth: 1, borderColor: isDark ? "rgba(34,197,94,0.25)" : "rgba(34,197,94,0.2)" }}>
              <Ionicons name="checkmark-circle" size={18} color={C.green ?? "#22c55e"} />
              <Text style={{ fontSize: 13, fontWeight: "700", color: C.green ?? "#22c55e" }}>
                {fr ? "Tout est à jour !" : "Everything is up to date!"}
              </Text>
            </View>
          )}
        </Animated.View>
      </LinearGradient>

      {/* Content */}
      {!car ? (
        <Animated.View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, opacity: contentOpacity }}>
          <LinearGradient colors={[`${C.primary}20`, `${C.primary}06`]} style={{ width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", marginBottom: 24, borderWidth: 1, borderColor: isDark ? "rgba(124,107,255,0.3)" : "rgba(98,72,232,0.25)" }}>
            <Ionicons name="car-outline" size={40} color={C.primary} />
          </LinearGradient>
          <Text style={{ fontSize: 22, fontWeight: "800", color: titleColor, textAlign: "center", marginBottom: 10, letterSpacing: -0.3 }}>
            {fr ? "Ajoutez votre voiture" : "Add your car"}
          </Text>
          <Text style={{ fontSize: 14, color: subColor, textAlign: "center", lineHeight: 22, marginBottom: 32 }}>
            {fr
              ? "Suivez vos papiers, votre mécanique et recevez des alertes avant chaque expiration."
              : "Track your papers, maintenance and get alerts before every expiry."}
          </Text>
          <TouchableOpacity onPress={goAdd} activeOpacity={0.85} style={{ width: "100%" }}>
            <LinearGradient colors={primaryGrad} style={{ borderRadius: 16, paddingVertical: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10, shadowColor: "#7c6bff", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 18, elevation: 10 }}>
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
          {/* Car hero photo */}
          {car.image && (
            <View style={{ borderRadius: 18, overflow: "hidden", height: 190, marginBottom: 14 }}>
              <Image source={{ uri: car.image }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.5)"]}
                style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, justifyContent: "flex-end", paddingHorizontal: 14, paddingBottom: 10 }}
              >
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15, letterSpacing: -0.2 }}>
                  {car.brand} {car.model ?? ""} {car.year ?? ""}
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Papers section */}
          <LinearGradient colors={cardBg} style={[styles.card, { borderColor: cardBorder }]}>
            <SectionHeader icon="document-text-outline" title={fr ? "Papiers" : "Papers"} color="#f97316" isDark={isDark} />
            <ItemRow label={fr ? "Assurance" : "Insurance"}          expiry={car.assurance?.expiryDate}       value={statuses.assurance}       type="days" fr={fr} C={C} isDark={isDark} onEdit={goEdit} />
            <ItemRow label={fr ? "Visite technique" : "Car inspection"} expiry={car.visiteTechnique?.expiryDate} value={statuses.visiteTechnique} type="days" fr={fr} C={C} isDark={isDark} onEdit={goEdit} />
            <ItemRow label={fr ? "Vignette" : "Road tax"}             expiry={car.vignette?.expiryDate}        value={statuses.vignette}        type="days" fr={fr} C={C} isDark={isDark} onEdit={goEdit} />
            <ItemRow label={fr ? "Permis de conduire" : "Driving licence"} expiry={car.permis?.expiryDate}    value={statuses.permis}          type="days" fr={fr} C={C} isDark={isDark} onEdit={goEdit} />
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
            <ItemRow label={fr ? "Pneus" : "Tyres"}         expiry={car.pneus?.lastChangeDate}       value={statuses.pneus}    type="days" fr={fr} C={C} isDark={isDark} onEdit={goEdit} />
            <ItemRow label={fr ? "Batterie" : "Battery"}    expiry={car.batterie?.lastChangeDate}    value={statuses.batterie} type="days" fr={fr} C={C} isDark={isDark} onEdit={goEdit} />
            <ItemRow label={fr ? "Freins" : "Brakes"}       expiry={car.freins?.lastChangeDate}      value={statuses.freins}   type="days" fr={fr} C={C} isDark={isDark} onEdit={goEdit} />
            {car.chainDistribution?.lastChangeDate && (
              <ItemRow
                label={fr ? "Chaîne de distribution" : "Timing chain"}
                expiry={car.chainDistribution.lastChangeDate}
                value={daysLeft(new Date(new Date(car.chainDistribution.lastChangeDate).getTime() + 365 * 5 * 86400000).toISOString())}
                type="days" fr={fr} C={C} isDark={isDark} onEdit={goEdit}
              />
            )}
          </LinearGradient>

          {/* ── Estimate + Sell CTAs ─────────────────────────────────── */}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <TouchableOpacity onPress={goEstimate} activeOpacity={0.85} style={{ flex: 1 }}>
              <LinearGradient
                colors={isDark ? ["rgba(98,72,232,0.22)", "rgba(67,56,202,0.12)"] : ["rgba(98,72,232,0.12)", "rgba(67,56,202,0.06)"]}
                style={[styles.card, { borderColor: isDark ? "rgba(124,107,255,0.35)" : "rgba(98,72,232,0.25)", alignItems: "center", paddingVertical: 16 }]}
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
                colors={isDark ? ["rgba(167,139,250,0.22)", "rgba(124,107,255,0.10)"] : ["rgba(167,139,250,0.14)", "rgba(124,107,255,0.06)"]}
                style={[styles.card, { borderColor: isDark ? "rgba(167,139,250,0.35)" : "rgba(124,107,255,0.25)", alignItems: "center", paddingVertical: 16 }]}
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

          {/* Price alerts shortcut */}
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
                  {fr ? "Suivez les prix des voitures qui vous intéressent" : "Track prices of cars you're interested in"}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color={isDark ? "#22c55e" : "#16a34a"} />
            </LinearGradient>
          </TouchableOpacity>

          {/* ── Goovoiture Recommendations ───────────────────────────── */}
          {recommendations.length > 0 && (
            <LinearGradient colors={cardBg} style={[styles.card, { borderColor: cardBorder, marginTop: 12 }]}>
              <SectionHeader icon="bulb-outline" title={fr ? "Recommandations Goovoiture" : "Goovoiture recommendations"} color="#a78bfa" isDark={isDark} />
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

          {/* Marketplace bridge */}
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={() => router.push("/(customer)")}
            style={{ marginTop: 12 }}
          >
            <LinearGradient
              colors={isDark ? ["rgba(124,107,255,0.18)", "rgba(56,189,248,0.08)"] : ["rgba(98,72,232,0.12)", "rgba(14,165,233,0.06)"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={[styles.card, { borderColor: isDark ? "rgba(124,107,255,0.35)" : "rgba(98,72,232,0.25)", flexDirection: "row", alignItems: "center", gap: 14 }]}
            >
              <LinearGradient colors={primaryGrad} style={{ width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="search" size={20} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: titleColor, marginBottom: 3 }}>
                  {fr ? `Voir les ${car.brand} sur Goovoiture` : `Browse ${car.brand} cars on Goovoiture`}
                </Text>
                <Text style={{ fontSize: 12, color: subColor }}>
                  {fr ? "Achat, vente et location sur la marketplace" : "Buy, sell, and rent on the marketplace"}
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
