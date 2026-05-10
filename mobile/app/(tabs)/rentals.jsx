import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import RentalCard from "../../src/components/RentalCard";
import { getApprovedRentals } from "../../src/api/rental";
import { addRentalFavorite, removeRentalFavorite, getRentalFavorites } from "../../src/api/user";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { useTheme } from "../../src/context/ThemeContext";

const { width: SCREEN_W } = Dimensions.get("window");

const FILTER_DEBOUNCE_MS = 720;

const PRICES = [
  { label: "Any", key: "any" },
  { label: "<500/day", key: "u500", max: 500 },
  { label: "500–1000", key: "mid", min: 500, max: 1000 },
  { label: "1000+", key: "p1000", min: 1000 },
];

function GlowOrb({ style, colors, scaleAnim }) {
  return (
    <Animated.View
      style={[{ position: "absolute", borderRadius: 999, opacity: 0.48 }, style, { transform: [{ scale: scaleAnim }] }]}
    >
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

function HeroShimmer({ color, track }) {
  const x = useRef(new Animated.Value(-1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(x, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(x, { toValue: -1, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [x]);
  const translateX = x.interpolate({
    inputRange: [-1, 1],
    outputRange: [-SCREEN_W * 0.45, SCREEN_W * 0.45],
  });
  return (
    <View style={{ height: 2, borderRadius: 1, overflow: "hidden", marginTop: 14, backgroundColor: track }}>
      <Animated.View
        style={{
          width: "36%",
          height: "100%",
          backgroundColor: color,
          opacity: 0.85,
          borderRadius: 1,
          transform: [{ translateX }],
        }}
      />
    </View>
  );
}

function WizardTrail({ fr, isDark, accent, muted }) {
  const labels = fr ? ["Trouver", "Réserver", "Rouler"] : ["Find", "Book", "Drive"];
  const lineColor = isDark ? "rgba(56,189,248,0.28)" : "rgba(2,132,199,0.22)";
  const inactiveRing = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.12)";
  return (
    <View style={{ marginTop: 18, marginBottom: 6 }}>
      <Text style={{ fontSize: 9, fontWeight: "800", letterSpacing: 1.8, textTransform: "uppercase", color: muted, textAlign: "center", marginBottom: 12 }}>
        {fr ? "Expérience location" : "Rental flow"}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "center" }}>
        {[0, 1, 2].map((i) => (
          <View key={labels[i]} style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <View style={{ alignItems: "center", width: 76 }}>
              {i === 0 ? (
                <LinearGradient colors={[accent, isDark ? "#0ea5e9" : "#0284c7"]} style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#fff", fontWeight: "900", fontSize: 15 }}>{i + 1}</Text>
                </LinearGradient>
              ) : (
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1.5,
                    borderColor: inactiveRing,
                    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)",
                  }}
                >
                  <Text style={{ color: muted, fontWeight: "800", fontSize: 14 }}>{i + 1}</Text>
                </View>
              )}
              <Text style={{ fontSize: 10, fontWeight: "700", color: i === 0 ? accent : muted, marginTop: 8, textAlign: "center" }} numberOfLines={2}>
                {labels[i]}
              </Text>
            </View>
            {i < 2 ? <View style={{ width: 28, height: 2, marginTop: 19, borderRadius: 2, backgroundColor: lineColor }} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function RentalsScreen() {
  const { auth } = useAuth();
  const { lang } = useAppLang();
  const { colors: C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const fr = lang === "fr";
  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#94a3b8" : "#64748b";
  const heroGrad = isDark ? ["#03040a", "#0a1428", "#120a24", "#05060f"] : ["#ecfeff", "#e0f2fe", "#faf5ff", "#f8fafc"];
  const orbA = isDark ? ["rgba(56,189,248,0.38)", "rgba(56,189,248,0)"] : ["rgba(14,165,233,0.28)", "rgba(14,165,233,0)"];
  const orbB = isDark ? ["rgba(124,107,255,0.32)", "rgba(124,107,255,0)"] : ["rgba(98,72,232,0.2)", "rgba(98,72,232,0)"];
  const ctaGrad = isDark ? ["#38bdf8", "#0ea5e9", "#6366f1"] : ["#0ea5e9", "#0284c7", "#4f46e5"];
  const shimmerTrack = isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.08)";

  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [cityDraft, setCityDraft] = useState("");
  const [city, setCity] = useState("");
  const [priceKey, setPriceKey] = useState("any");
  const [showFilters, setShowFilters] = useState(false);

  const orbPulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, { toValue: 1.06, duration: 4200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orbPulse, { toValue: 1, duration: 4200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [orbPulse]);

  useEffect(() => {
    const id = setTimeout(() => setCity(cityDraft.trim()), FILTER_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [cityDraft]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const pr = PRICES.find((r) => r.key === priceKey);
      const { data } = await getApprovedRentals({ city: city || undefined, minPrice: pr?.min, maxPrice: pr?.max });
      setRentals(Array.isArray(data) ? data : data.rentals || []);
    } catch {
      Alert.alert("Error", fr ? "Échec du chargement" : "Failed to load rentals");
    } finally {
      setLoading(false);
      setHydrated(true);
    }
  }, [city, priceKey, fr]);

  useEffect(() => {
    load();
  }, [city, priceKey]);

  useEffect(() => {
    if (auth) getRentalFavorites().then(({ data }) => setFavorites(data.map((f) => f._id || f))).catch(() => {});
  }, [auth]);

  const toggleFav = async (id) => {
    if (!auth) return Alert.alert(fr ? "Connectez-vous" : "Please login");
    const isFav = favorites.includes(id);
    try {
      if (isFav) {
        await removeRentalFavorite(id);
        setFavorites((p) => p.filter((x) => x !== id));
      } else {
        await addRentalFavorite(id);
        setFavorites((p) => [...p, id]);
      }
    } catch {}
  };

  const filterScale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(filterScale, { toValue: showFilters ? 1 : 0, friction: 8, tension: 52, useNativeDriver: true }).start();
  }, [showFilters, filterScale]);

  const listHeader = (
    <View>
      <LinearGradient colors={heroGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: insets.top + 10, paddingBottom: 22, overflow: "hidden" }}>
        <GlowOrb scaleAnim={orbPulse} colors={orbA} style={{ width: 220, height: 220, top: -85, right: -65 }} />
        <GlowOrb scaleAnim={orbPulse} colors={orbB} style={{ width: 190, height: 190, bottom: -35, left: -80 }} />
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ color: C.accent, fontSize: 10, fontWeight: "800", letterSpacing: 2.2, textTransform: "uppercase", marginBottom: 8 }}>
            {fr ? "Mobilité premium" : "Premium mobility"}
          </Text>
          <Text style={{ color: titleColor, fontWeight: "900", fontSize: 28, letterSpacing: -0.8, lineHeight: 34 }}>
            {fr ? "Roulez avec" : "Drive with"}{" "}
            <Text style={{ fontStyle: "italic", color: C.accent, fontWeight: "900" }}>{fr ? "élégance" : "style"}</Text>
          </Text>
          <Text style={{ color: subColor, fontSize: 14, lineHeight: 21, marginTop: 10, fontWeight: "500", maxWidth: 320 }}>
            {fr
              ? "Des véhicules prêts à partir, tarifs clairs, promos mises en avant — votre route commence ici."
              : "Cars ready to go, clear daily rates, deals highlighted — your trip starts here."}
          </Text>
          <HeroShimmer color={C.accent} track={shimmerTrack} />
          <WizardTrail fr={fr} isDark={isDark} accent={C.accent} muted={subColor} />

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
            <Text style={{ color: subColor, fontSize: 12, fontWeight: "700" }}>{fr ? "Filtres rapides" : "Quick filters"}</Text>
            <Pressable
              onPress={() => setShowFilters(!showFilters)}
              style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }]}
            >
              <LinearGradient
                colors={showFilters ? ctaGrad : isDark ? ["rgba(56,189,248,0.22)", "rgba(56,189,248,0.08)"] : ["rgba(14,165,233,0.16)", "rgba(14,165,233,0.06)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 14,
                  borderWidth: showFilters ? 0 : 1,
                  borderColor: isDark ? "rgba(56,189,248,0.28)" : "rgba(2,132,199,0.22)",
                }}
              >
                <Ionicons name="options-outline" size={18} color={showFilters ? "#fff" : C.accent} />
                <Text style={{ color: showFilters ? "#fff" : C.accent, fontSize: 13, fontWeight: "800" }}>{fr ? "Filtres" : "Filters"}</Text>
              </LinearGradient>
            </Pressable>
          </View>

          <Animated.View
            style={{
              opacity: filterScale,
              transform: [
                {
                  translateY: filterScale.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-8, 0],
                  }),
                },
              ],
            }}
            pointerEvents={showFilters ? "auto" : "none"}
          >
            {showFilters ? (
              <View style={{ marginTop: 14 }}>
                <View
                  style={{
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)",
                    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)",
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 14,
                    marginBottom: 12,
                  }}
                >
                  <Ionicons name="location-outline" size={20} color={C.accent} />
                  <TextInput
                    value={cityDraft}
                    onChangeText={setCityDraft}
                    placeholder={fr ? "Ville ou région" : "City or region"}
                    placeholderTextColor={C.muted}
                    style={{ flex: 1, color: titleColor, paddingVertical: 14, marginLeft: 10, fontSize: 15 }}
                  />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 8 }}>
                  {PRICES.map((r) => {
                    const on = priceKey === r.key;
                    return (
                      <TouchableOpacity key={r.key} activeOpacity={0.88} onPress={() => setPriceKey(r.key)}>
                        {on ? (
                          <LinearGradient colors={ctaGrad} style={{ paddingHorizontal: 16, paddingVertical: 11, borderRadius: 14 }}>
                            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "800" }}>{r.label}</Text>
                          </LinearGradient>
                        ) : (
                          <View
                            style={{
                              paddingHorizontal: 16,
                              paddingVertical: 11,
                              borderRadius: 14,
                              borderWidth: 1,
                              borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)",
                              backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.85)",
                            }}
                          >
                            <Text style={{ color: subColor, fontSize: 12, fontWeight: "700" }}>{r.label}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}
          </Animated.View>
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: 18, paddingTop: 20, paddingBottom: 8 }}>
        <Text style={{ color: C.accent, fontSize: 10, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase" }}>{fr ? "Flotte" : "Fleet"}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
          <Text style={{ color: titleColor, fontWeight: "900", fontSize: 18, letterSpacing: -0.3 }}>{fr ? "Voitures disponibles" : "Available cars"}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary, opacity: 0.85 }} />
            <Text style={{ color: subColor, fontSize: 12, fontWeight: "700" }}>
              {rentals.length} {fr ? "résultats" : "results"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {!hydrated && loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.bg }}>
          <LinearGradient colors={ctaGrad} style={{ width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <ActivityIndicator color="#fff" size="large" />
          </LinearGradient>
          <Text style={{ color: subColor, fontSize: 14, fontWeight: "600" }}>{fr ? "Chargement des locations…" : "Loading rentals…"}</Text>
        </View>
      ) : (
        <FlatList
          data={rentals}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => (
            <RentalCard rental={item} onPress={() => router.push(`/rentals/${item._id}`)} onFavorite={() => toggleFav(item._id)} isFavorite={favorites.includes(item._id)} />
          )}
          ListHeaderComponent={listHeader}
          contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 28 }}
          refreshControl={<RefreshControl refreshing={hydrated && loading} onRefresh={() => load()} tintColor={C.accent} />}
          ListEmptyComponent={
            !loading ? (
              <View style={{ alignItems: "center", paddingVertical: 48, paddingHorizontal: 24 }}>
                <LinearGradient
                  colors={isDark ? ["rgba(56,189,248,0.22)", "rgba(124,107,255,0.14)"] : ["rgba(14,165,233,0.16)", "rgba(98,72,232,0.1)"]}
                  style={{ width: 96, height: 96, borderRadius: 32, alignItems: "center", justifyContent: "center", marginBottom: 20 }}
                >
                  <Ionicons name="car-sport-outline" size={44} color={C.accent} />
                </LinearGradient>
                <Text style={{ color: titleColor, fontWeight: "800", fontSize: 19, textAlign: "center" }}>{fr ? "Aucune location trouvée" : "No rentals found"}</Text>
                <Text style={{ color: subColor, fontSize: 14, marginTop: 10, textAlign: "center", lineHeight: 21 }}>
                  {fr ? "Essayez une autre ville ou une tranche de prix." : "Try another city or price range."}
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
