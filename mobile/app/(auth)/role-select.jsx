import { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";
import { useAppLang } from "../../src/context/AppLangContext";

const { width: W, height: H } = Dimensions.get("window");

const ROLES = [
  {
    key: "customer",
    icon: "search-outline",
    activeIcon: "search",
    colorLight: "#6248e8",
    colorDark: "#7c6bff",
    gradLight: ["#6248e8", "#4f46e5"],
    gradDark: ["#7c6bff", "#5b4ddb"],
    en: {
      title: "Rent or Buy a Car",
      subtitle: "Browse thousands of verified cars and rentals across Morocco.",
      tag: "CUSTOMER",
    },
    fr: {
      title: "Louer ou Acheter",
      subtitle: "Parcourez des milliers de voitures vérifiées et locations.",
      tag: "CLIENT",
    },
  },
  {
    key: "seller",
    icon: "car-sport-outline",
    activeIcon: "car-sport",
    colorLight: "#0284c7",
    colorDark: "#38bdf8",
    gradLight: ["#0284c7", "#0369a1"],
    gradDark: ["#38bdf8", "#0ea5e9"],
    en: {
      title: "I Own a Car",
      subtitle: "Track insurance, oil changes, and document renewals — never miss a date.",
      tag: "CAR OWNER",
    },
    fr: {
      title: "Je Possède une Voiture",
      subtitle: "Suivez assurance, vidange et renouvellements — ne ratez plus rien.",
      tag: "PROPRIÉTAIRE",
    },
  },
  {
    key: "rental_owner",
    icon: "business-outline",
    activeIcon: "business",
    colorLight: "#059669",
    colorDark: "#34d399",
    gradLight: ["#059669", "#047857"],
    gradDark: ["#34d399", "#10b981"],
    en: {
      title: "Rent Out My Cars",
      subtitle: "Manage your fleet, accept bookings, and track revenue — all in one place.",
      tag: "RENTAL OWNER",
    },
    fr: {
      title: "Je Loue mes Voitures",
      subtitle: "Gérez votre flotte, acceptez des réservations et suivez vos revenus.",
      tag: "LOUEUR",
    },
  },
];

function GlowOrb({ style, colors, anim }) {
  return (
    <Animated.View style={[{ position: "absolute", borderRadius: 999, opacity: 0.45 }, style, { transform: [{ scale: anim }] }]}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

function RoleCard({ role, selected, onPress, C, isDark, fr, anim }) {
  const copy = fr ? role.fr : role.en;
  const color = isDark ? role.colorDark : role.colorLight;
  const isSelected = selected === role.key;

  return (
    <Animated.View style={{ opacity: anim.opacity, transform: [{ translateY: anim.translate }] }}>
      <Pressable
        onPress={() => onPress(role.key)}
        style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
      >
        <View
          style={[
            styles.card,
            {
              borderColor: isSelected ? color : isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.07)",
              backgroundColor: isDark
                ? isSelected ? `${color}12` : "rgba(255,255,255,0.04)"
                : isSelected ? `${color}08` : "#ffffff",
              shadowColor: isSelected ? color : "#000",
              shadowOpacity: isSelected ? (isDark ? 0.35 : 0.15) : (isDark ? 0.3 : 0.06),
              shadowRadius: isSelected ? 20 : 8,
              shadowOffset: { width: 0, height: isSelected ? 8 : 3 },
              elevation: isSelected ? 10 : 3,
            },
          ]}
        >
          <LinearGradient
            colors={isSelected ? (isDark ? role.gradDark : role.gradLight) : [`${color}22`, `${color}08`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.iconBox, { borderRadius: 16 }]}
          >
            <Ionicons
              name={isSelected ? role.activeIcon : role.icon}
              size={26}
              color={isSelected ? "#fff" : color}
            />
          </LinearGradient>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Text style={[styles.cardTitle, { color: isDark ? "#f1f5f9" : "#0f172a" }]}>{copy.title}</Text>
              {isSelected && (
                <View style={[styles.checkBadge, { backgroundColor: color }]}>
                  <Ionicons name="checkmark" size={10} color="#fff" />
                </View>
              )}
            </View>
            <Text style={[styles.cardSub, { color: isDark ? "#94a3b8" : "#64748b" }]} numberOfLines={2}>
              {copy.subtitle}
            </Text>
          </View>

          <Ionicons
            name={isSelected ? "chevron-forward-circle" : "chevron-forward"}
            size={20}
            color={isSelected ? color : isDark ? "#334155" : "#cbd5e1"}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function RoleSelectScreen() {
  const { colors: C, isDark } = useTheme();
  const { lang } = useAppLang();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fr = lang === "fr";

  const [selected, setSelected] = useState(null);

  const orbPulse = useRef(new Animated.Value(1)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(30)).current;

  const cardAnims = useRef(
    ROLES.map(() => ({ opacity: new Animated.Value(0), translate: new Animated.Value(24) }))
  ).current;

  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(heroSlide, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();

    Animated.stagger(
      100,
      cardAnims.map((a) =>
        Animated.parallel([
          Animated.timing(a.opacity, { toValue: 1, duration: 500, delay: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.spring(a.translate, { toValue: 0, friction: 7, tension: 42, delay: 300, useNativeDriver: true }),
        ])
      )
    ).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, { toValue: 1.14, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orbPulse, { toValue: 1, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const handleContinue = () => {
    if (!selected) return;
    Animated.sequence([
      Animated.spring(btnScale, { toValue: 0.96, friction: 6, useNativeDriver: true }),
      Animated.spring(btnScale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start(() => {
      router.push({ pathname: "/(auth)/register", params: { role: selected } });
    });
  };

  const heroGrad = isDark
    ? ["#03040a", "#120a24", "#0a1628", "#05060f"]
    : ["#faf5ff", "#e0f2fe", "#f0f9ff", "#f8fafc"];
  const orbA = isDark ? ["rgba(124,107,255,0.5)", "rgba(124,107,255,0)"] : ["rgba(98,72,232,0.3)", "rgba(98,72,232,0)"];
  const orbB = isDark ? ["rgba(56,189,248,0.3)", "rgba(56,189,248,0)"] : ["rgba(14,165,233,0.25)", "rgba(14,165,233,0)"];
  const ctaGrad = isDark ? ["#7c6bff", "#5b4ddb"] : ["#6248e8", "#4f46e5"];
  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#94a3b8" : "#475569";

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <LinearGradient colors={heroGrad} style={[styles.hero, { paddingTop: insets.top + 16 }]}>
        <GlowOrb anim={orbPulse} colors={orbA} style={{ width: 260, height: 260, top: -80, right: -80 }} />
        <GlowOrb anim={orbPulse} colors={orbB} style={{ width: 200, height: 200, bottom: -40, left: -80 }} />

        <Animated.View style={{ opacity: heroOpacity, transform: [{ translateY: heroSlide }], alignItems: "center" }}>
          <LinearGradient colors={ctaGrad} style={styles.logoBox}>
            <Ionicons name="car-sport" size={22} color="#fff" />
          </LinearGradient>
          <Text style={[styles.kicker, { color: C.primary }]}>
            {fr ? "BIENVENUE" : "WELCOME TO"}
          </Text>
          <Text style={[styles.brand, { color: titleColor }]}>
            Goo<Text style={{ fontStyle: "italic", color: C.primary }}>voiture</Text>
          </Text>
          <Text style={[styles.heroSub, { color: subColor }]}>
            {fr
              ? "Comment souhaitez-vous utiliser l'application ?"
              : "How would you like to use the app?"}
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.cards, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {ROLES.map((role, i) => (
          <RoleCard
            key={role.key}
            role={role}
            selected={selected}
            onPress={setSelected}
            C={C}
            isDark={isDark}
            fr={fr}
            anim={cardAnims[i]}
          />
        ))}

        <Animated.View style={{ transform: [{ scale: btnScale }], marginTop: 8 }}>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!selected}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={selected ? ctaGrad : [isDark ? "#1e2140" : "#e2e8f0", isDark ? "#1e2140" : "#e2e8f0"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.continueBtn, !selected && { opacity: 0.5 }]}
            >
              <Text style={[styles.continueTxt, { color: selected ? "#fff" : (isDark ? "#475569" : "#94a3b8") }]}>
                {fr ? "Continuer" : "Continue"}
              </Text>
              <Ionicons name="arrow-forward" size={18} color={selected ? "#fff" : (isDark ? "#475569" : "#94a3b8")} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.loginRow}>
          <Text style={[styles.loginQ, { color: subColor }]}>
            {fr ? "Déjà un compte ? " : "Already have an account? "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")} activeOpacity={0.85}>
            <Text style={[styles.loginLink, { color: C.primary }]}>
              {fr ? "Se connecter" : "Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingBottom: 28,
    paddingHorizontal: 24,
    alignItems: "center",
    overflow: "hidden",
  },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: "#7c6bff",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  kicker: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2.5,
    marginBottom: 6,
  },
  brand: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  heroSub: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
  },
  cards: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
  },
  iconBox: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  cardSub: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  checkBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  continueBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#7c6bff",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  continueTxt: {
    fontWeight: "800",
    fontSize: 16,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    paddingBottom: 8,
  },
  loginQ: { fontSize: 14, fontWeight: "500" },
  loginLink: { fontSize: 14, fontWeight: "800" },
});
