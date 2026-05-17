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

const { width: W } = Dimensions.get("window");
const DEBOUNCE_MS = 720;

export default function CustomerExploreScreen() {
  const { auth } = useAuth();
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const { colors: C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [mode, setMode] = useState("rent");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favIds, setFavIds] = useState(new Set());

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
    setItems([]);
    Animated.spring(tabAnim, {
      toValue: newMode === "rent" ? 0 : 1,
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
      const params = debouncedQuery ? { search: debouncedQuery } : {};
      if (mode === "rent") {
        const { data } = await getApprovedRentals(params);
        setItems(Array.isArray(data) ? data : (data?.rentals ?? []));
      } else {
        const { data } = await getApprovedSales(params);
        const list = Array.isArray(data?.items) ? data.items
          : Array.isArray(data?.cars) ? data.cars
          : Array.isArray(data) ? data : [];
        setItems(list);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mode, debouncedQuery]);

  useEffect(() => {
    loadFavs();
    loadItems();
  }, [loadFavs, loadItems]);

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

  const tabSlide = tabAnim.interpolate({ inputRange: [0, 1], outputRange: [0, W / 2 - 24] });

  const accentRent = isDark ? "#7c6bff" : "#6248e8";
  const accentBuy = isDark ? "#0ea5e9" : "#0284c7";
  const accent = mode === "rent" ? accentRent : accentBuy;
  const heroGrad = isDark
    ? ["#03040a", "#120a24", "#0a1628", "#05060f"]
    : ["#faf5ff", "#e0f2fe", "#f0f9ff", "#f8fafc"];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <LinearGradient colors={heroGrad} style={{ paddingTop: insets.top + 12, paddingBottom: 16, paddingHorizontal: 20, overflow: "hidden" }}>
        <Animated.View style={{ position: "absolute", width: 220, height: 220, top: -80, right: -60, borderRadius: 999, opacity: 0.35, transform: [{ scale: orbPulse }] }}>
          <LinearGradient
            colors={isDark ? ["rgba(124,107,255,0.6)", "rgba(124,107,255,0)"] : ["rgba(98,72,232,0.3)", "rgba(98,72,232,0)"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <Text style={{ fontSize: 24, fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a", letterSpacing: -0.5, marginBottom: 4 }}>
          {fr ? "Explorez" : "Explore"}
        </Text>
        <Text style={{ fontSize: 13, color: isDark ? "#94a3b8" : "#475569", fontWeight: "500", marginBottom: 16 }}>
          {fr ? "Louez ou achetez la voiture parfaite" : "Rent or buy the perfect car"}
        </Text>

        {/* Rent / Buy toggle */}
        <View style={[styles.modeBar, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.05)" }]}>
          <Animated.View
            style={[
              styles.modeIndicator,
              {
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
          <TouchableOpacity style={styles.modeBtn} onPress={() => switchMode("rent")} activeOpacity={0.8}>
            <Ionicons name="car-sport-outline" size={16} color={mode === "rent" ? "#fff" : C.muted} />
            <Text style={[styles.modeTxt, { color: mode === "rent" ? "#fff" : C.muted }]}>
              {fr ? "À louer" : "Rent"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modeBtn} onPress={() => switchMode("buy")} activeOpacity={0.8}>
            <Ionicons name="pricetag-outline" size={16} color={mode === "buy" ? "#fff" : C.muted} />
            <Text style={[styles.modeTxt, { color: mode === "buy" ? "#fff" : C.muted }]}>
              {fr ? "À vendre" : "Buy"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={[styles.searchRow, { backgroundColor: C.inputBg, borderColor: C.border }]}>
          <Ionicons name="search-outline" size={18} color={C.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={
              mode === "rent"
                ? fr ? "Marque, ville, modèle…" : "Brand, city, model…"
                : fr ? "Marque, modèle, prix…" : "Brand, model, price…"
            }
            placeholderTextColor={C.muted}
            style={{ flex: 1, color: isDark ? "#f1f5f9" : "#0f172a", fontSize: 14, fontWeight: "500", paddingVertical: 11 }}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} activeOpacity={0.8}>
              <Ionicons name="close-circle" size={18} color={C.muted} />
            </TouchableOpacity>
          )}
        </View>
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />
          }
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingVertical: 56, paddingHorizontal: 20 }}>
              <View style={{ width: 88, height: 88, borderRadius: 28, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "rgba(124,107,255,0.12)" : "rgba(99,102,241,0.1)", marginBottom: 16 }}>
                <Ionicons name={mode === "rent" ? "car-sport-outline" : "pricetag-outline"} size={44} color={accent} />
              </View>
              <Text style={{ color: isDark ? "#f1f5f9" : "#0f172a", fontWeight: "800", fontSize: 18, textAlign: "center" }}>
                {mode === "rent"
                  ? fr ? "Aucune location trouvée" : "No rentals found"
                  : fr ? "Aucune voiture trouvée" : "No cars found"}
              </Text>
              <Text style={{ color: C.muted, fontSize: 13, marginTop: 8, textAlign: "center", lineHeight: 20 }}>
                {debouncedQuery
                  ? fr ? "Essayez d'autres termes de recherche." : "Try different search terms."
                  : fr ? "Revenez plus tard pour de nouvelles annonces." : "Check back later for new listings."}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    width: "50%",
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
});
