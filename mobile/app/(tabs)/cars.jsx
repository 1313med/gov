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
import CarCard from "../../src/components/CarCard";
import { getApprovedSales } from "../../src/api/sale";
import { addFavorite, removeFavorite, getFavorites } from "../../src/api/user";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { useTheme } from "../../src/context/ThemeContext";

const { width: SCREEN_W } = Dimensions.get("window");

/** Text filters: one request after user pauses typing */
const FILTER_DEBOUNCE_MS = 720;

const PRICES = [
  { label: "Any", key: "any" },
  { label: "<200k", key: "u200", max: 200000 },
  { label: "200k–500k", key: "mid", min: 200000, max: 500000 },
  { label: "500k+", key: "p500", min: 500000 },
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
  const labels = fr ? ["Chercher", "Comparer", "Posséder"] : ["Search", "Compare", "Own"];
  const lineColor = isDark ? "rgba(124,107,255,0.28)" : "rgba(98,72,232,0.2)";
  const inactiveRing = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.12)";
  return (
    <View style={{ marginTop: 18, marginBottom: 6 }}>
      <Text style={{ fontSize: 9, fontWeight: "800", letterSpacing: 1.8, textTransform: "uppercase", color: muted, textAlign: "center", marginBottom: 12 }}>
        {fr ? "Votre parcours" : "Your journey"}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "center" }}>
        {[0, 1, 2].map((i) => (
          <View key={labels[i]} style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <View style={{ alignItems: "center", width: 76 }}>
              {i === 0 ? (
                <LinearGradient colors={[accent, `${accent}aa`]} style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" }}>
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

export default function CarsScreen() {
  const { auth } = useAuth();
  const { lang } = useAppLang();
  const { colors: C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const fr = lang === "fr";
  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#94a3b8" : "#64748b";
  const heroGrad = isDark ? ["#03040a", "#120a24", "#0a1628", "#05060f"] : ["#faf5ff", "#e0f2fe", "#f0f9ff", "#f8fafc"];
  const orbA = isDark ? ["rgba(124,107,255,0.45)", "rgba(124,107,255,0)"] : ["rgba(98,72,232,0.32)", "rgba(98,72,232,0)"];
  const orbB = isDark ? ["rgba(56,189,248,0.28)", "rgba(56,189,248,0)"] : ["rgba(14,165,233,0.22)", "rgba(14,165,233,0)"];
  const ctaGrad = isDark ? ["#7c6bff", "#5b4ddb", "#4338ca"] : ["#6248e8", "#4f46e5", "#4338ca"];
  const shimmerTrack = isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.08)";

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  /** After first load, keep FlatList mounted so filters don’t remount and retrigger pagination */
  const [hydrated, setHydrated] = useState(false);
  const endReachCooldownUntil = useRef(0);
  const [searchDraft, setSearchDraft] = useState("");
  const [cityDraft, setCityDraft] = useState("");
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [priceKey, setPriceKey] = useState("any");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

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
    const id = setTimeout(() => {
      setSearch(searchDraft.trim());
      setCity(cityDraft.trim());
    }, FILTER_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchDraft, cityDraft]);

  const load = useCallback(
    async (reset = false) => {
      const p = reset ? 1 : page;
      if (!reset && !hasMore) return;
      if (reset) {
        endReachCooldownUntil.current = Date.now() + 700;
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      try {
        const pr = PRICES.find((r) => r.key === priceKey);
        const { data } = await getApprovedSales({
          page: p,
          limit: 10,
          search: search || undefined,
          city: city || undefined,
          minPrice: pr?.min,
          maxPrice: pr?.max,
        });
        const list = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.cars)
            ? data.cars
            : Array.isArray(data)
              ? data
              : [];
        const pages = data?.pages ?? 1;
        const curPage = data?.page ?? p;
        if (reset) {
          setCars(list);
          setPage(2);
        } else {
          setCars((prev) => {
            const seen = new Set(prev.map((c) => (c?._id != null ? String(c._id) : "")));
            const out = [...prev];
            for (const c of list) {
              const id = c?._id != null ? String(c._id) : "";
              if (!id || seen.has(id)) continue;
              seen.add(id);
              out.push(c);
            }
            return out;
          });
          setPage(p + 1);
        }
        setHasMore(curPage < pages && list.length > 0);
      } catch {
        Alert.alert("Error", fr ? "Échec du chargement" : "Failed to load cars");
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setHydrated(true);
      }
    },
    [search, city, priceKey, page, hasMore, fr],
  );

  useEffect(() => {
    load(true);
  }, [search, city, priceKey]);

  useEffect(() => {
    if (auth) getFavorites().then(({ data }) => setFavorites(data.map((f) => f._id || f))).catch(() => {});
  }, [auth]);

  const toggleFav = async (id) => {
    if (!auth) return Alert.alert(fr ? "Connectez-vous pour sauvegarder" : "Please login to save favorites");
    const isFav = favorites.includes(id);
    try {
      if (isFav) {
        await removeFavorite(id);
        setFavorites((p) => p.filter((x) => x !== id));
      } else {
        await addFavorite(id);
        setFavorites((p) => [...p, id]);
      }
    } catch {}
  };

  const filterScale = useRef(new Animated.Value(showFilters ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(filterScale, { toValue: showFilters ? 1 : 0, friction: 8, tension: 52, useNativeDriver: true }).start();
  }, [showFilters, filterScale]);

  const listHeader = (
    <View>
      <LinearGradient colors={heroGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: insets.top + 10, paddingBottom: 22, overflow: "hidden" }}>
        <GlowOrb scaleAnim={orbPulse} colors={orbA} style={{ width: 220, height: 220, top: -80, right: -70 }} />
        <GlowOrb scaleAnim={orbPulse} colors={orbB} style={{ width: 180, height: 180, bottom: -40, left: -75 }} />
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ color: C.primary, fontSize: 10, fontWeight: "800", letterSpacing: 2.2, textTransform: "uppercase", marginBottom: 8 }}>
            {fr ? "Salle d'exposition" : "Showroom"}
          </Text>
          <Text style={{ color: titleColor, fontWeight: "900", fontSize: 28, letterSpacing: -0.8, lineHeight: 34 }}>
            {fr ? "Achetez votre" : "Buy your"}{" "}
            <Text style={{ fontStyle: "italic", color: C.primary, fontWeight: "900" }}>{fr ? "perle" : "gem"}</Text>
          </Text>
          <Text style={{ color: subColor, fontSize: 14, lineHeight: 21, marginTop: 10, fontWeight: "500", maxWidth: 320 }}>
            {fr
              ? "Parcourez des annonces vérifiées, affinez votre recherche, trouvez la voiture qui vous correspond."
              : "Browse verified listings, refine your search, and find the car that fits you."}
          </Text>
          <HeroShimmer color={C.primary} track={shimmerTrack} />
          <WizardTrail fr={fr} isDark={isDark} accent={C.primary} muted={subColor} />

          <View
            style={{
              marginTop: 8,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: isDark ? "rgba(124,107,255,0.28)" : "rgba(98,72,232,0.2)",
              backgroundColor: isDark ? "rgba(15,17,35,0.65)" : "rgba(255,255,255,0.82)",
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 14,
              shadowColor: C.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isDark ? 0.2 : 0.12,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            <Ionicons name="search-outline" size={20} color={C.primary} />
            <TextInput
              value={searchDraft}
              onChangeText={setSearchDraft}
              placeholder={fr ? "Marque, modèle, mots-clés…" : "Brand, model, keywords…"}
              placeholderTextColor={C.muted}
              style={{ flex: 1, color: titleColor, paddingVertical: 16, marginLeft: 10, fontSize: 15, fontWeight: "500" }}
            />
            {!!searchDraft && (
              <TouchableOpacity
                onPress={() => {
                  setSearchDraft("");
                  setSearch("");
                }}
                hitSlop={12}
              >
                <Ionicons name="close-circle" size={22} color={C.muted} />
              </TouchableOpacity>
            )}
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
            <Text style={{ color: subColor, fontSize: 12, fontWeight: "700" }}>{fr ? "Affinez comme un pro" : "Refine like a pro"}</Text>
            <Pressable
              onPress={() => setShowFilters(!showFilters)}
              style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }]}
            >
              <LinearGradient
                colors={showFilters ? ctaGrad : isDark ? ["rgba(124,107,255,0.2)", "rgba(124,107,255,0.08)"] : ["rgba(98,72,232,0.14)", "rgba(98,72,232,0.06)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: showFilters ? 0 : 1, borderColor: isDark ? "rgba(124,107,255,0.25)" : "rgba(98,72,232,0.2)" }}
              >
                <Ionicons name="options-outline" size={18} color={showFilters ? "#fff" : C.primary} />
                <Text style={{ color: showFilters ? "#fff" : C.primary, fontSize: 13, fontWeight: "800" }}>{fr ? "Filtres" : "Filters"}</Text>
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
        <Text style={{ color: C.primary, fontSize: 10, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase" }}>{fr ? "Collection" : "Collection"}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
          <Text style={{ color: titleColor, fontWeight: "900", fontSize: 18, letterSpacing: -0.3 }}>{fr ? "Annonces pour vous" : "Listings for you"}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent, opacity: 0.9 }} />
            <Text style={{ color: subColor, fontSize: 12, fontWeight: "700" }}>
              {cars.length} {fr ? "résultats" : "results"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const onEndReached = useCallback(() => {
    if (Date.now() < endReachCooldownUntil.current) return;
    if (loading || loadingMore || !hasMore || cars.length === 0) return;
    load();
  }, [loading, loadingMore, hasMore, cars.length, load]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {!hydrated && loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.bg }}>
          <LinearGradient colors={ctaGrad} style={{ width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <ActivityIndicator color="#fff" size="large" />
          </LinearGradient>
          <Text style={{ color: subColor, fontSize: 14, fontWeight: "600" }}>{fr ? "Chargement du showroom…" : "Loading showroom…"}</Text>
        </View>
      ) : (
        <FlatList
          data={cars}
          keyExtractor={(item, index) => (item?._id != null ? String(item._id) : `car-${index}`)}
          renderItem={({ item }) => (
            <CarCard car={item} onPress={() => router.push(`/cars/${item._id}`)} onFavorite={() => toggleFav(item._id)} isFavorite={favorites.includes(item._id)} />
          )}
          ListHeaderComponent={listHeader}
          contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 28 }}
          refreshControl={
            <RefreshControl refreshing={hydrated && loading && !loadingMore} onRefresh={() => load(true)} tintColor={C.primary} />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.25}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={C.primary} style={{ paddingVertical: 20 }} /> : null}
          ListEmptyComponent={
            !loading ? (
              <View style={{ alignItems: "center", paddingVertical: 48, paddingHorizontal: 24 }}>
                <LinearGradient
                  colors={isDark ? ["rgba(124,107,255,0.2)", "rgba(56,189,248,0.12)"] : ["rgba(98,72,232,0.15)", "rgba(14,165,233,0.1)"]}
                  style={{ width: 96, height: 96, borderRadius: 32, alignItems: "center", justifyContent: "center", marginBottom: 20 }}
                >
                  <Ionicons name="car-outline" size={44} color={C.primary} />
                </LinearGradient>
                <Text style={{ color: titleColor, fontWeight: "800", fontSize: 19, textAlign: "center" }}>{fr ? "Aucune voiture trouvée" : "No cars found"}</Text>
                <Text style={{ color: subColor, fontSize: 14, marginTop: 10, textAlign: "center", lineHeight: 21 }}>
                  {fr ? "Élargissez la recherche ou changez le budget." : "Widen your search or adjust your budget."}
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
