import { useState, useEffect, useRef } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getConversations, getMessages, sendMessage } from "../../src/api/message";
import { useAuth } from "../../src/context/AuthContext";
import { useSocket } from "../../src/context/SocketContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { useRouter } from "expo-router";
import { C } from "../../src/theme";

export default function MessagesScreen() {
  const { auth } = useAuth();
  const { clearMessageBadge } = useSocket();
  const { lang } = useAppLang();
  const router = useRouter();
  const fr = lang === "fr";
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    clearMessageBadge();
    if (!auth) return;
    getConversations().then(({ data }) => setConversations(data)).catch(() => {}).finally(() => setLoading(false));
  }, [auth]);

  const openConv = async (conv) => {
    setActive(conv);
    try { const { data } = await getMessages(conv._id); setMessages(data); setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100); }
    catch {}
  };

  const handleSend = async () => {
    if (!text.trim() || !active || sending) return;
    setSending(true);
    try {
      const { data } = await sendMessage(active._id, text.trim());
      setMessages(p => [...p, data]); setText("");
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {}
    setSending(false);
  };

  if (!auth) return (
    <View style={s.center}>
      <Ionicons name="chatbubbles-outline" size={56} color="#4b5563" />
      <Text style={s.emptyTitle}>{fr?"Messages":"Messages"}</Text>
      <Text style={s.emptySub}>{fr?"Connectez-vous pour voir vos messages":"Login to view your messages"}</Text>
      <TouchableOpacity onPress={() => router.push("/(auth)/login")} style={s.loginBtn}>
        <Text style={s.loginBtnText}>{fr?"Connexion":"Login"}</Text>
      </TouchableOpacity>
    </View>
  );

  if (active) {
    const other = active.participants?.find(p => (p._id||p) !== auth._id);
    return (
      <KeyboardAvoidingView style={{ flex:1, backgroundColor: C.bg }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={s.chatHeader}>
          <TouchableOpacity onPress={() => setActive(null)} style={{ marginRight:12 }}>
            <Ionicons name="arrow-back" size={22} color={C.primary} />
          </TouchableOpacity>
          <View style={s.chatAvatar}><Text style={s.chatAvatarText}>{other?.name?.[0]?.toUpperCase()||"?"}</Text></View>
          <Text style={s.chatName} numberOfLines={1}>{other?.name||"Conversation"}</Text>
        </View>
        <FlatList ref={listRef} data={messages} keyExtractor={i => i._id} contentContainerStyle={{ padding:16 }}
          renderItem={({ item }) => {
            const isMe = item.senderId === auth._id || item.senderId?._id === auth._id;
            return (
              <View style={[s.msgWrap, isMe ? s.msgMe : s.msgThem]}>
                <View style={[s.msgBubble, isMe ? s.bubbleMe : s.bubbleThem]}>
                  <Text style={s.msgText}>{item.text}</Text>
                </View>
                <Text style={s.msgTime}>{new Date(item.createdAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</Text>
              </View>
            );
          }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />
        <View style={s.inputBar}>
          <View style={s.inputWrap}>
            <TextInput value={text} onChangeText={setText} placeholder={fr?"Écrire…":"Write a message…"} placeholderTextColor={C.muted} style={s.msgInput} multiline />
          </View>
          <TouchableOpacity onPress={handleSend} disabled={!text.trim()||sending} style={[s.sendBtn, (!text.trim()||sending) && { opacity:0.5 }]}>
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={{ flex:1, backgroundColor: C.bg }}>
      <View style={s.header}><Text style={s.headerTitle}>{fr?"Messages":"Messages"}</Text></View>
      {loading
        ? <View style={s.center}><ActivityIndicator color={C.primary} size="large" /></View>
        : conversations.length === 0
          ? <View style={s.center}>
              <Ionicons name="chatbubbles-outline" size={56} color="#4b5563" />
              <Text style={s.emptyTitle}>{fr?"Aucun message":"No messages yet"}</Text>
              <Text style={s.emptySub}>{fr?"Contactez un vendeur depuis une annonce.":"Contact a seller from a listing."}</Text>
            </View>
          : <FlatList data={conversations} keyExtractor={i => i._id} contentContainerStyle={{ padding:16 }}
              renderItem={({ item }) => {
                const other = item.participants?.find(p => (p._id||p) !== auth._id);
                return (
                  <TouchableOpacity onPress={() => openConv(item)} style={s.convCard}>
                    <View style={s.convAvatar}><Text style={s.convAvatarText}>{other?.name?.[0]?.toUpperCase()||"?"}</Text></View>
                    <View style={{ flex:1 }}>
                      <Text style={s.convName}>{other?.name||"User"}</Text>
                      <Text style={s.convLast} numberOfLines={1}>{item.lastMessage?.text||"No messages yet"}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={C.muted} />
                  </TouchableOpacity>
                );
              }}
            />
      }
    </View>
  );
}

const s = StyleSheet.create({
  header: { paddingTop:56, paddingBottom:16, paddingHorizontal:16, backgroundColor: C.surface, borderBottomWidth:1, borderBottomColor: C.border },
  headerTitle: { color: C.white, fontWeight:"700", fontSize:20 },
  center: { flex:1, alignItems:"center", justifyContent:"center", padding:24 },
  emptyTitle: { color: C.white, fontWeight:"700", fontSize:18, marginTop:16, marginBottom:8 },
  emptySub: { color: C.muted, fontSize:13, textAlign:"center" },
  loginBtn: { backgroundColor: C.primary, borderRadius:12, paddingHorizontal:24, paddingVertical:12, marginTop:16 },
  loginBtnText: { color:"#fff", fontWeight:"700" },
  chatHeader: { paddingTop:56, paddingBottom:16, paddingHorizontal:16, backgroundColor: C.surface, borderBottomWidth:1, borderBottomColor: C.border, flexDirection:"row", alignItems:"center" },
  chatAvatar: { width:36, height:36, borderRadius:18, backgroundColor:"rgba(124,107,255,0.2)", alignItems:"center", justifyContent:"center", marginRight:12 },
  chatAvatarText: { color: C.primary, fontWeight:"700" },
  chatName: { color: C.white, fontWeight:"700", fontSize:16, flex:1 },
  msgWrap: { marginBottom:12, maxWidth:"75%" },
  msgMe: { alignSelf:"flex-end" },
  msgThem: { alignSelf:"flex-start" },
  msgBubble: { borderRadius:16, paddingHorizontal:16, paddingVertical:10 },
  bubbleMe: { backgroundColor: C.primary },
  bubbleThem: { backgroundColor: C.card, borderWidth:1, borderColor: C.border },
  msgText: { color:"#fff", fontSize:14 },
  msgTime: { color: C.muted, fontSize:11, marginTop:4, paddingHorizontal:4 },
  inputBar: { paddingHorizontal:16, paddingVertical:12, backgroundColor: C.surface, borderTopWidth:1, borderTopColor: C.border, flexDirection:"row", alignItems:"center" },
  inputWrap: { flex:1, backgroundColor: C.card, borderRadius:12, borderWidth:1, borderColor: C.border, paddingHorizontal:12, marginRight:8 },
  msgInput: { color: C.white, paddingVertical:10, maxHeight:100 },
  sendBtn: { width:44, height:44, backgroundColor: C.primary, borderRadius:12, alignItems:"center", justifyContent:"center" },
  convCard: { backgroundColor: C.card, borderWidth:1, borderColor: C.border, borderRadius:16, flexDirection:"row", alignItems:"center", paddingHorizontal:16, paddingVertical:16, marginBottom:12 },
  convAvatar: { width:48, height:48, borderRadius:24, backgroundColor:"rgba(124,107,255,0.2)", alignItems:"center", justifyContent:"center", marginRight:12 },
  convAvatarText: { color: C.primary, fontWeight:"700", fontSize:18 },
  convName: { color: C.white, fontWeight:"700", marginBottom:4 },
  convLast: { color: C.muted, fontSize:13 },
});
