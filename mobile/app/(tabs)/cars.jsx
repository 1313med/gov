import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, RefreshControl, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import CarCard from "../../src/components/CarCard";
import { getApprovedSales } from "../../src/api/sale";
import { addFavorite, removeFavorite, getFavorites } from "../../src/api/user";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { C } from "../../src/theme";

const PRICES = [
  { label:"Any", key:"any" }, { label:"<200k", key:"u200", max:200000 },
  { label:"200k–500k", key:"mid", min:200000, max:500000 }, { label:"500k+", key:"p500", min:500000 },
];

export default function CarsScreen() {
  const { auth } = useAuth();
  const { lang } = useAppLang();
  const router = useRouter();
  const fr = lang === "fr";
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [priceKey, setPriceKey] = useState("any");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async (reset = false) => {
    const p = reset ? 1 : page;
    if (!reset && !hasMore) return;
    reset ? setLoading(true) : setLoadingMore(true);
    try {
      const pr = PRICES.find(r => r.key === priceKey);
      const { data } = await getApprovedSales({ page: p, limit: 10, search: search||undefined, city: city||undefined, minPrice: pr?.min, maxPrice: pr?.max });
      const list = data.cars || data;
      reset ? (setCars(list), setPage(2)) : (setCars(prev => [...prev, ...list]), setPage(p+1));
      setHasMore(list.length === 10);
    } catch { Alert.alert("Error", fr ? "Échec du chargement" : "Failed to load cars"); }
    finally { setLoading(false); setRefreshing(false); setLoadingMore(false); }
  }, [search, city, priceKey, page, hasMore]);

  useEffect(() => { load(true); }, [search, city, priceKey]);
  useEffect(() => { if (auth) getFavorites().then(({ data }) => setFavorites(data.map(f => f._id||f))).catch(() => {}); }, [auth]);

  const toggleFav = async (id) => {
    if (!auth) return Alert.alert(fr ? "Connectez-vous pour sauvegarder" : "Please login to save favorites");
    const isFav = favorites.includes(id);
    try {
      if (isFav) { await removeFavorite(id); setFavorites(p => p.filter(x => x !== id)); }
      else { await addFavorite(id); setFavorites(p => [...p, id]); }
    } catch {}
  };

  return (
    <View style={{ flex:1, backgroundColor: C.bg }}>
      <View style={s.header}>
        <View style={s.headerTop}>
          <Text style={s.headerTitle}>{fr ? "Acheter une voiture" : "Buy a Car"}</Text>
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={[s.filterBtn, showFilters && s.filterBtnActive]}>
            <Ionicons name="options-outline" size={16} color={showFilters ? C.primary : C.muted} />
            <Text style={[s.filterText, showFilters && { color: C.primary }]}>{fr?"Filtres":"Filters"}</Text>
          </TouchableOpacity>
        </View>
        <View style={s.searchRow}>
          <Ionicons name="search-outline" size={18} color={C.muted} />
          <TextInput value={search} onChangeText={setSearch} placeholder={fr?"Marque, modèle…":"Brand, model…"} placeholderTextColor="#4b5563" style={s.searchInput} />
          {!!search && <TouchableOpacity onPress={() => setSearch("")}><Ionicons name="close-circle" size={18} color={C.muted} /></TouchableOpacity>}
        </View>
        {showFilters && <>
          <View style={[s.searchRow, { marginBottom:8 }]}>
            <Ionicons name="location-outline" size={18} color={C.muted} />
            <TextInput value={city} onChangeText={setCity} placeholder={fr?"Ville":"City"} placeholderTextColor="#4b5563" style={s.searchInput} />
          </View>
          <View style={s.priceRow}>
            {PRICES.map(r => (
              <TouchableOpacity key={r.key} onPress={() => setPriceKey(r.key)} style={[s.priceBtn, priceKey===r.key && s.priceBtnActive]}>
                <Text style={[s.priceBtnText, priceKey===r.key && { color: C.primary }]}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>}
      </View>

      {loading
        ? <View style={s.center}><ActivityIndicator color={C.primary} size="large" /></View>
        : <FlatList
            data={cars} keyExtractor={i => i._id}
            renderItem={({ item }) => <CarCard car={item} onPress={() => router.push(`/cars/${item._id}`)} onFavorite={() => toggleFav(item._id)} isFavorite={favorites.includes(item._id)} />}
            contentContainerStyle={{ padding:16 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={C.primary} />}
            onEndReached={() => load()} onEndReachedThreshold={0.3}
            ListFooterComponent={loadingMore ? <ActivityIndicator color={C.primary} style={{ paddingVertical:16 }} /> : null}
            ListEmptyComponent={
              <View style={s.empty}>
                <Ionicons name="car-outline" size={56} color="#4b5563" />
                <Text style={s.emptyTitle}>{fr?"Aucune voiture":"No cars found"}</Text>
                <Text style={s.emptySub}>{fr?"Modifiez les filtres":"Try adjusting your filters"}</Text>
              </View>
            }
          />
      }
    </View>
  );
}

const s = StyleSheet.create({
  header: { paddingTop:56, paddingBottom:16, paddingHorizontal:16, backgroundColor: C.surface, borderBottomWidth:1, borderBottomColor: C.border },
  headerTop: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:12 },
  headerTitle: { color: C.white, fontWeight:"700", fontSize:20 },
  filterBtn: { flexDirection:"row", alignItems:"center", backgroundColor: C.card, borderWidth:1, borderColor: C.border, borderRadius:12, paddingHorizontal:10, paddingVertical:6, gap:4 },
  filterBtnActive: { backgroundColor:"rgba(124,107,255,0.15)", borderColor: C.primary },
  filterText: { color: C.muted, fontSize:12, fontWeight:"600" },
  searchRow: { backgroundColor: C.card, borderWidth:1, borderColor: C.border, borderRadius:12, flexDirection:"row", alignItems:"center", paddingHorizontal:12, marginBottom:8 },
  searchInput: { flex:1, color: C.white, paddingVertical:12, marginLeft:8 },
  priceRow: { flexDirection:"row", gap:8 },
  priceBtn: { flex:1, backgroundColor: C.card, borderWidth:1, borderColor: C.border, borderRadius:12, paddingVertical:8, alignItems:"center" },
  priceBtnActive: { backgroundColor:"rgba(124,107,255,0.15)", borderColor: C.primary },
  priceBtnText: { color: C.muted, fontSize:11, fontWeight:"600" },
  center: { flex:1, alignItems:"center", justifyContent:"center" },
  empty: { alignItems:"center", paddingVertical:64 },
  emptyTitle: { color: C.white, fontWeight:"700", fontSize:18, marginTop:16 },
  emptySub: { color: C.muted, fontSize:13, marginTop:8 },
});
