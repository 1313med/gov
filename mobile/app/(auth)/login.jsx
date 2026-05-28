import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { login as loginApi } from "../../src/api/auth";
import { useAuth } from "../../src/context/AuthContext";
import { useActiveMode } from "../../src/context/ActiveModeContext";
import { isCarOwnerUser, isRentalOwnerUser } from "../../src/utils/userRoles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppLang } from "../../src/context/AppLangContext";
import { useTheme } from "../../src/context/ThemeContext";
import ThemeToggle from "../../src/components/ThemeToggle";
import AppBrandMark from "../../src/components/AppBrandMark";
import { getApiErrorMessage } from "../../src/utils/apiErrorMessage";
import { clearLoginForm, loadLoginForm, saveLoginForm } from "../../src/utils/authStorage";
import { getRoleTheme, normalizeRoleKey } from "../../src/constants/roleThemes";
import { loadAuthRoleIntent, saveAuthRoleIntent } from "../../src/utils/authRoleIntent";
import LanguageSwitcher from "../../src/components/LanguageSwitcher";

const { width: W } = Dimensions.get("window");


function GlowOrb({ style, colors, scaleAnim }) {
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: "absolute", borderRadius: 999, opacity: 0.55 }, style, { transform: [{ scale: scaleAnim }] }]}
    >
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

function EliteField({ label, icon, value, onChangeText, placeholder, keyboardType, secureTextEntry, accent, isDark, right }) {
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

export default function LoginScreen() {
  const { login } = useAuth();
  const { ensureCarOwnerLanding, ensureRentalOwnerLanding } = useActiveMode();
  const { colors: C, isDark } = useTheme();
  const { copy, lang, setLang, pick } = useAppLang();
  const c = copy.login;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const fr = lang === "fr";

  const [authRole, setAuthRole] = useState("customer");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(24)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(28)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const orbPulse = useRef(new Animated.Value(1)).current;
  const orbDrift = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(-1)).current;
  const btnGlow = useRef(new Animated.Value(0.5)).current;

  const theme = getRoleTheme(authRole, isDark);
  const accent = theme.accent;
  const ctaGrad = theme.gradient;
  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#94a3b8" : "#475569";
  const heroGrad = theme.heroGradient;
  const roleThemeCopy = lang === "ar" ? theme.ar : lang === "fr" ? theme.fr : theme.en;

  const readyToSignIn = Boolean(identifier.trim() && password);

  useEffect(() => {
    const paramRole = params.role ? normalizeRoleKey(params.role) : null;
    if (paramRole) {
      setAuthRole(paramRole);
      saveAuthRoleIntent(paramRole);
      return;
    }
    loadAuthRoleIntent().then(setAuthRole);
  }, [params.role]);

  useEffect(() => {
    loadLoginForm()
      .then((saved) => {
        if (!saved) return;
        if (saved.phone) setIdentifier(saved.phone);
        setRememberMe(saved.remember !== false);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(heroOpacity, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(heroSlide, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(formOpacity, { toValue: 1, duration: 560, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(formSlide, { toValue: 0, friction: 8, tension: 38, useNativeDriver: true }),
      ]),
      Animated.timing(footerOpacity, { toValue: 1, duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, { toValue: 1.14, duration: 4800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orbPulse, { toValue: 1, duration: 4800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    const drift = Animated.loop(
      Animated.sequence([
        Animated.timing(orbDrift, { toValue: 1, duration: 7000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orbDrift, { toValue: 0, duration: 7000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    const shine = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 2800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: -1, duration: 0, useNativeDriver: true }),
      ])
    );
    pulse.start();
    drift.start();
    shine.start();
    return () => {
      pulse.stop();
      drift.stop();
      shine.stop();
    };
  }, [heroOpacity, heroSlide, formOpacity, formSlide, footerOpacity, orbPulse, orbDrift, shimmer]);

  useEffect(() => {
    if (!readyToSignIn) {
      btnGlow.setValue(0.5);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(btnGlow, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(btnGlow, { toValue: 0.6, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [readyToSignIn, btnGlow]);

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert(pick("Required", "Champs requis"), pick("Please fill in all fields.", "Veuillez remplir tous les champs."));
      return;
    }
    setLoading(true);
    try {
      const { data } = await loginApi(identifier, password);
      if (rememberMe) {
        await saveLoginForm({ phone: identifier, remember: true });
      } else {
        await clearLoginForm();
      }
      if (isCarOwnerUser(data) && data._id) {
        await AsyncStorage.setItem(`goovoiture-active-mode:${data._id}`, "car_owner");
      }
      await login(data, { remember: rememberMe });
      if (isCarOwnerUser(data)) {
        await ensureCarOwnerLanding();
      } else if (isRentalOwnerUser(data)) {
        await ensureRentalOwnerLanding();
      }
    } catch (e) {
      Alert.alert(pick("Error", "Erreur"), getApiErrorMessage(e, c.invalidCreds));
    } finally {
      setLoading(false);
    }
  };

  const orbDriftY = orbDrift.interpolate({ inputRange: [0, 1], outputRange: [0, 14] });
  const shimmerX = shimmer.interpolate({ inputRange: [-1, 1], outputRange: [-W * 0.35, W * 0.35] });

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#03040a" : C.bg }}>
      <LinearGradient pointerEvents="none" colors={heroGrad} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFill} />
      <GlowOrb scaleAnim={orbPulse} colors={theme.orbPrimary} style={{ width: 240, height: 240, top: -90, right: -80 }} />
      <Animated.View pointerEvents="none" style={{ transform: [{ translateY: orbDriftY }] }}>
        <GlowOrb scaleAnim={orbPulse} colors={theme.orbSecondary} style={{ width: 180, height: 180, top: 200, left: -90 }} />
      </Animated.View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 32 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <View style={styles.brandRow}>
              <AppBrandMark size={48} radius={16} halo gradientColors={ctaGrad} />
              <View style={styles.brandTextWrap}>
                <View style={{ overflow: "hidden" }}>
                  <Text style={[styles.logoText, { color: titleColor }]}>
                    Goo<Text style={{ fontStyle: "italic", color: accent }}>voiture</Text>
                  </Text>
                  <Animated.View
                    pointerEvents="none"
                    style={[styles.brandShine, { transform: [{ translateX: shimmerX }, { skewX: "-18deg" }] }]}
                  />
                </View>
                <Text style={[styles.brandTag, { color: accent }]}>
                  {pick("Premium mobility · Morocco", "Mobilité premium · Maroc")}
                </Text>
              </View>
            </View>
            <View style={styles.topActions}>
              <LanguageSwitcher variant="compact" accent={accent} isDark={isDark} />
              <ThemeToggle />
            </View>
          </View>

          <Animated.View style={[styles.hero, { opacity: heroOpacity, transform: [{ translateY: heroSlide }] }]}>
            <View style={[styles.roleBadge, { borderColor: theme.chipBorder, backgroundColor: theme.chipBg }]}>
              <Ionicons name={theme.icon} size={12} color={accent} />
              <Text style={[styles.roleBadgeTxt, { color: accent }]}>{roleThemeCopy.label.toUpperCase()}</Text>
            </View>
            <Text style={[styles.kicker, { color: accent }]}>{c.memberPortal || (pick("MEMBER SPACE", "ESPACE MEMBRE"))}</Text>
            <Text style={[styles.heroTitle, { color: titleColor }]}>
              {c.heroL1} {c.heroL2 ? `${c.heroL2} ` : ""}
              <Text style={{ color: accent, fontStyle: "italic" }}>{c.heroEm}</Text>
              {c.heroL3 ? ` ${c.heroL3}` : ""}
            </Text>
            <Text style={[styles.heroSub, { color: subColor }]}>{c.heroSub}</Text>
          </Animated.View>

          <Animated.View style={{ opacity: formOpacity, transform: [{ translateY: formSlide }] }}>
            <LinearGradient colors={ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.formCardBorder}>
              <View style={[styles.formCardInner, { backgroundColor: isDark ? "#0a0b12" : "#fafbff" }]}>
                <View style={styles.formHeaderSimple}>
                  <Text style={[styles.welcomeTitle, { color: titleColor }]}>
                    {c.welcomeTitle} <Text style={{ color: accent }}>{c.welcomeEm}</Text>
                  </Text>
                </View>

                <EliteField
                  label={(c.phone || "").toUpperCase()}
                  icon="person-outline"
                  value={identifier}
                  onChangeText={setIdentifier}
                  placeholder="06XXXXXXXX / you@example.com"
                  accent={accent}
                  isDark={isDark}
                />
                <EliteField
                  label={(c.password || "").toUpperCase()}
                  icon="lock-closed-outline"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry={!showPw}
                  accent={accent}
                  isDark={isDark}
                  right={
                    <Pressable onPress={() => setShowPw(!showPw)} hitSlop={8}>
                      <Text style={[styles.showHide, { color: accent }]}>{showPw ? c.hide : c.show}</Text>
                    </Pressable>
                  }
                />

                <View style={styles.optionsRow}>
                  <Pressable onPress={() => setRememberMe((v) => !v)} style={styles.rememberRow}>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: rememberMe ? accent : isDark ? "#475569" : "#cbd5e1",
                          backgroundColor: rememberMe ? `${accent}22` : "transparent",
                        },
                      ]}
                    >
                      {rememberMe ? <Ionicons name="checkmark" size={12} color={accent} /> : null}
                    </View>
                    <Text style={[styles.rememberText, { color: subColor }]}>{pick("Remember me", "Se souvenir de moi")}</Text>
                  </Pressable>
                  <Pressable onPress={() => router.push("/(auth)/forgot-password")} hitSlop={8}>
                    <Text style={[styles.forgotText, { color: accent }]}>{pick("Forgot password?", "Mot de passe oublié ?")}</Text>
                  </Pressable>
                </View>

                <Pressable onPress={handleLogin} disabled={loading} style={({ pressed }) => [{ opacity: loading ? 0.7 : pressed ? 0.92 : 1 }]}>
                  <Animated.View style={{ opacity: btnGlow }}>
                    <LinearGradient
                      colors={readyToSignIn ? ctaGrad : isDark ? ["#1e293b", "#334155"] : ["#cbd5e1", "#94a3b8"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.btn, { shadowColor: readyToSignIn ? accent : "transparent" }]}
                    >
                      <Text style={styles.btnText}>{loading ? c.authenticating : c.signInBtn}</Text>
                      {!loading && <Ionicons name="arrow-forward-circle" size={22} color="#fff" />}
                    </LinearGradient>
                  </Animated.View>
                </Pressable>

                {readyToSignIn ? (
                  <Text style={[styles.readyHint, { color: accent }]}>
                    {pick("✓ Ready — tap to enter", "✓ Prêt — appuyez pour entrer")}
                  </Text>
                ) : null}
              </View>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={{ opacity: footerOpacity }}>
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)" }]} />
              <Text style={[styles.dividerText, { color: subColor }]}>
                {pick("First time here?", "Première visite ?")}
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)" }]} />
            </View>

            <Pressable
              onPress={() => router.push({ pathname: "/(auth)/register", params: { role: authRole } })}
              style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
            >
              <View style={[styles.registerSimple, { borderColor: theme.chipBorder, backgroundColor: theme.chipBg }]}>
                <Text style={[styles.registerSimpleTxt, { color: accent }]}>
                  {pick(
                    `New here? Join as ${roleThemeCopy.label}`,
                    `Nouveau ? Créer un compte ${roleThemeCopy.label}`,
                    `Jdid? Dir compte ${roleThemeCopy.label}`
                  )}
                </Text>
                <Ionicons name="arrow-forward" size={14} color={accent} />
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push("/(auth)/role-select")}
              style={({ pressed }) => [styles.changeRoleLink, pressed && { opacity: 0.85 }]}
              hitSlop={8}
            >
              <Text style={[styles.changeRoleTxt, { color: subColor }]}>
                {pick("Change your path", "Changer de parcours")}
              </Text>
            </Pressable>

            <Text style={[styles.footerNote, { color: isDark ? "#475569" : "#94a3b8" }]}>
              {pick("Your data is protected · Encrypted sign-in", "Vos données sont protégées · Connexion chiffrée")}
            </Text>
          </Animated.View>
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
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  brandTextWrap: { flex: 1, minWidth: 0 },
  logoText: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  brandShine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 48,
    backgroundColor: "rgba(255,255,255,0.3)",
    opacity: 0.35,
  },
  brandTag: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  hero: { marginBottom: 18 },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 10,
  },
  roleBadgeTxt: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  kicker: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2.2,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.8,
    lineHeight: 36,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 21,
    marginBottom: 6,
  },
  formCardBorder: {
    borderRadius: 24,
    padding: 1.5,
    marginBottom: 22,
  },
  formCardInner: {
    borderRadius: 22,
    padding: 18,
  },
  formHeaderSimple: {
    marginBottom: 14,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  welcomeSub: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
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
  showHide: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  optionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    marginTop: -2,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  rememberText: { fontSize: 12, fontWeight: "600" },
  forgotText: { fontSize: 12, fontWeight: "700" },
  btn: {
    borderRadius: 18,
    paddingVertical: 17,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  readyHint: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 10,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  registerSimple: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  registerSimpleTxt: {
    fontSize: 13,
    fontWeight: "800",
  },
  changeRoleLink: {
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 4,
  },
  changeRoleTxt: {
    fontSize: 12,
    fontWeight: "600",
  },
  footerNote: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.2,
  },
});
