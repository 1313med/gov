import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { register as registerApi } from "../../src/api/auth";
import { useAppLang } from "../../src/context/AppLangContext";
import { useTheme } from "../../src/context/ThemeContext";
import ThemeToggle from "../../src/components/ThemeToggle";
import { getApiErrorMessage } from "../../src/utils/apiErrorMessage";

const ROLE_META = {
  customer: {
    icon: "search-outline",
    gradLight: ["#6248e8", "#4f46e5"],
    gradDark: ["#7c6bff", "#5b4ddb"],
    en: { label: "Customer", desc: "Rent or buy cars" },
    fr: { label: "Client", desc: "Louer ou acheter" },
  },
  seller: {
    icon: "car-sport-outline",
    gradLight: ["#0284c7", "#0369a1"],
    gradDark: ["#38bdf8", "#0ea5e9"],
    en: { label: "Car Owner", desc: "Track my car" },
    fr: { label: "Propriétaire", desc: "Suivre ma voiture" },
  },
  rental_owner: {
    icon: "business-outline",
    gradLight: ["#059669", "#047857"],
    gradDark: ["#34d399", "#10b981"],
    en: { label: "Rental Owner", desc: "Rent out my fleet" },
    fr: { label: "Loueur", desc: "Louer ma flotte" },
  },
};

export default function RegisterScreen() {
  const { colors: C, isDark } = useTheme();
  const { copy } = useAppLang();
  const c = copy.register;
  const router = useRouter();
  const params = useLocalSearchParams();

  const preselectedRole = params.role || "customer";
  const roleMeta = ROLE_META[preselectedRole] || ROLE_META.customer;
  const fr = copy._lang === "fr";

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    password: "",
    role: preselectedRole,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const ctaGrad = isDark ? roleMeta.gradDark : roleMeta.gradLight;
  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#94a3b8" : "#475569";

  const s = useMemo(() => createStyles(C, isDark), [C, isDark]);

  const handleRegister = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim() || !form.city.trim() || !form.password) {
      Alert.alert(fr ? "Champs manquants" : "Missing fields", fr ? "Veuillez remplir tous les champs." : "Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await registerApi(form);
      Alert.alert(
        fr ? "Vérifiez votre email" : "Verify your email",
        fr
          ? "Compte créé. Vérifiez votre email avant de vous connecter."
          : "Account created. Check your email to verify before logging in.",
        [{ text: "OK", onPress: () => router.push("/(auth)/login") }]
      );
    } catch (e) {
      Alert.alert(fr ? "Erreur" : "Error", getApiErrorMessage(e, c.regFail));
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "name", label: fr ? "Nom complet" : "Full name", icon: "person-outline", ph: "John Doe", kb: "default" },
    { key: "phone", label: fr ? "Téléphone" : "Phone", icon: "call-outline", ph: "06XXXXXXXX", kb: "phone-pad" },
    { key: "email", label: "Email", icon: "mail-outline", ph: "you@example.com", kb: "email-address" },
    { key: "city", label: fr ? "Ville" : "City", icon: "location-outline", ph: "Casablanca", kb: "default" },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={isDark ? ["#03040a", "#120a24", "#05060f"] : ["#faf5ff", "#e0f2fe", "#f8fafc"]}
          style={[s.header, { paddingTop: Platform.OS === "ios" ? 60 : 48 }]}
        >
          <View style={s.headerBar}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={18} color={C.primary} />
              <Text style={[s.backText, { color: C.primary }]}>{fr ? "Retour" : "Back"}</Text>
            </TouchableOpacity>
            <ThemeToggle />
          </View>

          <LinearGradient colors={ctaGrad} style={s.roleChip}>
            <Ionicons name={roleMeta.icon} size={14} color="#fff" />
            <Text style={s.roleChipText}>
              {fr ? roleMeta.fr.label : roleMeta.en.label}
            </Text>
          </LinearGradient>

          <Text style={[s.title, { color: titleColor }]}>
            {fr ? "Créer un compte" : "Create account"}
          </Text>
          <Text style={[s.sub, { color: subColor }]}>
            {fr ? "Rejoignez Goovoiture gratuitement." : "Join Goovoiture for free."}
          </Text>
        </LinearGradient>

        <View style={s.form}>
          {fields.map((f) => (
            <View key={f.key}>
              <Text style={[s.label, { color: C.label }]}>{f.label}</Text>
              <View style={[s.inputRow, { backgroundColor: C.inputBg, borderColor: C.border }]}>
                <Ionicons name={f.icon} size={17} color={C.muted} />
                <TextInput
                  value={form[f.key]}
                  onChangeText={(v) => set(f.key, v)}
                  placeholder={f.ph}
                  placeholderTextColor={C.muted}
                  keyboardType={f.kb}
                  style={[s.input, { color: titleColor }]}
                  autoCapitalize="none"
                />
              </View>
            </View>
          ))}

          <Text style={[s.label, { color: C.label }]}>{fr ? "Mot de passe" : "Password"}</Text>
          <View style={[s.inputRow, { backgroundColor: C.inputBg, borderColor: C.border }]}>
            <Ionicons name="lock-closed-outline" size={17} color={C.muted} />
            <TextInput
              value={form.password}
              onChangeText={(v) => set("password", v)}
              placeholder="••••••••"
              placeholderTextColor={C.muted}
              secureTextEntry={!showPassword}
              style={[s.input, { color: titleColor }]}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.8}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={17} color={C.muted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.9} style={{ marginTop: 8 }}>
            <LinearGradient
              colors={ctaGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[s.btn, { opacity: loading ? 0.7 : 1 }]}
            >
              <Text style={s.btnText}>
                {loading ? (fr ? "Création…" : "Creating…") : (fr ? "Créer mon compte" : "Create my account")}
              </Text>
              {!loading && <Ionicons name="arrow-forward" size={18} color="#fff" />}
            </LinearGradient>
          </TouchableOpacity>

          <View style={s.footerRow}>
            <Text style={[s.footerQ, { color: subColor }]}>{fr ? "Déjà un compte ? " : "Have an account? "}</Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")} activeOpacity={0.85}>
              <Text style={[s.footerLink, { color: C.primary }]}>{fr ? "Se connecter" : "Login"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(C, isDark) {
  return StyleSheet.create({
    header: {
      paddingBottom: 28,
      paddingHorizontal: 24,
      overflow: "hidden",
    },
    headerBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    backBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
    backText: { fontSize: 14, fontWeight: "700" },
    roleChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      marginBottom: 14,
    },
    roleChipText: { color: "#fff", fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
    title: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5, marginBottom: 6 },
    sub: { fontSize: 14, fontWeight: "500", lineHeight: 20 },
    form: { padding: 24 },
    label: {
      fontSize: 11,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 8,
      marginTop: 4,
      fontWeight: "700",
    },
    inputRow: {
      borderRadius: 14,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      marginBottom: 16,
      gap: 10,
    },
    input: { flex: 1, paddingVertical: 15, fontSize: 15, fontWeight: "500" },
    btn: {
      borderRadius: 16,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      shadowColor: "#7c6bff",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 8,
    },
    btnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
    footerRow: { flexDirection: "row", justifyContent: "center", paddingTop: 20, paddingBottom: 32 },
    footerQ: { fontSize: 14, fontWeight: "500" },
    footerLink: { fontSize: 14, fontWeight: "800" },
  });
}
