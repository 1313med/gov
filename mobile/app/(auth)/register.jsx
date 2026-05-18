import { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { register as registerApi } from "../../src/api/auth";
import { useAppLang } from "../../src/context/AppLangContext";
import { useTheme } from "../../src/context/ThemeContext";
import ThemeToggle from "../../src/components/ThemeToggle";
import { getApiErrorMessage } from "../../src/utils/apiErrorMessage";

const ROLE_META = {
  customer: {
    icon: "search",
    colorLight: "#6248e8",
    colorDark: "#a78bfa",
    gradLight: ["#6248e8", "#4f46e5", "#4338ca"],
    gradDark: ["#a78bfa", "#7c6bff", "#5b4ddb"],
    en: { label: "Explorer", desc: "Rent or buy cars" },
    fr: { label: "Explorer", desc: "Louer ou acheter" },
  },
  car_owner: {
    icon: "car-sport",
    colorLight: "#0284c7",
    colorDark: "#38bdf8",
    gradLight: ["#0ea5e9", "#0284c7", "#0369a1"],
    gradDark: ["#38bdf8", "#0ea5e9", "#0284c7"],
    en: { label: "My garage", desc: "Track my car" },
    fr: { label: "Mon garage", desc: "Suivre ma voiture" },
  },
  rental_owner: {
    icon: "business",
    colorLight: "#059669",
    colorDark: "#34d399",
    gradLight: ["#10b981", "#059669", "#047857"],
    gradDark: ["#34d399", "#10b981", "#059669"],
    en: { label: "My fleet", desc: "Rent out my fleet" },
    fr: { label: "Ma flotte", desc: "Louer ma flotte" },
  },
};

function EliteField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  accent,
  isDark,
  right,
}) {
  const [focused, setFocused] = useState(false);
  const titleColor = isDark ? "#f8fafc" : "#0f172a";

  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: isDark ? "#64748b" : "#94a3b8" }]}>{label}</Text>
      <View
        style={[
          styles.inputShell,
          {
            borderColor: focused ? accent : isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)",
            backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.92)",
            shadowColor: focused ? accent : "transparent",
            shadowOpacity: focused ? 0.35 : 0,
            shadowRadius: focused ? 12 : 0,
            shadowOffset: { width: 0, height: 4 },
            elevation: focused ? 4 : 0,
          },
        ]}
      >
        <View style={[styles.inputIconWrap, { backgroundColor: `${accent}18` }]}>
          <Ionicons name={icon} size={18} color={accent} />
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          style={[styles.input, { color: titleColor }]}
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {right}
      </View>
    </View>
  );
}

export default function RegisterScreen() {
  const { colors: C, isDark } = useTheme();
  const { copy, lang } = useAppLang();
  const c = copy.register;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const preselectedRole = params.role || "customer";
  const roleMeta = ROLE_META[preselectedRole] || ROLE_META.customer;
  const fr = lang === "fr";
  const roleCopy = fr ? roleMeta.fr : roleMeta.en;

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

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(16)).current;

  const accent = isDark ? roleMeta.colorDark : roleMeta.colorLight;
  const ctaGrad = isDark ? roleMeta.gradDark : roleMeta.gradLight;
  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#94a3b8" : "#475569";
  const primary = isDark ? "#a78bfa" : "#6248e8";
  const heroGrad = isDark
    ? ["#020108", "#120a28", "#061018", "#03040a"]
    : ["#faf5ff", "#ede9fe", "#e0f2fe", "#f8fafc"];

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(heroSlide, { toValue: 0, friction: 8, tension: 42, useNativeDriver: true }),
    ]).start();
  }, [heroOpacity, heroSlide]);

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

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#03040a" : C.bg }}>
      <LinearGradient pointerEvents="none" colors={heroGrad} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 28 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.8 }]}>
              <Ionicons name="chevron-back" size={20} color={primary} />
              <Text style={[styles.backText, { color: primary }]}>{fr ? "Retour" : "Back"}</Text>
            </Pressable>
            <ThemeToggle />
          </View>

          <Animated.View style={[styles.hero, { opacity: heroOpacity, transform: [{ translateY: heroSlide }] }]}>
            <View style={styles.heroRow}>
              <LinearGradient colors={ctaGrad} style={styles.roleIcon}>
                <Ionicons name={roleMeta.icon} size={22} color="#fff" />
              </LinearGradient>
              <View style={styles.heroCopy}>
                <LinearGradient colors={ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.roleChip}>
                  <Text style={styles.roleChipText}>{roleCopy.label.toUpperCase()}</Text>
                </LinearGradient>
                <Text style={[styles.title, { color: titleColor }]}>{fr ? "Créer un compte" : "Create account"}</Text>
                <Text style={[styles.sub, { color: subColor }]} numberOfLines={2}>
                  {fr ? `${roleCopy.desc} — rejoignez Goovoiture.` : `${roleCopy.desc} — join Goovoiture.`}
                </Text>
              </View>
            </View>
          </Animated.View>

          <View style={[styles.formCard, { borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.06)" }]}>
            <EliteField
              label={fr ? "NOM COMPLET" : "FULL NAME"}
              icon="person-outline"
              value={form.name}
              onChangeText={(v) => set("name", v)}
              placeholder="John Doe"
              accent={accent}
              isDark={isDark}
            />
            <EliteField
              label={fr ? "TÉLÉPHONE" : "PHONE"}
              icon="call-outline"
              value={form.phone}
              onChangeText={(v) => set("phone", v)}
              placeholder="06XXXXXXXX"
              keyboardType="phone-pad"
              accent={accent}
              isDark={isDark}
            />
            <EliteField
              label="EMAIL"
              icon="mail-outline"
              value={form.email}
              onChangeText={(v) => set("email", v)}
              placeholder="you@example.com"
              keyboardType="email-address"
              accent={accent}
              isDark={isDark}
            />
            <EliteField
              label={fr ? "VILLE" : "CITY"}
              icon="location-outline"
              value={form.city}
              onChangeText={(v) => set("city", v)}
              placeholder="Casablanca"
              accent={accent}
              isDark={isDark}
            />
            <EliteField
              label={fr ? "MOT DE PASSE" : "PASSWORD"}
              icon="lock-closed-outline"
              value={form.password}
              onChangeText={(v) => set("password", v)}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              accent={accent}
              isDark={isDark}
              right={
                <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={isDark ? "#64748b" : "#94a3b8"} />
                </Pressable>
              }
            />

            <Pressable onPress={handleRegister} disabled={loading} style={({ pressed }) => [{ opacity: loading ? 0.7 : pressed ? 0.92 : 1 }]}>
              <LinearGradient colors={ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.btn, { shadowColor: accent }]}>
                <Text style={styles.btnText}>
                  {loading ? (fr ? "Création…" : "Creating…") : fr ? "Créer mon compte" : "Create my account"}
                </Text>
                {!loading && <Ionicons name="arrow-forward-circle" size={22} color="#fff" />}
              </LinearGradient>
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.push("/(auth)/login")}
            style={({ pressed }) => [styles.footerRow, pressed && { opacity: 0.85 }]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="link"
          >
            <Text style={[styles.footerQ, { color: subColor }]}>{fr ? "Déjà un compte ? " : "Have an account? "}</Text>
            <Text style={[styles.footerLink, { color: primary }]}>{fr ? "Se connecter" : "Sign in"}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingVertical: 8,
    paddingRight: 12,
  },
  backText: { fontSize: 15, fontWeight: "700" },
  hero: { marginBottom: 18 },
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  roleIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  heroCopy: { flex: 1, minWidth: 0 },
  roleChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  roleChipText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  sub: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  formCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  inputShell: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 10,
  },
  inputIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "500",
  },
  btn: {
    marginTop: 6,
    borderRadius: 18,
    paddingVertical: 17,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 12,
    zIndex: 10,
  },
  footerQ: { fontSize: 14, fontWeight: "500" },
  footerLink: { fontSize: 14, fontWeight: "800" },
});
