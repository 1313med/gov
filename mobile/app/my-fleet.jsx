import { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, RefreshControl, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getOwnerRentals, deleteRental } from "../src/api/rental";
import { useAppLang } from "../src/context/AppLangContext";
import { SERVER_URL } from "../src/config";
import { C } from "../src/theme";

const STATUS = {
  pending:  { bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.3)",  text:"#f59e0b" },
  approved: { bg:"rgba(52,211,153,0.1)",  border:"rgba(52,211,153,0.3)",  text:"#34d399" },
  rejected: { bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.3)",   text:"#ef4444" },
};

export default function MyFleetScreen() {
  const { lang } = useAppLang();
  const router = useRouter();
  const fr = lang === "fr";
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await getOwnerRentals();
      setRentals(Array.isArray(data) ? data : data.rentals || []);
    } catch { Alert.alert("Failed to load fleet"); }
    finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { load(); }, []);

  const handleDelete = (id) => Alert.alert(
    fr ? "Supprimer" : "Delete",
    fr ? "Êtes-vous sûr ?" : "Are you sure?",
    [
      { text: fr ? "Annuler" : "Cancel" },
      { text: fr ? "Supprimer" : "Delete", style:"destructive", onPress: async () => {
        try { await deleteRental(id); load(); }
        catch { Alert.alert("Failed to delete rental"); }
      }},
    ]
  );

  if (loading) return <View style={s.center}><ActivityIndicator color={C.primary} size="large" /></View>;

  return (
    <View style={{ flex:1, backgroundColor: C.bg }}>
      <TouchableOpacity onPress={() => router.push("/add-rental")} style={s.fab}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <FlatList
        data={rentals} keyExtractor={i => i._id}
        contentContainerStyle={{ padding:16, paddingBottom:80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="car-outline" size={56} color="#4b5563" />
            <Text style={s.emptyTitle}>{fr ? "Parc vide" : "No vehicles yet"}</Text>
            <TouchableOpacity onPress={() => router.push("/add-rental")} style={s.emptyBtn}>
              <Ionicons name="add-circle-outline" size={18} color="#fff" />
              <Text style={s.emptyBtnText}>{fr ? "Ajouter un véhicule" : "Add Vehicle"}</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const st = STATUS[item.status] || STATUS.pending;
          const img = item.images?.[0];
          return (
            <View style={s.card}>
              {img
                ? <Image source={{ uri: `${SERVER_URL}/uploads/${img}` }} style={s.cardImg} resizeMode="cover" />
                : <View style={s.cardImgPlaceholder}><Ionicons name="car-sport-outline" size={48} color="#4b5563" /></View>
              }
              <View style={s.cardBody}>
                <View style={s.topRow}>
                  <Text style={s.cardTitle} numberOfLines={1}>{item.title || `${item.brand} ${item.model}`}</Text>
                  <Text style={s.cardPrice}>{item.pricePerDay} MAD/day</Text>
                </View>
                <View style={s.metaRow}>
                  <View style={[s.badge, { backgroundColor: st.bg, borderColor: st.border }]}>
                    <Text style={[s.badgeText, { color: st.text }]}>{item.status}</Text>
                  </View>
                  {item.city && (
                    <View style={s.cityRow}>
                      <Ionicons name="location-outline" size={12} color={C.muted} />
                      <Text style={s.cityText}>{item.city}</Text>
                    </View>
                  )}
                </View>
                <View style={s.actionsRow}>
                  <TouchableOpacity onPress={() => router.push("/owner-bookings")} style={[s.actionBtn, { backgroundColor:"rgba(124,107,255,0.1)", borderColor:"rgba(124,107,255,0.3)" }]}>
                    <Ionicons name="calendar-outline" size={15} color={C.primary} />
                    <Text style={[s.actionBtnText, { color: C.primary }]}>{fr ? "Réservations" : "Bookings"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item._id)} style={[s.actionBtn, { backgroundColor:"rgba(239,68,68,0.1)", borderColor:"rgba(239,68,68,0.3)" }]}>
                    <Ionicons name="trash-outline" size={15} color={C.red} />
                    <Text style={[s.actionBtnText, { color: C.red }]}>{fr ? "Supprimer" : "Delete"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex:1, backgroundColor: C.bg, alignItems:"center", justifyContent:"center" },
  fab: { position:"absolute", bottom:24, right:24, zIndex:10, backgroundColor: C.primary, borderRadius:28, width:56, height:56, alignItems:"center", justifyContent:"center", elevation:8 },
  empty: { alignItems:"center", paddingVertical:64 },
  emptyTitle: { color: C.white, fontWeight:"700", fontSize:18, marginTop:16, marginBottom:20 },
  emptyBtn: { backgroundColor: C.primary, borderRadius:12, paddingHorizontal:24, paddingVertical:12, flexDirection:"row", alignItems:"center", gap:8 },
  emptyBtnText: { color:"#fff", fontWeight:"700" },
  card: { backgroundColor: C.card, borderWidth:1, borderColor: C.border, borderRadius:16, marginBottom:16, overflow:"hidden" },
  cardImg: { width:"100%", height:160 },
  cardImgPlaceholder: { width:"100%", height:160, backgroundColor: C.surface, alignItems:"center", justifyContent:"center" },
  cardBody: { padding:16 },
  topRow: { flexDirection:"row", alignItems:"flex-start", justifyContent:"space-between", marginBottom:8 },
  cardTitle: { color: C.white, fontWeight:"700", fontSize:15, flex:1, marginRight:8 },
  cardPrice: { color: C.accent, fontWeight:"700" },
  metaRow: { flexDirection:"row", alignItems:"center", marginBottom:12 },
  badge: { alignSelf:"flex-start", borderWidth:1, borderRadius:20, paddingHorizontal:12, paddingVertical:4, marginRight:8 },
  badgeText: { fontSize:12, fontWeight:"700", textTransform:"capitalize" },
  cityRow: { flexDirection:"row", alignItems:"center" },
  cityText: { color: C.muted, fontSize:12, marginLeft:4 },
  actionsRow: { flexDirection:"row", gap:8 },
  actionBtn: { flex:1, borderWidth:1, borderRadius:12, paddingVertical:10, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:4 },
  actionBtnText: { fontSize:13, fontWeight:"500" },
});
