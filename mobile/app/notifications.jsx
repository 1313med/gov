import { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getNotifications, markAsRead } from "../src/api/notification";
import { useSocket } from "../src/context/SocketContext";
import { useAppLang } from "../src/context/AppLangContext";
import { C } from "../src/theme";

const ICONS = { booking:["calendar",C.primary], message:["chatbubble",C.accent], approval:["checkmark-circle",C.green], rejection:["close-circle",C.red], default:["notifications",C.primary] };

function timeAgo(date, fr) {
  const mins = Math.floor((Date.now() - new Date(date)) / 60000);
  const h = Math.floor(mins/60), d = Math.floor(h/24);
  if (fr) { if (mins<1) return "À l'instant"; if (mins<60) return `Il y a ${mins} min`; if (h<24) return `Il y a ${h} h`; return `Il y a ${d} j`; }
  if (mins<1) return "Just now"; if (mins<60) return `${mins}m ago`; if (h<24) return `${h}h ago`; return `${d}d ago`;
}

export default function NotificationsScreen() {
  const { clearNotificationBadge } = useSocket();
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try { const { data } = await getNotifications(); setNotifs(data); clearNotificationBadge(); }
    catch {} finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { load(); }, []);

  const read = async (n) => {
    if (n.read) return;
    try { await markAsRead(n._id); setNotifs(p => p.map(x => x._id===n._id ? {...x,read:true} : x)); } catch {}
  };

  if (loading) return <View style={s.center}><ActivityIndicator color={C.primary} size="large" /></View>;

  return (
    <View style={{ flex:1, backgroundColor: C.bg }}>
      <FlatList data={notifs} keyExtractor={i => i._id} contentContainerStyle={{ padding:16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
        ListEmptyComponent={
          <View style={s.center}>
            <Ionicons name="notifications-off-outline" size={56} color="#4b5563" />
            <Text style={s.emptyTitle}>{fr?"Aucune notification":"No notifications"}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const [icon, color] = ICONS[item.type] || ICONS.default;
          return (
            <TouchableOpacity onPress={() => read(item)} style={[s.card, item.read ? s.cardRead : s.cardUnread]}>
              <View style={[s.iconBox, { backgroundColor: color+"20" }]}><Ionicons name={icon} size={20} color={color} /></View>
              <View style={{ flex:1 }}>
                <Text style={[s.msg, !item.read && s.msgUnread]}>{item.message}</Text>
                <Text style={s.time}>{timeAgo(item.createdAt, fr)}</Text>
              </View>
              {!item.read && <View style={s.dot} />}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex:1, alignItems:"center", justifyContent:"center", padding:24 },
  emptyTitle: { color: C.white, fontWeight:"700", fontSize:18, marginTop:16 },
  card: { flexDirection:"row", alignItems:"flex-start", padding:16, marginBottom:12, borderRadius:16, borderWidth:1, gap:12 },
  cardRead: { backgroundColor: C.card, borderColor: C.border },
  cardUnread: { backgroundColor:"rgba(124,107,255,0.05)", borderColor:"rgba(124,107,255,0.2)" },
  iconBox: { width:40, height:40, borderRadius:20, alignItems:"center", justifyContent:"center" },
  msg: { color:"#cbd5e1", fontSize:13, lineHeight:20 },
  msgUnread: { color: C.white, fontWeight:"500" },
  time: { color: C.muted, fontSize:11, marginTop:4 },
  dot: { width:8, height:8, borderRadius:4, backgroundColor: C.primary, marginTop:6 },
});
