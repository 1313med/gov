import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, RefreshControl, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import RentalCard from "../../src/components/RentalCard";
import { getApprovedRentals } from "../../src/api/rental";
import { addRentalFavorite, removeRentalFavorite, getRentalFavorites } from "../../src/api/user";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { C } from "../../src/theme";

const PRICES = [
  { label:"Any", key:"any" }, { label:"<500/day", key:"u500", max:500 },
  { label:"500–1000", key:"mid", min:500, max:1000 }, { label:"1000+", key:"p1000", min:1000 },
];

export default function RentalsScreen() {
  const { auth } = useAuth();
  const { lang } = useAppLang();
  const router = useRouter();
  const fr = lang === "fr";
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [city, setCity] = useState("");
  const [priceKey, setPriceKey] = useState("any");
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const pr = PRICES.find(r => r.key === priceKey);
      const { data } = await getApprovedRentals({ city: city||undefined, minPrice: pr?.min, maxPrice: pr?.max });
      setRentals(Array.isArray(data) ? data : data.rentals || []);
    } catch { Alert.alert("Error", "Failed to load rentals"); }
    finally { setLoading(false); setRefreshing(false); }
  }, [city, priceKey]);

  useEffect(() => { load(); }, [city, priceKey]);
  useEffect(() => { if (auth) getRentalFavorites().then(({ data }) => setFavorites(data.map(f => f._id||f))).catch(() => {}); }, [auth]);

  const toggleFav = async (id) => {
    if (!auth) return Alert.alert(fr ? "Connectez-vous" : "Please login");
    const isFav = favorites.includes(id);
    try {
      if (isFav) { await removeRentalFavorite(id); setFavorites(p => p.filter(x => x !== id)); }
      else { await addRentalFavorite(id); setFavorites(p => [...p, id]); }
    } catch {}
  };

  return (
    <View style={{ flex:1, backgroundColor: C.bg }}>
      <View style={s.header}>
        <View style={s.headerTop}>
          <Text style={s.headerTitle}>{fr?"Louer une voiture":"Rent a Car"}</Text>
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={[s.filterBtn, showFilters && s.filterBtnActive]}>
            <Ionicons name="options-outline" size={16} color={showFilters ? C.primary : C.muted} />
            <Text style={[s.filterText, showFilters && { color: C.primary }]}>{fr?"Filtres":"Filters"}</Text>
          </TouchableOpacity>
        </View>
        {showFilters && <>
          <View style={s.searchRow}>
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
            data={rentals} keyExtractor={i => i._id}
            renderItem={({ item }) => <RentalCard rental={item} onPress={() => router.push(`/rentals/${item._id}`)} onFavorite={() => toggleFav(item._id)} isFavorite={favorites.includes(item._id)} />}
            contentContainerStyle={{ padding:16 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
            ListEmptyComponent={
              <View style={s.empty}>
                <Ionicons name="car-sport-outline" size={56} color="#4b5563" />
                <Text style={s.emptyTitle}>{fr?"Aucune location":"No rentals found"}</Text>
                <Text style={s.emptySub}>{fr?"Essayez d'autres filtres":"Try different filters"}</Text>
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
