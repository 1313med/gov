import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PageLoader, InlineLogoLoader } from "../AppLoadingScreen";
import CarCard from "../CarCard";
import RentalCard from "../RentalCard";
import { getApprovedSales } from "../../api/sale";
import { getApprovedRentals } from "../../api/rental";
import {
  addFavorite,
  removeFavorite,
  getFavorites,
  addRentalFavorite,
  removeRentalFavorite,
  getRentalFavorites,
} from "../../api/user";
import { useAuth } from "../../context/AuthContext";
import { useAppLang } from "../../context/AppLangContext";
import { useTheme } from "../../context/ThemeContext";
import { filterOutOwnListings } from "../../utils/listingOwnership";
import MarketplaceFilterSheet from "./MarketplaceFilterSheet";
import {
  DEBOUNCE_MS,
  EMPTY_FILTERS,
  MOROCCO_CITIES,
  buildMarketplaceParams,
  countActiveFilters,
  activeFilterChips,
  clearFilterKey,
  itemMatchesFilters,
} from "../../utils/marketplaceFilters";
import NotificationHeaderButton from "../NotificationHeaderButton";

const { width: SCREEN_W } = Dimensions.get("window");

function GlowOrb({ scaleAnim, colors, style }) {
  return (
    <Animated.View pointerEvents="none" style={[style, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

function HeroShimmer({ color, track }) {
  const x = useRef(new Animated.Value(-1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(x, { toValue: 1, duration: 2800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(x, { toValue: -1, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [x]);
  const translateX = x.interpolate({
    inputRange: [-1, 1],
    outputRange: [-SCREEN_W * 0.4, SCREEN_W * 0.4],
  });
  return (
    <View style={{ height: 2, borderRadius: 1, overflow: "hidden", marginTop: 12, backgroundColor: track }}>
      <Animated.View style={{ width: "38%", height: "100%", backgroundColor: color, opacity: 0.9, borderRadius: 1, transform: [{ translateX }] }} />
    </View>
  );
}

/**
 * Premium marketplace — à louer / à vendre with full API filters.
 * @param {'customer'|'carOwner'} variant
 * @param {'rent'|'buy'} defaultMode
 * @param {string} [persistModeKey] AsyncStorage key for last mode
 * @param {boolean} [showSellCta]
 * @param {boolean} [buyFirst] — à vendre tab on the left (car-owner)
 */
export default function MarketplaceExplore({
  variant = "customer",
  defaultMode = "rent",
  persistModeKey,
  showSellCta = false,
  buyFirst = false,
}) {
  const { auth } = useAuth();
  const { lang, pick } = useAppLang();
  const fr = lang === "fr";
  const { colors: C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [mode, setMode] = useState(defaultMode);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
  const [filterOpen, setFilterOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favIds, setFavIds] = useState(new Set());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [modeBarWidth, setModeBarWidth] = useState((SCREEN_W - 40) / 2);

  const debounceRef = useRef(null);
  const modeTabIndex = useCallback(
    (m) => {
      if (buyFirst) return m === "buy" ? 0 : 1;
      return m === "rent" ? 0 : 1;
    },
    [buyFirst]
  );
  const tabAnim = useRef(new Animated.Value(modeTabIndex(defaultMode))).current;
  const orbPulse = useRef(new Animated.Value(1)).current;
  const endCooldown = useRef(0);
  const fetchGenRef = useRef(0);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const modeRef = useRef(mode);
  const filtersRef = useRef(filters);
  const queryRef = useRef(debouncedQuery);
  const persistLoadedRef = useRef(false);

  modeRef.current = mode;
  filtersRef.current = filters;
  queryRef.current = debouncedQuery;
  pageRef.current = page;
  hasMoreRef.current = hasMore;

  const accentRent = isDark ? "#7c6bff" : "#6248e8";
  const accentBuy = isDark ? "#0ea5e9" : "#0284c7";
  const accent = mode === "rent" ? accentRent : accentBuy;
  const ctaGrad = mode === "rent" ? (isDark ? ["#7c6bff", "#5b4ddb"] : ["#6248e8", "#4f46e5"]) : isDark ? ["#0ea5e9", "#0284c7"] : ["#0284c7", "#0369a1"];
  const heroGrad =
    variant === "carOwner"
      ? isDark
        ? ["#03040a", "#0a1628", "#05060f"]
        : ["#f0f9ff", "#e0f2fe", "#f8fafc"]
      : isDark
        ? ["#03040a", "#120a24", "#0a1628", "#05060f"]
        : ["#faf5ff", "#e0f2fe", "#f0f9ff", "#f8fafc"];
  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#94a3b8" : "#475569";
  const shimmerTrack = isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.08)";

  const filterCount = countActiveFilters(filters, mode);
  const chips = useMemo(() => activeFilterChips(filters, mode, fr), [filters, mode, fr]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, { toValue: 1.1, duration: 4800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orbPulse, { toValue: 1, duration: 4800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [orbPulse]);

  useEffect(() => {
    if (!persistModeKey || !auth?._id || persistLoadedRef.current) return;
    persistLoadedRef.current = true;
    AsyncStorage.getItem(`${persistModeKey}:${auth._id}`).then((saved) => {
      if (saved !== "buy" && saved !== "rent") return;
      modeRef.current = saved;
      setMode(saved);
      tabAnim.setValue(modeTabIndex(saved));
    });
  }, [persistModeKey, auth?._id, modeTabIndex]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const switchMode = (newMode) => {
    if (newMode === modeRef.current) return;
    modeRef.current = newMode;
    filtersRef.current = { ...EMPTY_FILTERS };
    queryRef.current = "";
    setMode(newMode);
    setQuery("");
    setDebouncedQuery("");
    setFilters({ ...EMPTY_FILTERS });
    setItems([]);
    setPage(1);
    pageRef.current = 1;
    setHasMore(true);
    setLoading(true);
    if (persistModeKey && auth?._id) {
      AsyncStorage.setItem(`${persistModeKey}:${auth._id}`, newMode).catch(() => {});
    }
    Animated.spring(tabAnim, {
      toValue: modeTabIndex(newMode),
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

  const loadFavs = useCallback(async () => {
    if (!auth) return;
    try {
      if (mode === "rent") {
        const r = await getRentalFavorites().catch(() => ({ data: [] }));
        const arr = Array.isArray(r.data) ? r.data : [];
        setFavIds(new Set(arr.map((x) => String(x._id))));
      } else {
        const r = await getFavorites().catch(() => ({ data: [] }));
        const arr = Array.isArray(r.data) ? r.data : [];
        setFavIds(new Set(arr.map((x) => String(x._id))));
      }
    } catch {}
  }, [auth, mode]);

  const loadItems = useCallback(
    async (reset = false) => {
      const currentMode = modeRef.current;
      const currentFilters = filtersRef.current;
      const currentQuery = queryRef.current;
      const p = reset ? 1 : pageRef.current;

      if (!reset && currentMode === "buy" && !hasMoreRef.current) return;

      const gen = ++fetchGenRef.current;

      if (reset) {
        endCooldown.current = Date.now() + 600;
        setLoading(true);
        pageRef.current = 1;
      } else if (currentMode === "buy") {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const params = buildMarketplaceParams(currentMode, currentFilters, currentQuery);
        if (currentMode === "rent") {
          const { data } = await getApprovedRentals(params);
          if (gen !== fetchGenRef.current) return;
          const raw = Array.isArray(data) ? data : data?.rentals ?? [];
          let list = filterOutOwnListings(raw, auth?._id, "rent");
          list = list.filter((it) => itemMatchesFilters(it, currentFilters));
          setItems(list);
          setTotal(list.length);
          hasMoreRef.current = false;
          setHasMore(false);
        } else {
          const { data } = await getApprovedSales({ ...params, page: p, limit: 12 });
          if (gen !== fetchGenRef.current) return;
          const list = Array.isArray(data?.items)
            ? data.items
            : Array.isArray(data?.cars)
              ? data.cars
              : Array.isArray(data)
                ? data
                : [];
          let filtered = filterOutOwnListings(list, auth?._id, "sale");
          filtered = filtered.filter((it) => itemMatchesFilters(it, currentFilters));
          const pages = data?.pages ?? 1;
          const cur = data?.page ?? p;
          if (reset) {
            setItems(filtered);
            pageRef.current = 2;
            setPage(2);
            setTotal(data?.total ?? filtered.length);
          } else {
            setItems((prev) => {
              const seen = new Set(prev.map((x) => String(x._id)));
              const out = [...prev];
              for (const c of filtered) {
                const id = String(c._id);
                if (!seen.has(id)) {
                  seen.add(id);
                  out.push(c);
                }
              }
              return out;
            });
            pageRef.current = p + 1;
            setPage(p + 1);
          }
          const more = cur < pages && filtered.length > 0;
          hasMoreRef.current = more;
          setHasMore(more);
        }
      } catch {
        if (gen !== fetchGenRef.current) return;
        if (reset) {
          setItems([]);
          setTotal(0);
        }
      } finally {
        if (gen !== fetchGenRef.current) return;
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        setHydrated(true);
      }
    },
    [auth?._id]
  );

  useEffect(() => {
    filtersRef.current = filters;
    pageRef.current = 1;
    hasMoreRef.current = true;
    setPage(1);
    setHasMore(true);
    loadFavs();
    loadItems(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when search criteria change only
  }, [mode, filters, debouncedQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    pageRef.current = 1;
    hasMoreRef.current = true;
    setHasMore(true);
    loadFavs();
    loadItems(true);
  };

  const toggleFav = async (id) => {
    if (!auth) return;
    const sid = String(id);
    const isFav = favIds.has(sid);
    setFavIds((prev) => {
      const n = new Set(prev);
      isFav ? n.delete(sid) : n.add(sid);
      return n;
    });
    try {
      if (mode === "rent") {
        isFav ? await removeRentalFavorite(id) : await addRentalFavorite(id);
      } else {
        isFav ? await removeFavorite(id) : await addFavorite(id);
      }
    } catch {
      setFavIds((prev) => {
        const n = new Set(prev);
        isFav ? n.add(sid) : n.delete(sid);
        return n;
      });
    }
  };

  const tabSlide = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(0, modeBarWidth)],
  });

  const quickCities = useMemo(() => {
    const fromResults = new Set();
    items.forEach((it) => {
      if (it?.city) fromResults.add(String(it.city).trim());
    });
    const merged = [...MOROCCO_CITIES];
    fromResults.forEach((c) => {
      if (!merged.some((m) => m.toLowerCase() === c.toLowerCase())) merged.push(c);
    });
    return merged.slice(0, 14);
  }, [items]);

  const applyFilters = useCallback((next) => {
    filtersRef.current = next;
    setFilters(next);
  }, []);

  const scrollableHeader = (
    <View>
      <LinearGradient colors={heroGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: insets.top + 10, paddingBottom: 14, overflow: "hidden" }}>
        <GlowOrb
          scaleAnim={orbPulse}
          colors={mode === "rent" ? (isDark ? ["rgba(124,107,255,0.5)", "transparent"] : ["rgba(98,72,232,0.28)", "transparent"]) : (isDark ? ["rgba(14,165,233,0.45)", "transparent"] : ["rgba(2,132,199,0.22)", "transparent"])}
          style={{ position: "absolute", width: 240, height: 240, top: -90, right: -70, borderRadius: 999, opacity: 0.55 }}
        />
        <GlowOrb
          scaleAnim={orbPulse}
          colors={isDark ? ["rgba(56,189,248,0.2)", "transparent"] : ["rgba(14,165,233,0.12)", "transparent"]}
          style={{ position: "absolute", width: 180, height: 180, bottom: -50, left: -60, borderRadius: 999, opacity: 0.45 }}
        />

        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: accent, fontSize: 10, fontWeight: "800", letterSpacing: 2.4, textTransform: "uppercase", marginBottom: 6 }}>
                {pick("Premium collection", "Collection premium")}
              </Text>
              <Text style={{ color: titleColor, fontWeight: "900", fontSize: 30, letterSpacing: -0.8, lineHeight: 36 }}>
                {variant === "carOwner"
                  ? pick("The GooVoiture market", "Le marché GooVoiture")
                  : pick("Explore", "Explorez")}
              </Text>
            </View>
            <NotificationHeaderButton
              size={44}
              iconColor={titleColor}
              borderColor={isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)"}
              backgroundColor={isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.75)"}
            />
          </View>
          <Text style={{ color: subColor, fontSize: 14, lineHeight: 21, marginTop: 8, fontWeight: "500", maxWidth: 340 }}>
            {mode === "rent"
              ? pick("Verified rentals, precise filters, book in a few taps.", "Locations vérifiées, filtres précis, réservation en quelques taps.")
              : pick("Curated listings — find your next car in Morocco.", "Annonces sélectionnées — trouvez votre prochaine voiture au Maroc.")}
          </Text>
          <HeroShimmer color={accent} track={shimmerTrack} />

          {showSellCta ? (
            <TouchableOpacity onPress={() => router.push("/new-sale")} activeOpacity={0.88} style={{ marginTop: 16 }}>
              <LinearGradient colors={ctaGrad} style={styles.sellCta}>
                <Ionicons name="pricetag" size={18} color="#fff" />
                <Text style={styles.sellCtaText}>{pick("List my car for sale", "Mettre ma voiture en vente")}</Text>
                <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.85)" />
              </LinearGradient>
            </TouchableOpacity>
          ) : null}

          <View
            style={[styles.modeBar, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.05)", marginTop: showSellCta ? 14 : 18 }]}
            onLayout={(e) => {
              const w = e.nativeEvent.layout.width;
              if (w > 0) setModeBarWidth((w - 8) / 2);
            }}
          >
            <Animated.View
              style={[
                styles.modeIndicator,
                {
                  width: modeBarWidth,
                  backgroundColor: accent,
                  transform: [{ translateX: tabSlide }],
                  shadowColor: accent,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.45,
                  shadowRadius: 12,
                  elevation: 6,
                },
              ]}
            />
            {(buyFirst
              ? [
                  { id: "buy", icon: "diamond-outline", label: pick("For sale", "À vendre") },
                  { id: "rent", icon: "car-sport", label: pick("For rent", "À louer") },
                ]
              : [
                  { id: "rent", icon: "car-sport", label: pick("For rent", "À louer") },
                  { id: "buy", icon: "diamond-outline", label: pick("For sale", "À vendre") },
                ]
            ).map((tab) => (
              <TouchableOpacity key={tab.id} style={styles.modeBtn} onPress={() => switchMode(tab.id)} activeOpacity={0.85}>
                <Ionicons name={tab.icon} size={17} color={mode === tab.id ? "#fff" : C.muted} />
                <Text style={[styles.modeTxt, { color: mode === tab.id ? "#fff" : C.muted }]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.searchGlass, { borderColor: isDark ? `${accent}40` : `${accent}28`, backgroundColor: isDark ? "rgba(15,17,35,0.72)" : "rgba(255,255,255,0.9)" }]}>
            <LinearGradient colors={[`${accent}22`, "transparent"]} style={styles.searchIconWrap}>
              <Ionicons name="search" size={20} color={accent} />
            </LinearGradient>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={mode === "rent" ? (pick("Brand, model, city…", "Marque, modèle, ville…")) : pick("Brand, model, keywords…", "Marque, modèle, mots-clés…")}
              placeholderTextColor={C.muted}
              style={{ flex: 1, color: titleColor, fontSize: 15, fontWeight: "600", paddingVertical: 14 }}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {query.length > 0 ? (
              <TouchableOpacity onPress={() => setQuery("")} hitSlop={10}>
                <Ionicons name="close-circle" size={22} color={C.muted} />
              </TouchableOpacity>
            ) : null}
            <Pressable onPress={() => setFilterOpen(true)} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
              <LinearGradient colors={filterCount > 0 ? ctaGrad : isDark ? ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.04)"] : ["rgba(15,23,42,0.06)", "rgba(15,23,42,0.03)"]} style={styles.filterFab}>
                <Ionicons name="options" size={20} color={filterCount > 0 ? "#fff" : accent} />
                {filterCount > 0 ? (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{filterCount}</Text>
                  </View>
                ) : null}
              </LinearGradient>
            </Pressable>
          </View>

          {chips.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8, paddingTop: 12 }}>
              {chips.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  onPress={() => applyFilters(clearFilterKey(filtersRef.current, c.key))}
                  style={[styles.activeChip, { borderColor: `${accent}44`, backgroundColor: `${accent}18` }]}
                >
                  <Text style={{ color: accent, fontSize: 12, fontWeight: "700" }}>{c.label}</Text>
                  <Ionicons name="close" size={14} color={accent} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => applyFilters({ ...EMPTY_FILTERS })}>
                <Text style={{ color: subColor, fontSize: 12, fontWeight: "700", paddingVertical: 8, paddingHorizontal: 4 }}>
                  {pick("Clear all", "Tout effacer")}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          ) : null}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: 8, paddingTop: 10, paddingBottom: 4 }}
          >
            <TouchableOpacity
              onPress={() => applyFilters({ ...filtersRef.current, city: "" })}
              style={[styles.cityChip, { borderColor: !filters.city ? accent : C.border, backgroundColor: !filters.city ? `${accent}20` : C.inputBg }]}
            >
              <Ionicons name="earth-outline" size={14} color={!filters.city ? accent : C.muted} />
              <Text style={{ color: !filters.city ? accent : C.muted, fontSize: 12, fontWeight: "700", marginLeft: 4 }}>
                {pick("Morocco", "Maroc")}
              </Text>
            </TouchableOpacity>
            {quickCities.map((city) => (
              <TouchableOpacity
                key={city}
                onPress={() =>
                  applyFilters({
                    ...filtersRef.current,
                    city: filtersRef.current.city === city ? "" : city,
                  })
                }
                style={[styles.cityChip, { borderColor: filters.city === city ? accent : C.border, backgroundColor: filters.city === city ? `${accent}20` : C.inputBg }]}
              >
                <Text style={{ color: filters.city === city ? accent : C.muted, fontSize: 12, fontWeight: "700" }}>{city}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, backgroundColor: C.bg }}>
        <Text style={{ color: accent, fontSize: 10, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase" }}>
          {mode === "rent" ? (pick("Available now", "Disponibles maintenant")) : pick("Featured picks", "Sélection du moment")}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
          <Text style={{ color: titleColor, fontWeight: "900", fontSize: 18, letterSpacing: -0.3 }}>
            {loading && items.length === 0 ? "…" : `${items.length}${mode === "buy" && total > items.length ? ` / ${total}` : ""}`}{" "}
            <Text style={{ fontWeight: "600", fontSize: 15, color: subColor }}>{pick("results", "résultats")}</Text>
          </Text>
          {filterCount > 0 ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: accent }} />
              <Text style={{ color: subColor, fontSize: 12, fontWeight: "700" }}>
                {filterCount} {pick("filter(s)", "filtre(s)")}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );

  const onEndReached = useCallback(() => {
    if (mode !== "buy") return;
    if (Date.now() < endCooldown.current) return;
    if (loading || loadingMore || !hasMore || items.length === 0) return;
    loadItems(false);
  }, [mode, loading, loadingMore, hasMore, items.length, loadItems]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {!hydrated && loading && items.length === 0 ? (
        <PageLoader />
      ) : (
        <FlatList
          data={items}
          key={mode}
          keyExtractor={(item) => String(item._id)}
          renderItem={({ item }) =>
            mode === "rent" ? (
              <RentalCard
                rental={item}
                onPress={() => router.push(`/rentals/${item._id}`)}
                onFavorite={() => toggleFav(item._id)}
                isFavorite={favIds.has(String(item._id))}
              />
            ) : (
              <CarCard
                car={item}
                onPress={() => router.push(`/cars/${item._id}`)}
                onFavorite={() => toggleFav(item._id)}
                isFavorite={favIds.has(String(item._id))}
              />
            )
          }
          ListHeaderComponent={scrollableHeader}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 32, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.28}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={loadingMore ? <InlineLogoLoader /> : loading && items.length > 0 ? <InlineLogoLoader /> : <View style={{ height: 8 }} />}
          ListEmptyComponent={
            !loading ? (
              <View style={{ alignItems: "center", paddingVertical: 48, paddingHorizontal: 24 }}>
                <LinearGradient colors={[`${accent}35`, `${accent}08`]} style={{ width: 100, height: 100, borderRadius: 32, alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <Ionicons name={mode === "rent" ? "car-sport" : "diamond"} size={48} color={accent} />
                </LinearGradient>
                <Text style={{ color: titleColor, fontWeight: "900", fontSize: 20, textAlign: "center", letterSpacing: -0.3 }}>
                  {mode === "rent" ? (pick("No rentals", "Aucune location")) : pick("No listings", "Aucune annonce")}
                </Text>
                <Text style={{ color: subColor, fontSize: 14, marginTop: 10, textAlign: "center", lineHeight: 22 }}>
                  {pick("Widen your filters or try another city.", "Élargissez vos filtres ou changez de ville.")}
                </Text>
                <TouchableOpacity onPress={() => setFilterOpen(true)} style={{ marginTop: 20 }}>
                  <LinearGradient colors={ctaGrad} style={{ paddingHorizontal: 22, paddingVertical: 14, borderRadius: 14 }}>
                    <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>{pick("Adjust filters", "Ajuster les filtres")}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}

      <MarketplaceFilterSheet
        visible={filterOpen}
        mode={mode}
        filters={filters}
        fr={fr}
        isDark={isDark}
        accent={accent}
        onClose={() => setFilterOpen(false)}
        onApply={applyFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sellCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  sellCtaText: { color: "#fff", fontWeight: "800", fontSize: 14, flex: 1, textAlign: "center" },
  modeBar: { flexDirection: "row", borderRadius: 16, padding: 4, position: "relative", height: 50 },
  modeIndicator: { position: "absolute", top: 4, left: 4, height: 42, borderRadius: 13 },
  modeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, zIndex: 1 },
  modeTxt: { fontSize: 14, fontWeight: "800" },
  searchGlass: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    paddingRight: 8,
    paddingLeft: 6,
    marginTop: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  searchIconWrap: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", marginVertical: 6 },
  filterFab: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", marginVertical: 6 },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  filterBadgeText: { color: "#fff", fontSize: 10, fontWeight: "900" },
  activeChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  cityChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
});
