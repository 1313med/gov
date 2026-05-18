import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import CarCard from "../../src/components/CarCard";
import RentalCard from "../../src/components/RentalCard";
import { getApprovedSales } from "../../src/api/sale";
import { getApprovedRentals } from "../../src/api/rental";
import {
  addFavorite,
  removeFavorite,
  getFavorites,
  addRentalFavorite,
  removeRentalFavorite,
  getRentalFavorites,
} from "../../src/api/user";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { useTheme } from "../../src/context/ThemeContext";
import { filterOutOwnListings } from "../../src/utils/listingOwnership";

const { width: W } = Dimensions.get("window");
const DEBOUNCE_MS = 720;

export default function CarOwnerExploreScreen() {
  const { auth } = useAuth();
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const { colors: C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [mode, setMode] = useState("buy");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favIds, setFavIds] = useState(new Set());
  const [cityFilter, setCityFilter] = useState("");
  const [allCities, setAllCities] = useState([]);
  const [modeBarWidth, setModeBarWidth] = useState((W - 40) / 2);

  const debounceRef = useRef(null);
  const tabAnim = useRef(new Animated.Value(0)).current;
  const orbPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, { toValue: 1.12, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orbPulse, { toValue: 1, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const switchMode = (newMode) => {
    setMode(newMode);
    setQuery("");
    setDebouncedQuery("");
    setCityFilter("");
    setItems([]);
    Animated.spring(tabAnim, {
      toValue: newMode === "buy" ? 0 : 1,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

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

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (debouncedQuery) params.search = debouncedQuery;
      if (cityFilter) params.city = cityFilter;

      if (mode === "rent") {
        const { data } = await getApprovedRentals(params);
        const raw = Array.isArray(data) ? data : data?.rentals ?? [];
        setItems(filterOutOwnListings(raw, auth?._id, "rent"));
      } else {
        const { data } = await getApprovedSales(params);
        const raw = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.cars)
            ? data.cars
            : Array.isArray(data)
              ? data
              : [];
        setItems(filterOutOwnListings(raw, auth?._id, "sale"));
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mode, debouncedQuery, cityFilter, auth?._id]);

  useEffect(() => {
    loadFavs();
    loadItems();
  }, [loadFavs, loadItems]);

  useEffect(() => {
    if (cityFilter || !items.length) return;
    const set = new Set();
    items.forEach((it) => {
      if (it?.city) set.add(String(it.city).trim());
    });
    setAllCities([...set].sort((a, b) => a.localeCompare(b, fr ? "fr" : "en")));
  }, [items, cityFilter, fr]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFavs();
    loadItems();
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
    outputRange: [0, Math.max(0, modeBarWidth - 8)],
  });

  const accentBuy = isDark ? "#38bdf8" : "#0284c7";
  const accentRent = isDark ? "#7c6bff" : "#6248e8";
  const accent = mode === "buy" ? accentBuy : accentRent;
  const heroGrad = isDark
    ? ["#03040a", "#0a1628", "#05060f"]
    : ["#f0f9ff", "#e0f2fe", "#f8fafc"];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <LinearGradient
        colors={heroGrad}
        style={{ paddingTop: insets.top + 12, paddingBottom: 16, paddingHorizontal: 20, overflow: "hidden" }}
      >
        <Animated.View
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            top: -70,
            right: -50,
            borderRadius: 999,
            opacity: 0.35,
            transform: [{ scale: orbPulse }],
          }}
        >
          <LinearGradient
            colors={
              isDark ? ["rgba(56,189,248,0.5)", "rgba(56,189,248,0)"] : ["rgba(2,132,199,0.25)", "rgba(2,132,199,0)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <Text style={{ fontSize: 24, fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a", letterSpacing: -0.5, marginBottom: 4 }}>
          {fr ? "Marketplace" : "Marketplace"}
        </Text>
        <Text style={{ fontSize: 13, color: isDark ? "#94a3b8" : "#475569", fontWeight: "500", marginBottom: 14 }}>
          {fr
            ? "Achetez, vendez ou louez une voiture — pas vos propres annonces"
            : "Buy, sell, or rent a car — your own listings are hidden"}
        </Text>

        <TouchableOpacity onPress={() => router.push("/new-sale")} activeOpacity={0.85} style={{ marginBottom: 14 }}>
          <LinearGradient colors={isDark ? ["#38bdf8", "#0ea5e9"] : ["#0284c7", "#0369a1"]} style={styles.ctaBtnInner}>
            <Ionicons name="pricetag-outline" size={16} color="#fff" />
            <Text style={styles.ctaBtnText}>{fr ? "Mettre en vente" : "List for sale"}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View
          style={[styles.modeBar, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.05)" }]}
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
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 4,
              },
            ]}
          />
          <TouchableOpacity style={styles.modeBtn} onPress={() => switchMode("buy")} activeOpacity={0.8}>
            <Ionicons name="pricetag-outline" size={16} color={mode === "buy" ? "#fff" : C.muted} />
            <Text style={[styles.modeTxt, { color: mode === "buy" ? "#fff" : C.muted }]}>
              {fr ? "À vendre" : "For sale"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modeBtn} onPress={() => switchMode("rent")} activeOpacity={0.8}>
            <Ionicons name="car-sport-outline" size={16} color={mode === "rent" ? "#fff" : C.muted} />
            <Text style={[styles.modeTxt, { color: mode === "rent" ? "#fff" : C.muted }]}>
              {fr ? "À louer" : "For rent"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.searchRow, { backgroundColor: C.inputBg, borderColor: C.border }]}>
          <Ionicons name="search-outline" size={18} color={C.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={
              mode === "rent"
                ? fr
                  ? "Marque, ville, modèle…"
                  : "Brand, city, model…"
                : fr
                  ? "Marque, modèle, prix…"
                  : "Brand, model, price…"
            }
            placeholderTextColor={C.muted}
            style={{
              flex: 1,
              color: isDark ? "#f1f5f9" : "#0f172a",
              fontSize: 14,
              fontWeight: "500",
              paddingVertical: 11,
            }}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} activeOpacity={0.8}>
              <Ionicons name="close-circle" size={18} color={C.muted} />
            </TouchableOpacity>
          )}
        </View>

        {allCities.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingTop: 8 }}
            style={{ maxHeight: 40 }}
          >
            <TouchableOpacity
              onPress={() => setCityFilter("")}
              style={[
                styles.cityChip,
                {
                  borderColor: !cityFilter ? accent : C.border,
                  backgroundColor: !cityFilter ? `${accent}22` : C.inputBg,
                },
              ]}
            >
              <Text style={{ color: !cityFilter ? accent : C.muted, fontSize: 12, fontWeight: "700" }}>
                {fr ? "Toutes villes" : "All cities"}
              </Text>
            </TouchableOpacity>
            {allCities.map((city) => (
              <TouchableOpacity
                key={city}
                onPress={() => setCityFilter(cityFilter === city ? "" : city)}
                style={[
                  styles.cityChip,
                  {
                    borderColor: cityFilter === city ? accent : C.border,
                    backgroundColor: cityFilter === city ? `${accent}22` : C.inputBg,
                  },
                ]}
              >
                <Text style={{ color: cityFilter === city ? accent : C.muted, fontSize: 12, fontWeight: "700" }}>
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}
      </LinearGradient>

      {loading && items.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={accent} size="large" />
          <Text style={{ color: C.muted, marginTop: 12, fontSize: 13, fontWeight: "500" }}>
            {fr ? "Chargement…" : "Loading…"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
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
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 28 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingVertical: 56, paddingHorizontal: 20 }}>
              <View
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 28,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isDark ? `${accent}22` : `${accent}14`,
                  marginBottom: 16,
                }}
              >
                <Ionicons name={mode === "rent" ? "car-sport-outline" : "pricetag-outline"} size={44} color={accent} />
              </View>
              <Text style={{ color: isDark ? "#f1f5f9" : "#0f172a", fontWeight: "800", fontSize: 18, textAlign: "center" }}>
                {mode === "rent"
                  ? fr
                    ? "Aucune location trouvée"
                    : "No rentals found"
                  : fr
                    ? "Aucune voiture à vendre"
                    : "No cars for sale"}
              </Text>
              <Text style={{ color: C.muted, fontSize: 13, marginTop: 8, textAlign: "center", lineHeight: 20 }}>
                {debouncedQuery
                  ? fr
                    ? "Essayez d'autres termes."
                    : "Try different search terms."
                  : fr
                    ? "Revenez plus tard pour de nouvelles annonces."
                    : "Check back for new listings."}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ctaBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  modeBar: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
    position: "relative",
    height: 48,
  },
  modeIndicator: {
    position: "absolute",
    top: 4,
    left: 4,
    height: 40,
    borderRadius: 11,
  },
  modeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    zIndex: 1,
  },
  modeTxt: { fontSize: 14, fontWeight: "700" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  cityChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
});
