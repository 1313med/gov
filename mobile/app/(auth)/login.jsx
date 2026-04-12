import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { login as loginApi } from "../../src/api/auth";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { C } from "../../src/theme";

export default function LoginScreen() {
  const { login } = useAuth();
  const { copy, lang, setLang } = useAppLang();
  const c = copy.login;
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) return Alert.alert("Please fill all fields");
    setLoading(true);
    try { const { data } = await loginApi(phone, password); await login(data); }
    catch { Alert.alert("Error", c.invalidCreds); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" style={{ backgroundColor: C.bg }}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerTop}>
            <View style={s.logoRow}>
              <View style={s.logoBox}><Ionicons name="car-sport" size={18} color="#fff" /></View>
              <Text style={s.logoText}>Goovoiture</Text>
            </View>
            <TouchableOpacity onPress={() => setLang(lang === "fr" ? "en" : "fr")} style={s.langBtn}>
              <Text style={s.langText}>{lang === "fr" ? "EN" : "FR"}</Text>
            </TouchableOpacity>
          </View>
          <Text style={s.heroTitle}>{c.heroL1} <Text style={{ color: C.primary }}>{c.heroEm}</Text></Text>
          <Text style={s.heroSub}>{c.heroSub}</Text>
          <View style={s.pills}>
            {c.pills?.map((pill) => (
              <View key={pill} style={s.pill}><Text style={s.pillText}>{pill}</Text></View>
            ))}
          </View>
        </View>

        {/* Form */}
        <View style={s.form}>
          <Text style={s.welcomeTitle}>{c.welcomeTitle} <Text style={{ color: C.primary }}>{c.welcomeEm}</Text></Text>
          <Text style={s.welcomeSub}>{c.welcomeSub}</Text>

          <Text style={s.fieldLabel}>{c.phone}</Text>
          <View style={s.inputRow}>
            <Ionicons name="call-outline" size={18} color={C.muted} />
            <TextInput value={phone} onChangeText={setPhone} placeholder="06XXXXXXXX" placeholderTextColor="#4b5563"
              keyboardType="phone-pad" style={s.input} autoCapitalize="none" />
          </View>

          <Text style={s.fieldLabel}>{c.password}</Text>
          <View style={s.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color={C.muted} />
            <TextInput value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor="#4b5563"
              secureTextEntry={!showPw} style={s.input} />
            <TouchableOpacity onPress={() => setShowPw(!showPw)}>
              <Text style={s.showHide}>{showPw ? c.hide : c.show}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleLogin} disabled={loading} style={[s.btn, { opacity: loading ? 0.7 : 1 }]}>
            <Text style={s.btnText}>{loading ? c.authenticating : c.signInBtn}</Text>
          </TouchableOpacity>

          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>{c.divider}</Text>
            <View style={s.dividerLine} />
          </View>

          <View style={s.footerRow}>
            <Text style={s.footerQ}>{c.footerQ} </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={s.footerLink}>{c.footerLink}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.bg },
  header: { paddingTop: 64, paddingBottom: 40, paddingHorizontal: 24, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 32 },
  logoRow: { flexDirection: "row", alignItems: "center" },
  logoBox: { width: 32, height: 32, backgroundColor: C.primary, borderRadius: 8, alignItems: "center", justifyContent: "center", marginRight: 8 },
  logoText: { color: C.white, fontWeight: "700", fontSize: 18 },
  langBtn: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  langText: { color: C.accent, fontSize: 12, fontWeight: "700" },
  heroTitle: { color: C.white, fontSize: 28, fontWeight: "700", lineHeight: 36 },
  heroSub: { color: C.muted, fontSize: 13, marginTop: 8, lineHeight: 20 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  pill: { backgroundColor: "rgba(124,107,255,0.1)", borderWidth: 1, borderColor: "rgba(124,107,255,0.3)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { color: C.primary, fontSize: 11 },
  form: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  welcomeTitle: { color: C.white, fontSize: 24, fontWeight: "700" },
  welcomeSub: { color: C.muted, fontSize: 13, marginTop: 4, marginBottom: 24 },
  fieldLabel: { color: "#94a3b8", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 },
  inputRow: { backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 16 },
  input: { flex: 1, color: C.white, paddingVertical: 16, marginLeft: 10 },
  showHide: { color: C.muted, fontSize: 11, fontWeight: "700" },
  btn: { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginBottom: 24 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  dividerRow: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: { color: C.muted, fontSize: 12, marginHorizontal: 12 },
  footerRow: { flexDirection: "row", justifyContent: "center", paddingBottom: 32 },
  footerQ: { color: C.muted, fontSize: 14 },
  footerLink: { color: C.primary, fontWeight: "700", fontSize: 14 },
});
