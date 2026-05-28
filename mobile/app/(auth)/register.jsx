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
import { getRoleTheme, normalizeRoleKey } from "../../src/constants/roleThemes";
import { saveAuthRoleIntent } from "../../src/utils/authRoleIntent";
import LanguageSwitcher from "../../src/components/LanguageSwitcher";

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
  const { copy, lang, pick } = useAppLang();
  const c = copy.register;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const preselectedRole = normalizeRoleKey(params.role);
  const theme = getRoleTheme(preselectedRole, isDark);
  const roleCopy = lang === "ar" ? theme.ar : lang === "fr" ? theme.fr : theme.en;

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

  const accent = theme.accent;
  const ctaGrad = theme.gradient;
  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#94a3b8" : "#475569";
  const heroGrad = theme.heroGradient;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    saveAuthRoleIntent(preselectedRole);
  }, [preselectedRole]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(heroSlide, { toValue: 0, friction: 8, tension: 42, useNativeDriver: true }),
    ]).start();
  }, [heroOpacity, heroSlide]);

  const handleRegister = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim() || !form.city.trim() || !form.password) {
      Alert.alert(pick("Missing fields", "Champs manquants"), pick("Please fill in all fields.", "Veuillez remplir tous les champs."));
      return;
    }
    setLoading(true);
    try {
      await registerApi(form);
      Alert.alert(
        pick("Verify your email", "Vérifiez votre email"),
        pick("Account created. Check your email to verify before logging in.", "Compte créé. Vérifiez votre email avant de vous connecter."),
        [{ text: "OK", onPress: () => router.push({ pathname: "/(auth)/login", params: { role: preselectedRole } }) }]
      );
    } catch (e) {
      Alert.alert(pick("Error", "Erreur"), getApiErrorMessage(e, c.regFail));
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
              <Ionicons name="chevron-back" size={20} color={accent} />
              <Text style={[styles.backText, { color: accent }]}>{pick("Back", "Retour")}</Text>
            </Pressable>
            <LanguageSwitcher variant="compact" accent={accent} isDark={isDark} />
            <ThemeToggle />
          </View>

          <Animated.View style={[styles.hero, { opacity: heroOpacity, transform: [{ translateY: heroSlide }] }]}>
            <View style={styles.heroRow}>
              <LinearGradient colors={ctaGrad} style={styles.roleIcon}>
                <Ionicons name={theme.icon} size={22} color="#fff" />
              </LinearGradient>
              <View style={styles.heroCopy}>
                <LinearGradient colors={ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.roleChip}>
                  <Text style={styles.roleChipText}>{roleCopy.label.toUpperCase()}</Text>
                </LinearGradient>
                <Text style={[styles.title, { color: titleColor }]}>{pick("Create account", "Créer un compte")}</Text>
                <Text style={[styles.sub, { color: subColor }]} numberOfLines={2}>
                  {pick(`${roleCopy.desc} — join Goovoiture.`, `${roleCopy.desc} — rejoignez Goovoiture.`)}
                </Text>
              </View>
            </View>
          </Animated.View>

          <LinearGradient colors={ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.formCardBorder}>
            <View style={[styles.formCard, { backgroundColor: isDark ? "#0a0b12" : "#fafbff" }]}>
            <EliteField
              label={pick("FULL NAME", "NOM COMPLET")}
              icon="person-outline"
              value={form.name}
              onChangeText={(v) => set("name", v)}
              placeholder="John Doe"
              accent={accent}
              isDark={isDark}
            />
            <EliteField
              label={pick("PHONE", "TÉLÉPHONE")}
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
              label={pick("CITY", "VILLE")}
              icon="location-outline"
              value={form.city}
              onChangeText={(v) => set("city", v)}
              placeholder="Casablanca"
              accent={accent}
              isDark={isDark}
            />
            <EliteField
              label={pick("PASSWORD", "MOT DE PASSE")}
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
                  {loading ? (pick("Creating…", "Création…")) : pick("Create my account", "Créer mon compte")}
                </Text>
                {!loading && <Ionicons name="arrow-forward-circle" size={22} color="#fff" />}
              </LinearGradient>
            </Pressable>
            </View>
          </LinearGradient>

          <Pressable
            onPress={() => router.push({ pathname: "/(auth)/login", params: { role: preselectedRole } })}
            style={({ pressed }) => [styles.footerRow, pressed && { opacity: 0.85 }]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="link"
          >
            <Text style={[styles.footerQ, { color: subColor }]}>{pick("Have an account? ", "Déjà un compte ? ")}</Text>
            <Text style={[styles.footerLink, { color: accent }]}>{pick("Sign in", "Se connecter")}</Text>
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
  formCardBorder: {
    borderRadius: 24,
    padding: 1.5,
    marginBottom: 4,
  },
  formCard: {
    borderRadius: 22,
    padding: 18,
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
