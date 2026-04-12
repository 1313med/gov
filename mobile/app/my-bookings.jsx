import { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getMyBookings, cancelBooking } from "../src/api/booking";
import { useAppLang } from "../src/context/AppLangContext";
import { C } from "../src/theme";

const ST = {
  pending:   { bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.3)",  text:"#f59e0b", icon:"time-outline" },
  confirmed: { bg:"rgba(52,211,153,0.1)",  border:"rgba(52,211,153,0.3)",  text:"#34d399", icon:"checkmark-circle-outline" },
  completed: { bg:"rgba(96,165,250,0.1)",  border:"rgba(96,165,250,0.3)",  text:"#60a5fa", icon:"flag-outline" },
  cancelled: { bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.3)",   text:"#ef4444", icon:"close-circle-outline" },
};

export default function MyBookingsScreen() {
  const { lang } = useAppLang();
  const router = useRouter();
  const fr = lang === "fr";
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try { const { data } = await getMyBookings(); setBookings(data); }
    catch { Alert.alert("Failed to load bookings"); }
    finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { load(); }, []);

  const handleCancel = (id) => Alert.alert(fr?"Annuler la réservation":"Cancel Booking", fr?"Êtes-vous sûr ?":"Are you sure?",
    [{ text: fr?"Non":"No" }, { text: fr?"Oui, annuler":"Yes, cancel", style:"destructive", onPress: async () => { try { await cancelBooking(id); load(); } catch { Alert.alert("Failed"); } } }]);

  if (loading) return <View style={s.center}><ActivityIndicator color={C.primary} size="large" /></View>;

  return (
    <View style={{ flex:1, backgroundColor: C.bg }}>
      <FlatList data={bookings} keyExtractor={i => i._id} contentContainerStyle={{ padding:16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
        ListEmptyComponent={
          <View style={s.center}>
            <Ionicons name="calendar-outline" size={56} color="#4b5563" />
            <Text style={s.emptyTitle}>{fr?"Aucune réservation":"No bookings yet"}</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/rentals")} style={s.btn}><Text style={s.btnText}>{fr?"Voir les locations":"Browse Rentals"}</Text></TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const st = ST[item.status] || ST.pending;
          const canCancel = item.status === "pending" || item.status === "confirmed";
          return (
            <View style={s.card}>
              <TouchableOpacity onPress={() => router.push(`/rentals/${item.rentalId?._id||item.rentalId}`)}>
                <Text style={s.cardTitle} numberOfLines={1}>{item.rentalId?.title || `${item.rentalId?.brand} ${item.rentalId?.model}` || "Rental"}</Text>
              </TouchableOpacity>
              <View style={[s.badge, { backgroundColor: st.bg, borderColor: st.border }]}>
                <Ionicons name={st.icon} size={13} color={st.text} />
                <Text style={[s.badgeText, { color: st.text }]}>{item.status}</Text>
              </View>
              <View style={s.datesRow}>
                <View style={s.dateBox}><Text style={s.dateLabel}>{fr?"Début":"Start"}</Text><Text style={s.dateVal}>{new Date(item.startDate).toLocaleDateString()}</Text></View>
                <View style={s.dateBox}><Text style={s.dateLabel}>{fr?"Fin":"End"}</Text><Text style={s.dateVal}>{new Date(item.endDate).toLocaleDateString()}</Text></View>
              </View>
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Total</Text>
                <Text style={s.totalVal}>{Number(item.totalAmount).toLocaleString()} MAD</Text>
              </View>
              {canCancel && (
                <TouchableOpacity onPress={() => handleCancel(item._id)} style={s.cancelBtn}>
                  <Text style={s.cancelText}>{fr?"Annuler la réservation":"Cancel Booking"}</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex:1, alignItems:"center", justifyContent:"center", padding:24 },
  emptyTitle: { color: C.white, fontWeight:"700", fontSize:18, marginTop:16, marginBottom:16 },
  btn: { backgroundColor: C.primary, borderRadius:12, paddingHorizontal:24, paddingVertical:12 },
  btnText: { color:"#fff", fontWeight:"700" },
  card: { backgroundColor: C.card, borderWidth:1, borderColor: C.border, borderRadius:16, padding:16, marginBottom:16 },
  cardTitle: { color: C.white, fontWeight:"700", fontSize:16, marginBottom:10 },
  badge: { alignSelf:"flex-start", flexDirection:"row", alignItems:"center", paddingHorizontal:10, paddingVertical:4, borderRadius:20, borderWidth:1, marginBottom:12, gap:4 },
  badgeText: { fontSize:12, fontWeight:"700", textTransform:"capitalize" },
  datesRow: { flexDirection:"row", gap:12, marginBottom:12 },
  dateBox: { flex:1, backgroundColor: C.surface, borderRadius:12, borderWidth:1, borderColor: C.border, padding:10 },
  dateLabel: { color: C.muted, fontSize:11, marginBottom:2 },
  dateVal: { color: C.white, fontWeight:"500", fontSize:13 },
  totalRow: { flexDirection:"row", alignItems:"center", justifyContent:"space-between" },
  totalLabel: { color: C.muted, fontSize:13 },
  totalVal: { color: C.primary, fontWeight:"700", fontSize:18 },
  cancelBtn: { marginTop:12, borderWidth:1, borderColor:"rgba(239,68,68,0.4)", borderRadius:12, paddingVertical:10, alignItems:"center" },
  cancelText: { color: C.red, fontWeight:"500", fontSize:14 },
});
