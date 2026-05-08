import { useState, useMemo, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { login as loginApi } from "../../src/api/auth";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { useTheme } from "../../src/context/ThemeContext";
import ThemeToggle from "../../src/components/ThemeToggle";
import { getApiErrorMessage } from "../../src/utils/apiErrorMessage";
import { clearLoginForm, loadLoginForm, saveLoginForm } from "../../src/utils/authStorage";

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors: C } = useTheme();
  const { copy, lang, setLang } = useAppLang();
  const c = copy.login;
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const s = useMemo(() => createLoginStyles(C), [C]);

  useEffect(() => {
    loadLoginForm()
      .then((saved) => {
        if (!saved) return;
        if (saved.phone) setIdentifier(saved.phone);
        setRememberMe(saved.remember !== false);
      })
      .catch(() => {});
  }, []);

  const handleLogin = async () => {
    if (!identifier || !password) return Alert.alert("Please fill all fields");
    setLoading(true);
    try {
      const { data } = await loginApi(identifier, password);
      if (rememberMe) {
        await saveLoginForm({ phone: identifier, remember: true });
      } else {
        await clearLoginForm();
      }
      await login(data, { remember: rememberMe });
    } catch (e) {
      Alert.alert("Error", getApiErrorMessage(e, c.invalidCreds));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled" style={s.screen}>
        <View style={s.hero}>
          <View style={s.headerTop}>
            <View style={s.logoRow}>
              <View style={s.logoBox}>
                <Ionicons name="car-sport" size={18} color="#fff" />
              </View>
              <Text style={s.logoText}>Goovoiture</Text>
            </View>
            <View style={s.headerActions}>
              <ThemeToggle />
              <TouchableOpacity onPress={() => setLang(lang === "fr" ? "en" : "fr")} style={s.langBtn}>
                <Text style={s.langText}>{lang === "fr" ? "EN" : "FR"}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={s.heroCopy}>
            <Text style={s.heroTitle}>
              {c.heroL1} <Text style={{ color: C.primary }}>{c.heroEm}</Text>
            </Text>
            <Text style={s.heroSub}>{c.heroSub}</Text>
            <View style={s.pills}>
              {(c.pills || []).map((pill, idx) => (
                <View key={pill} style={s.pill}>
                  <Ionicons
                    name={idx === 0 ? "shield-checkmark-outline" : idx === 1 ? "flash-outline" : idx === 2 ? "people-outline" : "lock-closed-outline"}
                    size={13}
                    color={C.primary}
                  />
                  <Text style={s.pillText}>{pill}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={s.formCard}>
          <Text style={s.welcomeTitle}>
            {c.welcomeTitle} <Text style={{ color: C.primary }}>{c.welcomeEm}</Text>
          </Text>
          <Text style={s.welcomeSub}>{c.welcomeSub}</Text>

          <Text style={s.fieldLabel}>{c.phone}</Text>
          <View style={s.inputRow}>
            <Ionicons name="person-circle-outline" size={18} color={C.muted} />
            <TextInput
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="06XXXXXXXX / you@example.com"
              placeholderTextColor={C.label}
              keyboardType="default"
              style={s.input}
              autoCapitalize="none"
            />
          </View>

          <Text style={s.fieldLabel}>{c.password}</Text>
          <View style={s.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color={C.muted} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={C.label}
              secureTextEntry={!showPw}
              style={s.input}
            />
            <TouchableOpacity onPress={() => setShowPw(!showPw)}>
              <Text style={s.showHide}>{showPw ? c.hide : c.show}</Text>
            </TouchableOpacity>
          </View>

          <View style={s.optionsRow}>
            <TouchableOpacity style={s.rememberRow} onPress={() => setRememberMe((v) => !v)}>
              <Ionicons
                name={rememberMe ? "checkbox" : "square-outline"}
                size={16}
                color={rememberMe ? C.primary : C.muted}
              />
              <Text style={s.rememberText}>{lang === "fr" ? "Se souvenir de moi" : "Remember me"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
              <Text style={s.forgotText}>{lang === "fr" ? "Mot de passe oublié ?" : "Forgot password?"}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleLogin} disabled={loading} style={[s.btn, { opacity: loading ? 0.7 : 1 }]}>
            <Text style={s.btnText}>{loading ? c.authenticating : `${c.signInBtn} →`}</Text>
          </TouchableOpacity>

          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>{lang === "fr" ? "Nouveau sur Goovoiture ?" : "New to Goovoiture?"}</Text>
            <View style={s.dividerLine} />
          </View>

          <TouchableOpacity style={s.registerCard} onPress={() => router.push("/(auth)/register")}>
            <View style={s.registerIcon}>
              <Ionicons name="car-sport" size={18} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.registerTitle}>
                {lang === "fr" ? "Créer un compte gratuit" : "Create your free account"}
              </Text>
              <Text style={s.registerSub}>{lang === "fr" ? "Rejoignez-nous et développez votre activité" : "Join now and grow your business"}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.muted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createLoginStyles(C) {
  return StyleSheet.create({
    flex: { flex: 1 },
    screen: { backgroundColor: C.bg },
    scrollContent: { paddingBottom: 32 },
    hero: {
      minHeight: 320,
      paddingHorizontal: 24,
      backgroundColor: C.surface,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      overflow: "hidden",
      position: "relative",
    },
    headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 54, marginBottom: 28 },
    logoRow: { flexDirection: "row", alignItems: "center" },
    logoBox: {
      width: 32,
      height: 32,
      backgroundColor: C.primary,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },
    logoText: { color: C.white, fontWeight: "700", fontSize: 18 },
    headerActions: { flexDirection: "row", alignItems: "center", gap: 4 },
    langBtn: {
      backgroundColor: C.card,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    langText: { color: C.accent, fontSize: 12, fontWeight: "700" },
    heroCopy: { maxWidth: "100%", paddingBottom: 28 },
    heroTitle: { color: C.white, fontSize: 30, fontWeight: "800", lineHeight: 34 },
    heroSub: { color: C.muted, fontSize: 13, marginTop: 8, lineHeight: 20 },
    pills: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 18 },
    pill: {
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 6,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    pillText: { color: C.primary, fontSize: 11 },
    formCard: {
      marginHorizontal: 24,
      marginTop: -24,
      backgroundColor: C.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: C.border,
      paddingHorizontal: 18,
      paddingVertical: 22,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 8,
    },
    welcomeTitle: { color: C.white, fontSize: 24, fontWeight: "800", lineHeight: 30 },
    welcomeSub: { color: C.muted, fontSize: 13, marginTop: 4, marginBottom: 24 },
    fieldLabel: {
      color: C.label,
      fontSize: 11,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 8,
    },
    inputRow: {
      backgroundColor: C.inputBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: C.border,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    input: { flex: 1, color: C.white, paddingVertical: 16, marginLeft: 10 },
    showHide: { color: C.primary, fontSize: 12, fontWeight: "700" },
    optionsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: -4, marginBottom: 16 },
    rememberRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    rememberText: { color: C.muted, fontSize: 12 },
    forgotText: { color: C.primary, fontSize: 12, fontWeight: "600" },
    btn: { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginBottom: 24 },
    btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    dividerRow: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
    dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
    dividerText: { color: C.muted, fontSize: 12, marginHorizontal: 12 },
    registerCard: {
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 14,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    registerIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: C.pillBg,
      alignItems: "center",
      justifyContent: "center",
    },
    registerTitle: { color: C.primary, fontWeight: "700", fontSize: 16, lineHeight: 20 },
    registerSub: { color: C.muted, fontSize: 12, marginTop: 2 },
  });
}
