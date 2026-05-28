import { useState, useEffect, useMemo } from "react";
import { PageLoader } from '../src/components/AppLoadingScreen';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getMySales, deleteSale, markAsSold } from "../src/api/sale";
import { useAppLang } from "../src/context/AppLangContext";
import { resolveMediaUrl } from "../src/utils/mediaUrl";
import { useTheme } from "../src/context/ThemeContext";

const STATUS = {
  pending:  { bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.3)",  text:"#f59e0b" },
  approved: { bg:"rgba(52,211,153,0.1)",  border:"rgba(52,211,153,0.3)",  text:"#34d399" },
  sold:     { bg:"rgba(96,165,250,0.1)",  border:"rgba(96,165,250,0.3)",  text:"#60a5fa" },
  rejected: { bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.3)",   text:"#ef4444" },
};

export default function MySalesScreen() {
  const { lang, pick } = useAppLang();
  const { colors: C } = useTheme();
  const s = useMemo(() => createMySalesStyles(C), [C]);
  const router = useRouter();
  const fr = lang === "fr";
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try { const { data } = await getMySales(); setSales(data); }
    catch { Alert.alert("Failed to load sales"); }
    finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { load(); }, []);

  const handleDelete = (id) => Alert.alert(
    pick("Delete Listing", "Supprimer l'annonce"),
    pick("This cannot be undone.", "Cette action est irréversible."),
    [
      { text: pick("Cancel", "Annuler") },
      { text: pick("Delete", "Supprimer"), style:"destructive", onPress: async () => {
        try { await deleteSale(id); load(); }
        catch { Alert.alert("Failed to delete"); }
      }},
    ]
  );

  const handleMarkSold = (id) => Alert.alert(
    pick("Mark as Sold", "Marquer comme vendu"),
    pick("Confirm?", "Confirmer ?"),
    [
      { text: pick("Cancel", "Annuler") },
      { text: pick("Confirm", "Confirmer"), onPress: async () => {
        try { await markAsSold(id); load(); }
        catch { Alert.alert("Failed to update"); }
      }},
    ]
  );

  if (loading) return <PageLoader />;

  return (
    <View style={{ flex:1, backgroundColor: C.bg }}>
      <TouchableOpacity onPress={() => router.push("/new-sale")} style={s.fab}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <FlatList
        data={sales} keyExtractor={i => i._id}
        contentContainerStyle={{ padding:16, paddingBottom:80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="pricetag-outline" size={56} color={C.muted} />
            <Text style={s.emptyTitle}>{pick("No listings yet", "Aucune annonce")}</Text>
            <TouchableOpacity onPress={() => router.push("/new-sale")} style={s.emptyBtn}>
              <Ionicons name="add-circle-outline" size={18} color="#fff" />
              <Text style={s.emptyBtnText}>{pick("Create a Listing", "Créer une annonce")}</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const st = STATUS[item.status] || STATUS.pending;
          const uri = resolveMediaUrl(item.images?.[0]);
          return (
            <View style={s.card}>
              {uri
                ? <Image source={{ uri }} style={s.cardImg} resizeMode="cover" />
                : <View style={s.cardImgPlaceholder}><Ionicons name="car-outline" size={48} color={C.muted} /></View>
              }
              <View style={s.cardBody}>
                <View style={s.cardTopRow}>
                  <Text style={s.cardTitle} numberOfLines={1}>{item.title || `${item.brand} ${item.model}`}</Text>
                  <Text style={s.cardPrice}>{item.price ? `${Number(item.price).toLocaleString()} MAD` : "—"}</Text>
                </View>
                <View style={[s.badge, { backgroundColor: st.bg, borderColor: st.border }]}>
                  <Text style={[s.badgeText, { color: st.text }]}>{item.status}</Text>
                </View>
                <View style={s.actionsRow}>
                  {item.status === "approved" && (
                    <TouchableOpacity onPress={() => handleMarkSold(item._id)} style={[s.actionBtn, { backgroundColor:"rgba(96,165,250,0.1)", borderColor:"rgba(96,165,250,0.3)" }]}>
                      <Text style={[s.actionBtnText, { color:"#60a5fa" }]}>{pick("Mark Sold", "Marquer vendu")}</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => handleDelete(item._id)} style={[s.actionBtn, { backgroundColor:"rgba(239,68,68,0.1)", borderColor:"rgba(239,68,68,0.3)" }]}>
                    <Text style={[s.actionBtnText, { color: C.red }]}>{pick("Delete", "Supprimer")}</Text>
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

function createMySalesStyles(C) {
  return StyleSheet.create({
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
    cardTopRow: { flexDirection:"row", alignItems:"flex-start", justifyContent:"space-between", marginBottom:8 },
    cardTitle: { color: C.white, fontWeight:"700", fontSize:15, flex:1, marginRight:8 },
    cardPrice: { color: C.primary, fontWeight:"700" },
    badge: { alignSelf:"flex-start", borderWidth:1, borderRadius:20, paddingHorizontal:12, paddingVertical:4, marginBottom:12 },
    badgeText: { fontSize:12, fontWeight:"700", textTransform:"capitalize" },
    actionsRow: { flexDirection:"row", gap:8 },
    actionBtn: { flex:1, borderWidth:1, borderRadius:12, paddingVertical:10, alignItems:"center" },
    actionBtnText: { fontSize:13, fontWeight:"500" },
  });
}
