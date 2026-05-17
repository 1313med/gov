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

const DEBOUNCE_MS = 720;

export default function CarOwnerExploreScreen() {
  const { auth } = useAuth();
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const { colors: C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [query, setQuery]               = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [cars, setCars]                 = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [favIds, setFavIds]             = useState(new Set());
  const debounceRef                     = useRef(null);
  const orbPulse                        = useRef(new Animated.Value(1)).current;

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

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const loadFavs = useCallback(async () => {
    if (!auth) return;
    try {
      const r = await getFavorites().catch(() => ({ data: [] }));
      const arr = Array.isArray(r.data) ? r.data : [];
      setFavIds(new Set(arr.map((x) => String(x._id))));
    } catch {}
  }, [auth]);

  const loadCars = useCallback(async () => {
    setLoading(true);
    try {
      const params = debouncedQuery ? { search: debouncedQuery } : {};
      const { data } = await getApprovedSales(params);
      const list = Array.isArray(data?.items) ? data.items
        : Array.isArray(data?.cars) ? data.cars
        : Array.isArray(data) ? data : [];
      setCars(list);
    } catch {
      setCars([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedQuery]);

  useEffect(() => { loadFavs(); loadCars(); }, [loadFavs, loadCars]);

  const onRefresh = () => { setRefreshing(true); loadFavs(); loadCars(); };

  const toggleFav = async (id) => {
    if (!auth) return;
    const sid = String(id);
    const isFav = favIds.has(sid);
    setFavIds((prev) => { const n = new Set(prev); isFav ? n.delete(sid) : n.add(sid); return n; });
    try {
      isFav ? await removeFavorite(id) : await addFavorite(id);
    } catch {
      setFavIds((prev) => { const n = new Set(prev); isFav ? n.add(sid) : n.delete(sid); return n; });
    }
  };

  const accent = isDark ? "#38bdf8" : "#0284c7";
  const heroGrad = isDark
    ? ["#03040a", "#0a1628", "#05060f"]
    : ["#f0f9ff", "#e0f2fe", "#f8fafc"];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <LinearGradient colors={heroGrad} style={{ paddingTop: insets.top + 12, paddingBottom: 16, paddingHorizontal: 20, overflow: "hidden" }}>
        <Animated.View style={{ position: "absolute", width: 200, height: 200, top: -70, right: -50, borderRadius: 999, opacity: 0.35, transform: [{ scale: orbPulse }] }}>
          <LinearGradient
            colors={isDark ? ["rgba(56,189,248,0.5)", "rgba(56,189,248,0)"] : ["rgba(2,132,199,0.25)", "rgba(2,132,199,0)"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <Text style={{ fontSize: 24, fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a", letterSpacing: -0.5, marginBottom: 4 }}>
          {fr ? "Marketplace" : "Marketplace"}
        </Text>
        <Text style={{ fontSize: 13, color: isDark ? "#94a3b8" : "#475569", fontWeight: "500", marginBottom: 16 }}>
          {fr ? "Achetez, vendez ou louez votre prochain véhicule" : "Buy, sell or rent your next vehicle"}
        </Text>

        {/* Action CTAs */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
          <TouchableOpacity
            onPress={() => router.push("/new-sale")}
            activeOpacity={0.85}
            style={styles.ctaBtn}
          >
            <LinearGradient
              colors={isDark ? ["#38bdf8", "#0ea5e9"] : ["#0284c7", "#0369a1"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.ctaBtnInner}
            >
              <Ionicons name="pricetag-outline" size={16} color="#fff" />
              <Text style={styles.ctaBtnText}>{fr ? "Mettre en vente" : "List for sale"}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/add-rental")}
            activeOpacity={0.85}
            style={styles.ctaBtn}
          >
            <LinearGradient
              colors={isDark ? ["#a78bfa", "#7c6bff"] : ["#6248e8", "#4f46e5"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.ctaBtnInner}
            >
              <Ionicons name="car-sport-outline" size={16} color="#fff" />
              <Text style={styles.ctaBtnText}>{fr ? "Proposer en location" : "Rent out"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={[styles.searchRow, { backgroundColor: C.inputBg, borderColor: C.border }]}>
          <Ionicons name="search-outline" size={18} color={C.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={fr ? "Marque, modèle, prix…" : "Brand, model, price…"}
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

      {loading && cars.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={accent} size="large" />
          <Text style={{ color: C.muted, marginTop: 12, fontSize: 13, fontWeight: "500" }}>
            {fr ? "Chargement…" : "Loading…"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={cars}
          keyExtractor={(item) => String(item._id)}
          renderItem={({ item }) => (
            <CarCard
              car={item}
              onPress={() => router.push(`/cars/${item._id}`)}
              onFavorite={() => toggleFav(item._id)}
              isFavorite={favIds.has(String(item._id))}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 28 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />
          }
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingVertical: 56, paddingHorizontal: 20 }}>
              <View style={{ width: 88, height: 88, borderRadius: 28, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "rgba(56,189,248,0.12)" : "rgba(2,132,199,0.08)", marginBottom: 16 }}>
                <Ionicons name="pricetag-outline" size={44} color={accent} />
              </View>
              <Text style={{ color: isDark ? "#f1f5f9" : "#0f172a", fontWeight: "800", fontSize: 18, textAlign: "center" }}>
                {fr ? "Aucune voiture trouvée" : "No cars found"}
              </Text>
              <Text style={{ color: C.muted, fontSize: 13, marginTop: 8, textAlign: "center", lineHeight: 20 }}>
                {debouncedQuery
                  ? fr ? "Essayez d'autres termes." : "Try different search terms."
                  : fr ? "Revenez plus tard pour de nouvelles annonces." : "Check back for new listings."}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ctaBtn: { flex: 1 },
  ctaBtnInner: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 7, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  ctaBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  searchRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 14,
  },
});
