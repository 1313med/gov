import { useCallback, useEffect, useRef, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, StyleSheet, Image,
  Animated, Easing, Alert, ActivityIndicator, Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../../src/context/ThemeContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { mechanicChat } from "../../src/api/mechanic";

/* ── quick-start suggestions ─────────────────────────────────── */
const SUGGESTIONS = [
  { en: "⚠️ Engine warning light is on", fr: "⚠️ Voyant moteur allumé", da: "⚠️ Voyant moteur chema" },
  { en: "🔋 Battery light on dashboard", fr: "🔋 Voyant batterie allumé", da: "🔋 Voyant batterie wled" },
  { en: "🌡️ Engine overheating", fr: "🌡️ Moteur surchauffe", da: "🌡️ Moteur skhon bzaf" },
  { en: "🔧 Grinding noise when braking", fr: "🔧 Bruit quand je freine", da: "🔧 Kadir bruit mnin kanserfana" },
  { en: "💨 Car shakes at high speed", fr: "💨 La voiture tremble", da: "💨 Tomobile katlouzoz" },
  { en: "⛽ High fuel consumption", fr: "⛽ Consommation élevée", da: "⛽ Kaysref bzzaf essence" },
];

/* ── typing dots ─────────────────────────────────────────────── */
function TypingDots({ color }) {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  useEffect(() => {
    const anims = dots.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(v, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 300, easing: Easing.in(Easing.cubic),  useNativeDriver: true }),
          Animated.delay(560 - i * 160),
        ])
      )
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, []);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 4 }}>
      {dots.map((v, i) => (
        <Animated.View
          key={i}
          style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: color, opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }] }}
        />
      ))}
    </View>
  );
}

/* ── message bubble ─────────────────────────────────────────── */
function Bubble({ msg, isDark, C, ctaGrad }) {
  const isUser = msg.role === "user";
  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor   = isDark ? "#94a3b8" : "#64748b";

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(isUser ? 12 : -12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        S.bubbleRow,
        isUser ? S.bubbleRowUser : S.bubbleRowAI,
        { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
      ]}
    >
      {/* AI avatar */}
      {!isUser && (
        <View style={[S.aiAvatar, { backgroundColor: isDark ? "rgba(124,107,255,0.18)" : "rgba(98,72,232,0.1)", borderColor: isDark ? "rgba(124,107,255,0.3)" : "rgba(98,72,232,0.2)" }]}>
          <Ionicons name="construct" size={16} color={C.primary} />
        </View>
      )}

      <View style={[S.bubbleWrap, isUser ? { alignItems: "flex-end" } : { alignItems: "flex-start" }, { maxWidth: "82%" }]}>
        {/* Image preview */}
        {msg.imageUri && (
          <View style={[S.imgPreviewWrap, isUser ? { borderRadius: 18, borderBottomRightRadius: 5 } : { borderRadius: 18, borderBottomLeftRadius: 5 }]}>
            <Image source={{ uri: msg.imageUri }} style={S.imgPreview} resizeMode="cover" />
          </View>
        )}

        {/* Bubble body */}
        {msg.isLoading ? (
          <View style={[S.bubble, S.bubbleAI, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "#fff", borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)" }]}>
            <TypingDots color={C.primary} />
          </View>
        ) : isUser ? (
          <LinearGradient colors={ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[S.bubble, S.bubbleUser]}>
            {msg.text ? <Text style={S.bubbleUserText}>{msg.text}</Text> : null}
          </LinearGradient>
        ) : (
          <View style={[S.bubble, S.bubbleAI, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "#fff", borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)" }]}>
            {msg.text ? <Text style={[S.bubbleAIText, { color: titleColor }]}>{msg.text}</Text> : null}
          </View>
        )}

        {/* Timestamp */}
        {!msg.isLoading && (
          <Text style={[S.timestamp, { color: subColor }]}>
            {new Date(msg.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

/* ── main screen ─────────────────────────────────────────────── */
export default function MechanicScreen() {
  const { colors: C, isDark } = useTheme();
  const { pick, lang }        = useAppLang();
  const insets                = useSafeAreaInsets();

  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor   = isDark ? "#94a3b8" : "#64748b";
  const ctaGrad    = isDark ? ["#7c6bff", "#5b4ddb"] : ["#6248e8", "#4f46e5"];
  const heroBg     = isDark ? ["#09090f", "#120b22"] : ["#f8f5ff", "#fff"];

  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState("");
  const [pendingImg, setPendingImg] = useState(null); // { uri, base64, mimeType }
  const [loading,   setLoading]   = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const listRef  = useRef(null);
  const inputRef = useRef(null);

  /* welcome message */
  useEffect(() => {
    const welcome = {
      id: "welcome",
      role: "assistant",
      text: pick(
        "👋 Hello! I'm Mécanicien Goovoiture.\n\nAsk me anything about your car — warning lights, strange noises, fuel consumption, or any mechanical issue. You can also take a photo of a dashboard symbol and I'll explain it.\n\n🌍 You can ask in English, French, or Darija!",
        "👋 Bonjour ! Je suis le Mécanicien Goovoiture.\n\nPosez-moi toutes vos questions sur votre voiture — voyants, bruits, consommation, ou tout problème mécanique. Vous pouvez aussi photographier un symbole du tableau de bord et je l'expliquerai.\n\n🌍 Posez vos questions en français, anglais ou darija !"
      ),
      ts: Date.now(),
    };
    setMessages([welcome]);
  }, []);

  const scrollToBottom = useCallback((animated = true) => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated }), 80);
  }, []);

  useEffect(() => { scrollToBottom(false); }, [messages]);

  /* pick image from gallery */
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { Alert.alert(pick("Permission required", "Permission requise"), pick("Allow photo access to attach images.", "Autorisez l'accès aux photos.")); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      base64: true,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setPendingImg({ uri: asset.uri, base64: asset.base64, mimeType: asset.mimeType || "image/jpeg" });
    }
  };

  /* take photo with camera */
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") { Alert.alert(pick("Camera permission required", "Permission caméra requise"), pick("Allow camera access.", "Autorisez l'accès à la caméra.")); return; }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.6,
      base64: true,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setPendingImg({ uri: asset.uri, base64: asset.base64, mimeType: asset.mimeType || "image/jpeg" });
    }
  };

  /* show camera options */
  const handleImagePress = () => {
    Alert.alert(
      pick("Attach image", "Joindre une image"),
      pick("Take a photo or choose from gallery", "Prendre une photo ou choisir dans la galerie"),
      [
        { text: pick("Camera", "Caméra"),  onPress: takePhoto },
        { text: pick("Gallery", "Galerie"), onPress: pickImage },
        { text: pick("Cancel", "Annuler"),  style: "cancel" },
      ]
    );
  };

  /* send message */
  const handleSend = async () => {
    const text = input.trim();
    if (!text && !pendingImg) return;

    setShowSuggestions(false);
    const userMsg = { id: `u-${Date.now()}`, role: "user", text, imageUri: pendingImg?.uri || null, ts: Date.now() };
    const loadingMsg = { id: "loading", role: "assistant", isLoading: true, text: "", ts: Date.now() };

    setMessages((p) => [...p, userMsg, loadingMsg]);
    setInput("");
    setPendingImg(null);
    setLoading(true);
    scrollToBottom();

    // Build conversation history for context (text only, last 10)
    const history = messages
      .filter((m) => !m.isLoading && m.id !== "welcome")
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.text || "" }));

    try {
      const { data } = await mechanicChat({
        message: text || undefined,
        history,
        imageBase64: pendingImg?.base64 || undefined,
        imageMimeType: pendingImg?.mimeType || undefined,
      });

      const aiMsg = { id: `a-${Date.now()}`, role: "assistant", text: data.reply || "…", ts: Date.now() };
      setMessages((p) => p.filter((m) => m.id !== "loading").concat(aiMsg));
    } catch (e) {
      const errText = e?.response?.data?.message || pick("Connection error. Check server.", "Erreur de connexion. Vérifiez le serveur.");
      const errMsg = { id: `err-${Date.now()}`, role: "assistant", text: `❌ ${errText}`, ts: Date.now() };
      setMessages((p) => p.filter((m) => m.id !== "loading").concat(errMsg));
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (sug) => {
    const text = lang === "fr" ? sug.fr : lang === "ar" ? sug.da : sug.en;
    setInput(text);
    inputRef.current?.focus();
  };

  const clearChat = () => {
    Alert.alert(
      pick("Clear chat", "Effacer la conversation"),
      pick("Start a new conversation?", "Commencer une nouvelle conversation ?"),
      [
        { text: pick("Cancel", "Annuler"), style: "cancel" },
        { text: pick("Clear", "Effacer"), style: "destructive", onPress: () => {
          setMessages([{
            id: "welcome",
            role: "assistant",
            text: pick(
              "👋 New conversation started. Ask me anything about your car!",
              "👋 Nouvelle conversation démarrée. Posez-moi vos questions sur votre voiture !"
            ),
            ts: Date.now(),
          }]);
          setShowSuggestions(true);
        }},
      ]
    );
  };

  return (
    <View style={[S.screen, { backgroundColor: C.bg }]}>

      {/* ── Header ── */}
      <LinearGradient colors={heroBg} style={[S.header, { paddingTop: insets.top + 10, borderBottomColor: isDark ? "rgba(124,107,255,0.18)" : "rgba(98,72,232,0.1)" }]}>
        <View style={S.headerInner}>
          <View style={S.headerLeft}>
            <LinearGradient colors={ctaGrad} style={S.headerIcon}>
              <Ionicons name="construct" size={20} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={[S.headerTitle, { color: titleColor }]}>Mécanicien</Text>
              <Text style={[S.headerSubtitle, { color: C.primary }]}>Goovoiture</Text>
            </View>
          </View>
          <View style={S.headerRight}>
            <View style={S.onlineDot} />
            <Text style={[S.onlineText, { color: "#10b981" }]}>{pick("Online", "En ligne")}</Text>
            <TouchableOpacity onPress={clearChat} hitSlop={12} style={[S.clearBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.05)" }]}>
              <Ionicons name="refresh-outline" size={18} color={subColor} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[S.headerCaption, { color: subColor }]}>
          {pick("Ask in English, French or Darija", "Posez vos questions en anglais, français ou darija")}
        </Text>
      </LinearGradient>

      {/* ── Messages ── */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={0}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollToBottom(true)}
          ListFooterComponent={
            showSuggestions && messages.length <= 1 ? (
              <View style={S.suggestionsWrap}>
                <Text style={[S.suggestionsLabel, { color: subColor }]}>
                  {pick("Quick questions:", "Questions rapides :")}
                </Text>
                <View style={S.suggestionsGrid}>
                  {SUGGESTIONS.map((sug, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => handleSuggestion(sug)}
                      activeOpacity={0.8}
                      style={[S.suggestionChip, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#fff", borderColor: isDark ? "rgba(124,107,255,0.22)" : "rgba(98,72,232,0.14)" }]}
                    >
                      <Text style={[S.suggestionText, { color: titleColor }]} numberOfLines={2}>
                        {lang === "fr" ? sug.fr : sug.en}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <Bubble msg={item} isDark={isDark} C={C} ctaGrad={ctaGrad} />
          )}
        />

        {/* ── Pending image preview ── */}
        {pendingImg && (
          <View style={[S.pendingImgBar, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.04)", borderTopColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.07)" }]}>
            <Image source={{ uri: pendingImg.uri }} style={S.pendingImgThumb} resizeMode="cover" />
            <Text style={[S.pendingImgLabel, { color: subColor }]} numberOfLines={1}>
              {pick("Image ready to send", "Image prête à envoyer")}
            </Text>
            <TouchableOpacity onPress={() => setPendingImg(null)} hitSlop={10}>
              <Ionicons name="close-circle" size={22} color={subColor} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Input bar ── */}
        <View style={[S.inputBar, { backgroundColor: isDark ? "rgba(15,14,26,0.98)" : "#fff", borderTopColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.07)", paddingBottom: insets.bottom + 10 }]}>
          {/* Camera / Gallery */}
          <TouchableOpacity onPress={handleImagePress} activeOpacity={0.8} style={[S.inputAction, { backgroundColor: isDark ? "rgba(124,107,255,0.14)" : "rgba(98,72,232,0.09)" }]}>
            <Ionicons name="camera-outline" size={20} color={C.primary} />
          </TouchableOpacity>

          {/* Text input */}
          <View style={[S.inputBox, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.05)", borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)" }]}>
            <TextInput
              ref={inputRef}
              value={input}
              onChangeText={setInput}
              placeholder={pick("Ask anything about your car…", "Posez une question sur votre voiture…")}
              placeholderTextColor={subColor}
              style={[S.input, { color: titleColor }]}
              multiline
              maxLength={500}
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
          </View>

          {/* Send */}
          <TouchableOpacity
            onPress={handleSend}
            disabled={loading || (!input.trim() && !pendingImg)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={loading || (!input.trim() && !pendingImg) ? ["#6366f140", "#6366f140"] : ctaGrad}
              style={S.sendBtn}
            >
              {loading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="send" size={18} color="#fff" />
              }
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const S = StyleSheet.create({
  screen: { flex: 1 },

  /* header */
  header: { paddingHorizontal: 18, paddingBottom: 14, borderBottomWidth: 1 },
  headerInner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "800", letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 12, fontWeight: "700", letterSpacing: 0.3, marginTop: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#10b981" },
  onlineText: { fontSize: 12, fontWeight: "700" },
  clearBtn: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", marginLeft: 4 },
  headerCaption: { fontSize: 12, fontWeight: "500" },

  /* bubbles */
  bubbleRow: { flexDirection: "row", marginBottom: 14, alignItems: "flex-end" },
  bubbleRowUser: { justifyContent: "flex-end" },
  bubbleRowAI:   { justifyContent: "flex-start", gap: 8 },
  aiAvatar: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: 1, flexShrink: 0, marginBottom: 20 },
  bubbleWrap: {},
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 11 },
  bubbleUser: { borderBottomRightRadius: 5 },
  bubbleAI:   { borderBottomLeftRadius: 5, borderWidth: 1 },
  bubbleUserText: { color: "#fff", fontSize: 15, lineHeight: 22, fontWeight: "500" },
  bubbleAIText:   { fontSize: 15, lineHeight: 23, fontWeight: "400" },
  timestamp: { fontSize: 10, marginTop: 4, marginHorizontal: 4, fontWeight: "500" },
  imgPreviewWrap: { overflow: "hidden", marginBottom: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  imgPreview: { width: 200, height: 140 },

  /* suggestions */
  suggestionsWrap: { paddingTop: 8, paddingBottom: 12 },
  suggestionsLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10, marginLeft: 2 },
  suggestionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  suggestionChip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, borderWidth: 1, maxWidth: "48%", flex: 1 },
  suggestionText: { fontSize: 13, fontWeight: "600", lineHeight: 18 },

  /* pending image */
  pendingImgBar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1 },
  pendingImgThumb: { width: 44, height: 44, borderRadius: 10 },
  pendingImgLabel: { flex: 1, fontSize: 13, fontWeight: "600" },

  /* input */
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 12, paddingTop: 10, borderTopWidth: 1 },
  inputAction: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  inputBox: { flex: 1, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, maxHeight: 110 },
  input: { fontSize: 15, lineHeight: 21, padding: 0 },
  sendBtn: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center", flexShrink: 0 },
});
