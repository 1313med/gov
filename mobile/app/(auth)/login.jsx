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
import { useRouter } from "expo-router";
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
import { getApiErrorMessage } from "../../src/utils/apiErrorMessage";
import { clearLoginForm, loadLoginForm, saveLoginForm } from "../../src/utils/authStorage";

const { width: W } = Dimensions.get("window");

const GRAD_LIGHT = ["#6248e8", "#4f46e5", "#4338ca"];
const GRAD_DARK = ["#a78bfa", "#7c6bff", "#5b4ddb"];
const ACCENT_LIGHT = "#6248e8";
const ACCENT_DARK = "#a78bfa";

const PILL_ICONS = ["shield-checkmark-outline", "flash-outline", "people-outline", "lock-closed-outline"];

const STATS = {
  en: [
    { icon: "car-sport-outline", value: "2K+", labelKey: "statListings" },
    { icon: "star-outline", value: "4.9", labelKey: "statRating" },
    { icon: "heart-outline", value: "98%", labelKey: "statSat" },
  ],
  fr: [
    { icon: "car-sport-outline", value: "2K+", labelKey: "statListings" },
    { icon: "star-outline", value: "4,9", labelKey: "statRating" },
    { icon: "heart-outline", value: "98%", labelKey: "statSat" },
  ],
};

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

function FeatureChip({ icon, label, accent, isDark }) {
  return (
    <View
      style={[
        styles.featureChip,
        {
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)",
          backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.9)",
        },
      ]}
    >
      <View style={[styles.featureChipIcon, { backgroundColor: `${accent}20` }]}>
        <Ionicons name={icon} size={14} color={accent} />
      </View>
      <Text style={[styles.featureChipTxt, { color: isDark ? "#cbd5e1" : "#475569" }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function StatGlass({ icon, value, label, accent, isDark }) {
  return (
    <View
      style={[
        styles.statGlass,
        {
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.06)",
          backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.85)",
        },
      ]}
    >
      <Ionicons name={icon} size={16} color={accent} />
      <Text style={[styles.statValue, { color: isDark ? "#f8fafc" : "#0f172a" }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: isDark ? "#64748b" : "#94a3b8" }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
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
  const { copy, lang, setLang } = useAppLang();
  const c = copy.login;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fr = lang === "fr";

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

  const accent = isDark ? ACCENT_DARK : ACCENT_LIGHT;
  const ctaGrad = isDark ? GRAD_DARK : GRAD_LIGHT;
  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#94a3b8" : "#475569";
  const heroGrad = isDark
    ? ["#020108", "#120a28", "#061018", "#03040a"]
    : ["#faf5ff", "#ede9fe", "#e0f2fe", "#f8fafc"];

  const readyToSignIn = Boolean(identifier.trim() && password);
  const statsMeta = fr ? STATS.fr : STATS.en;
  const pills = c.pills || [];

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
      Alert.alert(fr ? "Champs requis" : "Required", fr ? "Veuillez remplir tous les champs." : "Please fill in all fields.");
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
      Alert.alert(fr ? "Erreur" : "Error", getApiErrorMessage(e, c.invalidCreds));
    } finally {
      setLoading(false);
    }
  };

  const orbDriftY = orbDrift.interpolate({ inputRange: [0, 1], outputRange: [0, 14] });
  const shimmerX = shimmer.interpolate({ inputRange: [-1, 1], outputRange: [-W * 0.35, W * 0.35] });

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#03040a" : C.bg }}>
      <LinearGradient pointerEvents="none" colors={heroGrad} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFill} />
      <GlowOrb
        scaleAnim={orbPulse}
        colors={isDark ? ["rgba(167,139,250,0.5)", "rgba(167,139,250,0)"] : ["rgba(98,72,232,0.35)", "rgba(98,72,232,0)"]}
        style={{ width: 240, height: 240, top: -90, right: -80 }}
      />
      <Animated.View pointerEvents="none" style={{ transform: [{ translateY: orbDriftY }] }}>
        <GlowOrb
          scaleAnim={orbPulse}
          colors={isDark ? ["rgba(56,189,248,0.3)", "rgba(56,189,248,0)"] : ["rgba(14,165,233,0.25)", "rgba(14,165,233,0)"]}
          style={{ width: 180, height: 180, top: 200, left: -90 }}
        />
      </Animated.View>
      <GlowOrb
        scaleAnim={orbPulse}
        colors={isDark ? ["rgba(52,211,153,0.2)", "rgba(52,211,153,0)"] : ["rgba(16,185,129,0.18)", "rgba(16,185,129,0)"]}
        style={{ width: 120, height: 120, top: 380, right: 20 }}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 32 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <View style={styles.brandRow}>
              <View style={styles.logoHalo}>
                <LinearGradient colors={ctaGrad} style={styles.logoBox}>
                  <Ionicons name="car-sport" size={22} color="#fff" />
                </LinearGradient>
              </View>
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
                  {fr ? "Mobilité premium · Maroc" : "Premium mobility · Morocco"}
                </Text>
              </View>
            </View>
            <View style={styles.topActions}>
              <Pressable
                onPress={() => setLang(fr ? "en" : "fr")}
                style={[styles.langBtn, { borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)" }]}
              >
                <Text style={{ color: accent, fontWeight: "800", fontSize: 12 }}>{fr ? "EN" : "FR"}</Text>
              </Pressable>
              <ThemeToggle />
            </View>
          </View>

          <Animated.View style={[styles.hero, { opacity: heroOpacity, transform: [{ translateY: heroSlide }] }]}>
            <LinearGradient colors={ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.welcomeBadge}>
              <Ionicons name="sparkles" size={12} color="#fff" />
              <Text style={styles.welcomeBadgeTxt}>
                {fr ? "Heureux de vous revoir" : "Great to see you again"}
              </Text>
            </LinearGradient>

            <Text style={[styles.kicker, { color: accent }]}>{c.memberPortal || (fr ? "ESPACE MEMBRE" : "MEMBER SPACE")}</Text>
            <Text style={[styles.heroTitle, { color: titleColor }]}>
              {c.heroL1} {c.heroL2 ? `${c.heroL2} ` : ""}
              <Text style={{ color: accent, fontStyle: "italic" }}>{c.heroEm}</Text>
              {c.heroL3 ? ` ${c.heroL3}` : ""}
            </Text>
            <Text style={[styles.heroSub, { color: subColor }]}>{c.heroSub}</Text>

            <View style={styles.statsRow}>
              {statsMeta.map((s) => (
                <StatGlass
                  key={s.labelKey}
                  icon={s.icon}
                  value={s.value}
                  label={c[s.labelKey] || s.labelKey}
                  accent={accent}
                  isDark={isDark}
                />
              ))}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              {pills.map((pill, idx) => (
                <FeatureChip key={pill} icon={PILL_ICONS[idx] || "checkmark-outline"} label={pill} accent={accent} isDark={isDark} />
              ))}
            </ScrollView>
          </Animated.View>

          <Animated.View style={{ opacity: formOpacity, transform: [{ translateY: formSlide }] }}>
            <LinearGradient colors={ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.formCardBorder}>
              <View style={[styles.formCardInner, { backgroundColor: isDark ? "#0a0b12" : "#fafbff" }]}>
                <View style={styles.formHeader}>
                  <View style={[styles.formIconWrap, { backgroundColor: `${accent}18` }]}>
                    <Ionicons name="log-in-outline" size={22} color={accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.welcomeTitle, { color: titleColor }]}>
                      {c.welcomeTitle}{" "}
                      <Text style={{ color: accent }}>{c.welcomeEm}</Text>
                    </Text>
                    <Text style={[styles.welcomeSub, { color: subColor }]}>{c.welcomeSub}</Text>
                  </View>
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
                    <Text style={[styles.rememberText, { color: subColor }]}>{fr ? "Se souvenir de moi" : "Remember me"}</Text>
                  </Pressable>
                  <Pressable onPress={() => router.push("/(auth)/forgot-password")} hitSlop={8}>
                    <Text style={[styles.forgotText, { color: accent }]}>{fr ? "Mot de passe oublié ?" : "Forgot password?"}</Text>
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
                    {fr ? "✓ Prêt — appuyez pour entrer" : "✓ Ready — tap to enter"}
                  </Text>
                ) : null}
              </View>
            </LinearGradient>
          </Animated.View>

          <Animated.View style={{ opacity: footerOpacity }}>
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)" }]} />
              <Text style={[styles.dividerText, { color: subColor }]}>
                {fr ? "Première visite ?" : "First time here?"}
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)" }]} />
            </View>

            <Pressable
              onPress={() => router.push("/(auth)/role-select")}
              style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
            >
              <LinearGradient
                colors={isDark ? ["rgba(167,139,250,0.15)", "rgba(56,189,248,0.08)"] : ["rgba(98,72,232,0.08)", "rgba(14,165,233,0.06)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.registerCard,
                  { borderColor: isDark ? "rgba(167,139,250,0.25)" : "rgba(98,72,232,0.2)" },
                ]}
              >
                <LinearGradient colors={ctaGrad} style={styles.registerIcon}>
                  <Ionicons name="rocket-outline" size={22} color="#fff" />
                </LinearGradient>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.registerTitle, { color: titleColor }]}>
                    {fr ? "Créer un compte gratuit" : "Create your free account"}
                  </Text>
                  <Text style={[styles.registerSub, { color: subColor }]}>
                    {fr
                      ? "3 parcours : explorer, garage ou flotte — à vous de choisir."
                      : "3 paths: explore, garage, or fleet — pick yours."}
                  </Text>
                  <View style={styles.registerCta}>
                    <Text style={[styles.registerCtaTxt, { color: accent }]}>{fr ? "Commencer" : "Get started"}</Text>
                    <Ionicons name="arrow-forward" size={14} color={accent} />
                  </View>
                </View>
              </LinearGradient>
            </Pressable>

            <Text style={[styles.footerNote, { color: isDark ? "#475569" : "#94a3b8" }]}>
              {fr
                ? "Vos données sont protégées · Connexion chiffrée"
                : "Your data is protected · Encrypted sign-in"}
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
  logoHalo: {
    shadowColor: "#7c6bff",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
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
  welcomeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  welcomeBadgeTxt: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
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
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  statGlass: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "700",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  chipsScroll: {
    gap: 8,
    paddingRight: 20,
  },
  featureChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  featureChipIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  featureChipTxt: {
    fontSize: 11,
    fontWeight: "700",
    maxWidth: 120,
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
  formHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 18,
  },
  formIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
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
  registerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  registerIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  registerTitle: {
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  registerSub: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 17,
    marginBottom: 8,
  },
  registerCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  registerCtaTxt: {
    fontSize: 13,
    fontWeight: "800",
  },
  footerNote: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.2,
  },
});
