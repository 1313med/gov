import { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getOwnerBookings, updateBookingStatus, markBookingPaid } from "../src/api/booking";
import { useAppLang } from "../src/context/AppLangContext";
import { C } from "../src/theme";

const STATUS = {
  pending:   { bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.3)",  text:"#f59e0b",  icon:"time-outline" },
  confirmed: { bg:"rgba(52,211,153,0.1)",  border:"rgba(52,211,153,0.3)",  text:"#34d399",  icon:"checkmark-circle-outline" },
  completed: { bg:"rgba(96,165,250,0.1)",  border:"rgba(96,165,250,0.3)",  text:"#60a5fa",  icon:"flag-outline" },
  cancelled: { bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.3)",   text:"#ef4444",  icon:"close-circle-outline" },
};

const ACTION_COLOR = {
  green: { bg:"rgba(52,211,153,0.1)",  border:"rgba(52,211,153,0.3)",  text:"#34d399" },
  red:   { bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.3)",   text:"#ef4444" },
  blue:  { bg:"rgba(96,165,250,0.1)",  border:"rgba(96,165,250,0.3)",  text:"#60a5fa" },
};

function ActionBtn({ label, color, onPress }) {
  const c = ACTION_COLOR[color] || ACTION_COLOR.blue;
  return (
    <TouchableOpacity onPress={onPress} style={[s.actionBtn, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[s.actionBtnText, { color: c.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const FILTERS = ["all", "pending", "confirmed", "completed", "cancelled"];

export default function OwnerBookingsScreen() {
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    try { const { data } = await getOwnerBookings(); setBookings(data); }
    catch { Alert.alert("Failed to load bookings"); }
    finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { load(); }, []);

  const changeStatus = (id, status) => {
    const labels = { confirmed: fr ? "Confirmer" : "Confirm", completed: fr ? "Terminer" : "Complete", cancelled: fr ? "Annuler" : "Cancel" };
    Alert.alert(labels[status], fr ? "Êtes-vous sûr ?" : "Are you sure?", [
      { text: fr ? "Non" : "No" },
      { text: fr ? "Oui" : "Yes", onPress: async () => {
        try { await updateBookingStatus(id, status); load(); }
        catch { Alert.alert("Failed to update status"); }
      }},
    ]);
  };

  const handlePaid = (id) => Alert.alert(
    fr ? "Marquer payé" : "Mark as Paid",
    fr ? "Confirmer le paiement ?" : "Confirm payment received?",
    [
      { text: fr ? "Annuler" : "Cancel" },
      { text:"OK", onPress: async () => {
        try { await markBookingPaid(id); load(); }
        catch { Alert.alert("Failed to mark paid"); }
      }},
    ]
  );

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return <View style={s.center}><ActivityIndicator color={C.primary} size="large" /></View>;

  return (
    <View style={{ flex:1, backgroundColor: C.bg }}>
      {/* Filter tabs */}
      <View style={s.filterBar}>
        <FlatList
          horizontal data={FILTERS} keyExtractor={i => i} showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setFilter(item)} style={[s.filterTab, filter === item && s.filterTabActive]}>
              <Text style={[s.filterTabText, filter === item && s.filterTabTextActive]}>
                {item === "all" ? (fr ? "Tout" : "All") : item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered} keyExtractor={i => i._id}
        contentContainerStyle={{ padding:16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="clipboard-outline" size={56} color="#4b5563" />
            <Text style={s.emptyTitle}>{fr ? "Aucune réservation" : "No bookings"}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const st = STATUS[item.status] || STATUS.pending;
          const start = new Date(item.startDate).toLocaleDateString();
          const end = new Date(item.endDate).toLocaleDateString();
          return (
            <View style={s.card}>
              <Text style={s.rentalTitle} numberOfLines={1}>
                {item.rentalId?.title || `${item.rentalId?.brand} ${item.rentalId?.model}` || "Rental"}
              </Text>

              <View style={s.customerRow}>
                <View style={s.customerAvatar}>
                  <Text style={s.customerAvatarText}>{item.customerId?.name?.[0]?.toUpperCase() || "?"}</Text>
                </View>
                <Text style={s.customerName}>{item.customerId?.name || "Customer"}</Text>
              </View>

              <View style={[s.badge, { backgroundColor: st.bg, borderColor: st.border }]}>
                <Ionicons name={st.icon} size={12} color={st.text} />
                <Text style={[s.badgeText, { color: st.text }]}>{item.status}</Text>
              </View>

              <View style={s.datesRow}>
                <View style={s.dateBox}>
                  <Text style={s.dateLabel}>{fr ? "Début" : "Start"}</Text>
                  <Text style={s.dateVal}>{start}</Text>
                </View>
                <View style={s.dateBox}>
                  <Text style={s.dateLabel}>{fr ? "Fin" : "End"}</Text>
                  <Text style={s.dateVal}>{end}</Text>
                </View>
                <View style={s.dateBox}>
                  <Text style={s.dateLabel}>Total</Text>
                  <Text style={[s.dateVal, { color: C.primary }]}>{Number(item.totalAmount).toLocaleString()} MAD</Text>
                </View>
              </View>

              {item.paid && (
                <View style={s.paidRow}>
                  <Ionicons name="checkmark-circle" size={14} color={C.green} />
                  <Text style={s.paidText}>{fr ? "Payé" : "Paid"}</Text>
                </View>
              )}

              <View style={s.actionsRow}>
                {item.status === "pending" && (
                  <>
                    <ActionBtn label={fr ? "Confirmer" : "Confirm"} color="green" onPress={() => changeStatus(item._id, "confirmed")} />
                    <ActionBtn label={fr ? "Refuser" : "Reject"} color="red" onPress={() => changeStatus(item._id, "cancelled")} />
                  </>
                )}
                {item.status === "confirmed" && (
                  <>
                    <ActionBtn label={fr ? "Terminer" : "Complete"} color="blue" onPress={() => changeStatus(item._id, "completed")} />
                    {!item.paid && <ActionBtn label={fr ? "Marquer payé" : "Mark Paid"} color="green" onPress={() => handlePaid(item._id)} />}
                  </>
                )}
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
  filterBar: { paddingHorizontal:16, paddingTop:8, paddingBottom:12, backgroundColor: C.surface, borderBottomWidth:1, borderBottomColor: C.border },
  filterTab: { marginRight:8, paddingHorizontal:16, paddingVertical:8, borderRadius:20, borderWidth:1, backgroundColor: C.card, borderColor: C.border },
  filterTabActive: { backgroundColor:"rgba(124,107,255,0.15)", borderColor: C.primary },
  filterTabText: { color: C.muted, fontSize:12, fontWeight:"500", textTransform:"capitalize" },
  filterTabTextActive: { color: C.primary },
  empty: { alignItems:"center", paddingVertical:64 },
  emptyTitle: { color: C.white, fontWeight:"700", fontSize:18, marginTop:16 },
  card: { backgroundColor: C.card, borderWidth:1, borderColor: C.border, borderRadius:16, padding:16, marginBottom:16 },
  rentalTitle: { color: C.white, fontWeight:"700", fontSize:15, marginBottom:8 },
  customerRow: { flexDirection:"row", alignItems:"center", marginBottom:12 },
  customerAvatar: { width:28, height:28, borderRadius:14, backgroundColor:"rgba(124,107,255,0.2)", alignItems:"center", justifyContent:"center", marginRight:8 },
  customerAvatarText: { color: C.primary, fontSize:11, fontWeight:"700" },
  customerName: { color: C.muted, fontSize:13 },
  badge: { alignSelf:"flex-start", flexDirection:"row", alignItems:"center", borderWidth:1, borderRadius:20, paddingHorizontal:12, paddingVertical:4, marginBottom:12, gap:4 },
  badgeText: { fontSize:12, fontWeight:"700", textTransform:"capitalize" },
  datesRow: { flexDirection:"row", gap:8, marginBottom:12 },
  dateBox: { flex:1, backgroundColor: C.surface, borderWidth:1, borderColor: C.border, borderRadius:12, padding:10 },
  dateLabel: { color: C.muted, fontSize:11, marginBottom:2 },
  dateVal: { color: C.white, fontWeight:"500", fontSize:12 },
  paidRow: { flexDirection:"row", alignItems:"center", marginBottom:12 },
  paidText: { color: C.green, fontSize:12, fontWeight:"500", marginLeft:4 },
  actionsRow: { flexDirection:"row", flexWrap:"wrap", gap:8 },
  actionBtn: { flex:1, borderWidth:1, borderRadius:12, paddingVertical:10, alignItems:"center" },
  actionBtnText: { fontSize:13, fontWeight:"500" },
});
