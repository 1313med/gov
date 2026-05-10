import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Pressable,
  Image,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getConversations, getMessages, sendMessage } from "../../src/api/message";
import { useAuth } from "../../src/context/AuthContext";
import { useSocket } from "../../src/context/SocketContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { useRouter } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";
import { resolveMediaUrl } from "../../src/utils/mediaUrl";

const { width: SCREEN_W } = Dimensions.get("window");

function GlowOrb({ style, colors, scaleAnim, pointerEvents: pe = "none" }) {
  return (
    <Animated.View
      pointerEvents={pe}
      style={[{ position: "absolute", borderRadius: 999, opacity: 0.42, overflow: "hidden" }, style, { transform: [{ scale: scaleAnim }] }]}
    >
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

function HeroShimmer({ color, track }) {
  const x = useRef(new Animated.Value(-1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(x, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(x, { toValue: -1, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [x]);
  const translateX = x.interpolate({
    inputRange: [-1, 1],
    outputRange: [-SCREEN_W * 0.45, SCREEN_W * 0.45],
  });
  return (
    <View style={{ height: 2, borderRadius: 1, overflow: "hidden", marginTop: 14, backgroundColor: track }}>
      <Animated.View
        style={{
          width: "36%",
          height: "100%",
          backgroundColor: color,
          opacity: 0.85,
          borderRadius: 1,
          transform: [{ translateX }],
        }}
      />
    </View>
  );
}

function formatConvTime(iso, fr) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString(fr ? "fr-FR" : "en-US", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString(fr ? "fr-FR" : "en-US", { day: "numeric", month: "short" });
}

function unreadForUser(conv, userId) {
  const m = conv?.unreadCount;
  if (!m || typeof m !== "object") return 0;
  const id = userId != null ? String(userId) : "";
  return Number(m[id] ?? m[userId] ?? 0) || 0;
}

function lastMessagePreview(item, fr) {
  const lm = item?.lastMessage;
  if (lm == null) return fr ? "Aucun message" : "No messages yet";
  if (typeof lm === "string") return lm;
  if (typeof lm === "object" && lm.text) return lm.text;
  return fr ? "Aucun message" : "No messages yet";
}

function ConversationRow({ item, onOpen, authId, fr, C, isDark, titleColor, subColor, ctaGrad }) {
  const other = item.participants?.find((p) => String(p._id || p) !== String(authId));
  const name = other?.name || "User";
  const initial = name[0]?.toUpperCase() || "?";
  const avatarUri = other?.avatar ? resolveMediaUrl(other.avatar) : null;
  const unread = unreadForUser(item, authId);
  const timeStr = formatConvTime(item.lastMessageAt, fr);
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () => Animated.spring(scale, { toValue: 0.98, friction: 6, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  const preview = lastMessagePreview(item, fr);

  return (
    <Pressable onPress={() => onOpen(item)} onPressIn={pressIn} onPressOut={pressOut}>
      <Animated.View
        style={{
          transform: [{ scale }],
          marginBottom: 14,
          borderRadius: 20,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: isDark ? "rgba(124,107,255,0.2)" : "rgba(98,72,232,0.14)",
          backgroundColor: C.card,
          shadowColor: C.primary,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: isDark ? 0.15 : 0.08,
          shadowRadius: 16,
          elevation: 5,
        }}
      >
        <LinearGradient
          colors={isDark ? ["rgba(124,107,255,0.06)", "transparent"] : ["rgba(98,72,232,0.05)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
          <LinearGradient colors={ctaGrad} style={{ width: 54, height: 54, borderRadius: 18, padding: 2, marginRight: 14 }}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={{ width: 50, height: 50, borderRadius: 16 }} />
            ) : (
              <View style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: isDark ? "#0f1123" : "#f1f5f9", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: C.primary, fontWeight: "900", fontSize: 20 }}>{initial}</Text>
              </View>
            )}
          </LinearGradient>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <Text style={{ color: titleColor, fontWeight: "800", fontSize: 16, flex: 1 }} numberOfLines={1}>
                {name}
              </Text>
              {!!timeStr && <Text style={{ color: subColor, fontSize: 11, fontWeight: "600" }}>{timeStr}</Text>}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, gap: 8 }}>
              <Text style={{ color: unread > 0 ? titleColor : subColor, fontSize: 14, fontWeight: unread > 0 ? "700" : "500", flex: 1 }} numberOfLines={1}>
                {preview}
              </Text>
              {unread > 0 ? (
                <View style={{ backgroundColor: C.primary, minWidth: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 }}>
                  <Text style={{ color: "#fff", fontSize: 11, fontWeight: "900" }}>{unread > 9 ? "9+" : unread}</Text>
                </View>
              ) : null}
            </View>
          </View>
          <View style={{ marginLeft: 8, width: 32, height: 32, borderRadius: 10, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="chevron-forward" size={18} color={C.muted} />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function MessagesScreen() {
  const { auth } = useAuth();
  const { clearMessageBadge } = useSocket();
  const { lang } = useAppLang();
  const { colors: C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const fr = lang === "fr";
  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#94a3b8" : "#64748b";
  const heroGrad = isDark ? ["#03040a", "#120a24", "#0a1628", "#05060f"] : ["#faf5ff", "#e0f2fe", "#f0f9ff", "#f8fafc"];
  const orbA = isDark ? ["rgba(124,107,255,0.4)", "rgba(124,107,255,0)"] : ["rgba(98,72,232,0.28)", "rgba(98,72,232,0)"];
  const orbB = isDark ? ["rgba(56,189,248,0.28)", "rgba(56,189,248,0)"] : ["rgba(14,165,233,0.2)", "rgba(14,165,233,0)"];
  const ctaGrad = isDark ? ["#7c6bff", "#5b4ddb", "#4338ca"] : ["#6248e8", "#4f46e5", "#4338ca"];
  const shimmerTrack = isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.08)";

  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  const orbPulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, { toValue: 1.06, duration: 4200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orbPulse, { toValue: 1, duration: 4200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [orbPulse]);

  const fetchConversations = useCallback(() => {
    return getConversations()
      .then(({ data }) => setConversations(Array.isArray(data) ? data : []))
      .catch(() => setConversations([]));
  }, []);

  useEffect(() => {
    clearMessageBadge();
    if (!auth) return;
    fetchConversations().finally(() => setLoading(false));
  }, [auth, fetchConversations, clearMessageBadge]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversations().finally(() => setRefreshing(false));
  }, [fetchConversations]);

  const openConv = async (conv) => {
    setActive(conv);
    try {
      const { data } = await getMessages(conv._id);
      setMessages(Array.isArray(data) ? data : []);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
      fetchConversations();
    } catch {
      setMessages([]);
    }
  };

  const handleSend = async () => {
    if (!text.trim() || !active || sending) return;
    setSending(true);
    try {
      const { data } = await sendMessage(active._id, text.trim());
      setMessages((p) => [...p, data]);
      setText("");
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
      fetchConversations();
    } catch {}
    setSending(false);
  };

  const guestLogin = (
    <LinearGradient colors={heroGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, paddingTop: insets.top + 32, paddingHorizontal: 24 }}>
      <GlowOrb scaleAnim={orbPulse} colors={orbA} style={{ width: 240, height: 240, top: -50, right: -80 }} />
      <GlowOrb scaleAnim={orbPulse} colors={orbB} style={{ width: 200, height: 200, bottom: 120, left: -90 }} />
      <Text style={{ color: C.primary, fontSize: 10, fontWeight: "800", letterSpacing: 2.2, textTransform: "uppercase", marginBottom: 10 }}>
        {fr ? "Boîte de réception" : "Inbox"}
      </Text>
      <Text style={{ color: titleColor, fontWeight: "900", fontSize: 30, letterSpacing: -0.8, lineHeight: 36 }}>
        {fr ? "Vos " : "Your "}
        <Text style={{ fontStyle: "italic", color: C.primary, fontWeight: "900" }}>{fr ? "échanges" : "conversations"}</Text>
      </Text>
      <Text style={{ color: subColor, fontSize: 15, lineHeight: 23, marginTop: 14, maxWidth: 320 }}>
        {fr ? "Connectez-vous pour échanger avec vendeurs et loueurs en toute simplicité." : "Sign in to chat with sellers and hosts in one elegant thread."}
      </Text>
      <HeroShimmer color={C.primary} track={shimmerTrack} />
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: 48 }}>
        <LinearGradient colors={isDark ? ["rgba(124,107,255,0.2)", "rgba(56,189,248,0.12)"] : ["rgba(98,72,232,0.14)", "rgba(14,165,233,0.08)"]} style={{ width: 100, height: 100, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <Ionicons name="chatbubbles-outline" size={44} color={C.primary} />
        </LinearGradient>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")} activeOpacity={0.92} style={{ width: "100%", maxWidth: 320 }}>
          <LinearGradient colors={ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 16, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>{fr ? "Connexion" : "Login"}</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  if (!auth) return <View style={{ flex: 1, backgroundColor: C.bg }}>{guestLogin}</View>;

  const listHeader = (
    <LinearGradient colors={heroGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: insets.top + 10, paddingBottom: 22, overflow: "hidden" }}>
      <GlowOrb scaleAnim={orbPulse} colors={orbA} style={{ width: 200, height: 200, top: -70, right: -60 }} />
      <GlowOrb scaleAnim={orbPulse} colors={orbB} style={{ width: 170, height: 170, bottom: -40, left: -70 }} />
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ color: C.primary, fontSize: 10, fontWeight: "800", letterSpacing: 2.2, textTransform: "uppercase", marginBottom: 8 }}>{fr ? "Boîte de réception" : "Inbox"}</Text>
        <Text style={{ color: titleColor, fontWeight: "900", fontSize: 28, letterSpacing: -0.8, lineHeight: 34 }}>
          {fr ? "Messages" : "Messages"}
        </Text>
        <Text style={{ color: subColor, fontSize: 14, lineHeight: 21, marginTop: 10, fontWeight: "500", maxWidth: 340 }}>
          {fr
            ? "Touchez une conversation pour reprendre où vous vous êtes arrêté."
            : "Tap a thread to pick up where you left off — fast, clear, and calm."}
        </Text>
        <HeroShimmer color={C.primary} track={shimmerTrack} />
      </View>
    </LinearGradient>
  );

  if (active) {
    const other = active.participants?.find((p) => String(p._id || p) !== String(auth._id));
    const chatName = other?.name || (fr ? "Conversation" : "Conversation");
    const initial = chatName[0]?.toUpperCase() || "?";
    const avatarUri = other?.avatar ? resolveMediaUrl(other.avatar) : null;

    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
        <View style={{ flex: 1 }}>
          <LinearGradient colors={heroGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: insets.top + 8, paddingBottom: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: isDark ? "rgba(124,107,255,0.15)" : "rgba(98,72,232,0.12)" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Pressable
                onPress={() => setActive(null)}
                style={({ pressed }) => [
                  {
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                    opacity: pressed ? 0.85 : 1,
                    borderWidth: 1,
                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)",
                    backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.75)",
                  },
                ]}
              >
                <Ionicons name="arrow-back" size={22} color={C.primary} />
              </Pressable>
              <LinearGradient colors={ctaGrad} style={{ width: 46, height: 46, borderRadius: 16, padding: 2, marginRight: 12 }}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={{ width: 42, height: 42, borderRadius: 14 }} />
                ) : (
                  <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: isDark ? "#0f1123" : "#f1f5f9", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: isDark ? "#f1f5f9" : C.primary, fontWeight: "900", fontSize: 18 }}>{initial}</Text>
                  </View>
                )}
              </LinearGradient>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ color: titleColor, fontWeight: "900", fontSize: 17, letterSpacing: -0.3 }} numberOfLines={1}>
                  {chatName}
                </Text>
                <Text style={{ color: subColor, fontSize: 12, fontWeight: "600", marginTop: 2 }}>{fr ? "Discussion en direct" : "Live conversation"}</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={{ flex: 1, backgroundColor: C.bg }}>
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(i) => i._id}
              contentContainerStyle={{ padding: 18, paddingBottom: 24, flexGrow: 1 }}
              style={{ flex: 1, backgroundColor: C.bg }}
              refreshControl={<RefreshControl refreshing={false} onRefresh={() => openConv(active)} tintColor={C.primary} />}
              renderItem={({ item }) => {
                const isMe = String(item.senderId?._id || item.senderId) === String(auth._id);
                const t = new Date(item.createdAt).toLocaleTimeString(fr ? "fr-FR" : "en-US", { hour: "2-digit", minute: "2-digit" });
                return (
                  <View style={{ marginBottom: 14, maxWidth: "82%", alignSelf: isMe ? "flex-end" : "flex-start" }}>
                    {isMe ? (
                      <LinearGradient colors={ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 18, borderBottomRightRadius: 6, paddingHorizontal: 16, paddingVertical: 12 }}>
                        <Text style={{ color: "#fff", fontSize: 15, lineHeight: 22, fontWeight: "500" }}>{item.text}</Text>
                      </LinearGradient>
                    ) : (
                      <View
                        style={{
                          borderRadius: 18,
                          borderBottomLeftRadius: 6,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
                          borderWidth: 1,
                          borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)",
                        }}
                      >
                        <Text style={{ color: titleColor, fontSize: 15, lineHeight: 22, fontWeight: "500" }}>{item.text}</Text>
                      </View>
                    )}
                    <Text style={{ color: subColor, fontSize: 10, fontWeight: "600", marginTop: 5, alignSelf: isMe ? "flex-end" : "flex-start", paddingHorizontal: 4 }}>{t}</Text>
                  </View>
                );
              }}
              onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
              ListEmptyComponent={
                <View style={{ alignItems: "center", paddingVertical: 48 }}>
                  <Ionicons name="chatbubble-ellipses-outline" size={48} color={C.muted} />
                  <Text style={{ color: subColor, fontSize: 14, marginTop: 12, fontWeight: "600" }}>{fr ? "Écrivez le premier message" : "Send the first message"}</Text>
                </View>
              }
            />
          </View>

          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: Math.max(insets.bottom, 12),
              borderTopWidth: 1,
              borderTopColor: isDark ? "rgba(124,107,255,0.12)" : "rgba(98,72,232,0.1)",
              backgroundColor: isDark ? "rgba(15,17,35,0.96)" : "rgba(255,255,255,0.95)",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10 }}>
              <View
                style={{
                  flex: 1,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: isDark ? "rgba(124,107,255,0.22)" : "rgba(98,72,232,0.18)",
                  backgroundColor: isDark ? C.card : "#f8fafc",
                  paddingHorizontal: 16,
                  paddingVertical: 4,
                  maxHeight: 120,
                }}
              >
                <TextInput
                  value={text}
                  onChangeText={setText}
                  placeholder={fr ? "Écrire un message…" : "Write a message…"}
                  placeholderTextColor={C.muted}
                  style={{ color: titleColor, paddingVertical: 12, fontSize: 16, maxHeight: 100 }}
                  multiline
                />
              </View>
              <Pressable onPress={handleSend} disabled={!text.trim() || sending} style={({ pressed }) => [{ opacity: pressed || !text.trim() || sending ? 0.65 : 1 }]}>
                <LinearGradient colors={ctaGrad} style={{ width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" }}>
                  {sending ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="send" size={22} color="#fff" />}
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" }}>
        <LinearGradient colors={ctaGrad} style={{ width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <ActivityIndicator color="#fff" size="large" />
        </LinearGradient>
        <Text style={{ color: subColor, fontSize: 14, fontWeight: "600" }}>{fr ? "Chargement…" : "Loading…"}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {conversations.length === 0 ? (
        <FlatList
          data={[]}
          ListHeaderComponent={
            <>
              {listHeader}
              <View style={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48, alignItems: "center" }}>
                <LinearGradient colors={isDark ? ["rgba(124,107,255,0.2)", "rgba(56,189,248,0.12)"] : ["rgba(98,72,232,0.14)", "rgba(14,165,233,0.08)"]} style={{ width: 96, height: 96, borderRadius: 32, alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <Ionicons name="chatbubbles-outline" size={44} color={C.primary} />
                </LinearGradient>
                <Text style={{ color: titleColor, fontWeight: "800", fontSize: 19, textAlign: "center" }}>{fr ? "Aucune conversation" : "No conversations yet"}</Text>
                <Text style={{ color: subColor, fontSize: 14, marginTop: 10, textAlign: "center", lineHeight: 21, maxWidth: 300 }}>
                  {fr ? "Ouvrez une annonce et contactez le vendeur ou le loueur." : "Open a listing and message the seller or host."}
                </Text>
              </View>
            </>
          }
          renderItem={() => null}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(i) => i._id}
          ListHeaderComponent={listHeader}
          contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 28 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
          renderItem={({ item }) => (
            <ConversationRow item={item} onOpen={openConv} authId={auth._id} fr={fr} C={C} isDark={isDark} titleColor={titleColor} subColor={subColor} ctaGrad={ctaGrad} />
          )}
        />
      )}
    </View>
  );
}
