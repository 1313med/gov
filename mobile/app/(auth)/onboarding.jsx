import { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { markOnboarded } from "../../src/utils/authStorage";
import { useActiveMode } from "../../src/context/ActiveModeContext";

const { width: W } = Dimensions.get("window");

import { homeShellForUser, normalizeRoleSlug } from "../../src/utils/userRoles";

const SLIDES = {
  customer: [
    {
      icon: "search-outline",
      iconColor: "#7c6bff",
      gradColors: ["rgba(124,107,255,0.18)", "rgba(124,107,255,0.04)"],
      en: { title: "Explore the best cars in Morocco", body: "Browse thousands of verified rentals and cars for sale — all in one place, beautifully organised." },
      fr: { title: "Explorez les meilleures voitures", body: "Des milliers de locations et voitures vérifiées — tout en un endroit, parfaitement organisé." },
    },
    {
      icon: "calendar-outline",
      iconColor: "#38bdf8",
      gradColors: ["rgba(56,189,248,0.18)", "rgba(56,189,248,0.04)"],
      en: { title: "Book a rental in seconds", body: "Pick your dates, see the exact price, confirm — and your car is ready for pickup." },
      fr: { title: "Réservez en quelques secondes", body: "Choisissez vos dates, voyez le prix exact, confirmez — et votre voiture est prête." },
    },
    {
      icon: "shield-checkmark-outline",
      iconColor: "#34d399",
      gradColors: ["rgba(52,211,153,0.18)", "rgba(52,211,153,0.04)"],
      en: { title: "Verify once, book forever", body: "Add your driver's license and national ID once. After that, every booking is instant." },
      fr: { title: "Vérifiez une fois, réservez toujours", body: "Ajoutez permis et CIN une seule fois. Après ça, chaque réservation est instantanée." },
    },
  ],
  car_owner: [
    {
      icon: "car-sport-outline",
      iconColor: "#38bdf8",
      gradColors: ["rgba(56,189,248,0.18)", "rgba(56,189,248,0.04)"],
      en: { title: "Your car, always under control", body: "Track insurance, oil changes, technical visits, and vignette — every document, every date, in one place." },
      fr: { title: "Votre voiture, toujours sous contrôle", body: "Suivez assurance, vidange, visite technique et vignette — chaque document, chaque date, en un seul endroit." },
    },
    {
      icon: "notifications-outline",
      iconColor: "#f59e0b",
      gradColors: ["rgba(245,158,11,0.18)", "rgba(245,158,11,0.04)"],
      en: { title: "Get notified before anything expires", body: "We alert you 30 days before your insurance, license, or registration expires. Never get caught off guard." },
      fr: { title: "Alertes avant toute expiration", body: "Nous vous alertons 30 jours avant l'expiration de votre assurance, permis ou carte grise. Plus jamais de surprise." },
    },
    {
      icon: "storefront-outline",
      iconColor: "#7c6bff",
      gradColors: ["rgba(124,107,255,0.18)", "rgba(124,107,255,0.04)"],
      en: { title: "The marketplace is right here", body: "Whenever you're ready — list your car for sale. Thousands of buyers are already browsing Goovoiture." },
      fr: { title: "La marketplace est là pour vous", body: "Quand vous êtes prêt — mettez votre voiture en vente. Des milliers d'acheteurs parcourent déjà Goovoiture." },
    },
  ],
  rental_owner: [
    {
      icon: "analytics-outline",
      iconColor: "#34d399",
      gradColors: ["rgba(52,211,153,0.18)", "rgba(52,211,153,0.04)"],
      en: { title: "Your fleet dashboard, live", body: "Revenue, active bookings, and fleet health — visible at a glance the moment you open the app." },
      fr: { title: "Votre tableau de bord, en direct", body: "Revenus, réservations actives et santé de flotte — visibles dès l'ouverture de l'application." },
    },
    {
      icon: "clipboard-outline",
      iconColor: "#7c6bff",
      gradColors: ["rgba(124,107,255,0.18)", "rgba(124,107,255,0.04)"],
      en: { title: "Accept bookings in one tap", body: "Review requests, approve or decline — fast, simple, and always in your control." },
      fr: { title: "Acceptez des réservations en un tap", body: "Examinez les demandes, approuvez ou refusez — rapide, simple et toujours sous votre contrôle." },
    },
    {
      icon: "trophy-outline",
      iconColor: "#f59e0b",
      gradColors: ["rgba(245,158,11,0.18)", "rgba(245,158,11,0.04)"],
      en: { title: "Track what's working", body: "Views per listing, occupancy rate, and monthly revenue — know exactly which cars perform best." },
      fr: { title: "Suivez ce qui fonctionne", body: "Vues par annonce, taux d'occupation et revenus mensuels — sachez exactement quelles voitures performent." },
    },
  ],
};

function Slide({ slide, fr, C, isDark }) {
  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#94a3b8" : "#475569";
  const copy = fr ? slide.fr : slide.en;

  return (
    <View style={{ width: W, paddingHorizontal: 32, alignItems: "center", justifyContent: "center" }}>
      <LinearGradient
        colors={slide.gradColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.iconCircle, { borderColor: `${slide.iconColor}35` }]}
      >
        <Ionicons name={slide.icon} size={52} color={slide.iconColor} />
      </LinearGradient>
      <Text style={[styles.slideTitle, { color: titleColor }]}>{copy.title}</Text>
      <Text style={[styles.slideBody, { color: subColor }]}>{copy.body}</Text>
    </View>
  );
}

function Dots({ total, current, activeColor }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: i === current ? activeColor : `${activeColor}35`,
              width: i === current ? 20 : 7,
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function OnboardingScreen() {
  const { auth } = useAuth();
  const { ensureCarOwnerLanding, ensureRentalOwnerLanding } = useActiveMode();
  const { colors: C, isDark } = useTheme();
  const { lang } = useAppLang();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fr = lang === "fr";

  const role = normalizeRoleSlug(auth?.role);
  const slides = SLIDES[role] || SLIDES.customer;
  const [index, setIndex] = useState(0);
  const flatRef = useRef(null);
  const btnScale = useRef(new Animated.Value(1)).current;

  const isLast = index === slides.length - 1;

  const heroGrad = isDark
    ? ["#03040a", "#120a24", "#0a1628", "#05060f"]
    : ["#faf5ff", "#e0f2fe", "#f0f9ff", "#f8fafc"];

  const getRoleColors = () => {
    if (role === "rental_owner") return isDark ? ["#34d399", "#10b981"] : ["#059669", "#047857"];
    if (role === "car_owner") return isDark ? ["#38bdf8", "#0ea5e9"] : ["#0284c7", "#0369a1"];
    return isDark ? ["#7c6bff", "#5b4ddb"] : ["#6248e8", "#4f46e5"];
  };
  const getRoleAccent = () => {
    if (role === "rental_owner") return isDark ? "#34d399" : "#059669";
    if (role === "car_owner") return isDark ? "#38bdf8" : "#0284c7";
    return isDark ? "#7c6bff" : "#6248e8";
  };

  const ctaGrad = getRoleColors();
  const accent = getRoleAccent();
  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#94a3b8" : "#475569";

  const finish = useCallback(async () => {
    if (auth?._id) await markOnboarded(auth._id);
    if (role === "car_owner" || role === "seller") {
      await ensureCarOwnerLanding();
      router.replace("/(car-owner)");
    } else if (role === "rental_owner") {
      await ensureRentalOwnerLanding();
      router.replace("/(rental-owner)");
    } else {
      router.replace(homeShellForUser({ role, roles: auth?.roles }));
    }
  }, [auth, role, ensureCarOwnerLanding, ensureRentalOwnerLanding, router]);

  const next = () => {
    if (isLast) {
      Animated.sequence([
        Animated.spring(btnScale, { toValue: 0.95, friction: 6, useNativeDriver: true }),
        Animated.spring(btnScale, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]).start(finish);
    } else {
      const nextIdx = index + 1;
      flatRef.current?.scrollToIndex({ index: nextIdx, animated: true });
      setIndex(nextIdx);
    }
  };

  const onViewableChanged = useCallback(({ viewableItems }) => {
    if (viewableItems[0]) setIndex(viewableItems[0].index);
  }, []);

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <LinearGradient colors={heroGrad} style={{ paddingTop: insets.top + 16, paddingBottom: 20, paddingHorizontal: 24, overflow: "hidden" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <LinearGradient colors={ctaGrad} style={styles.logoBox}>
            <Ionicons name="car-sport" size={18} color="#fff" />
          </LinearGradient>
          <TouchableOpacity onPress={finish} activeOpacity={0.8} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={[styles.skipText, { color: subColor }]}>{fr ? "Passer" : "Skip"}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={{ flex: 1, justifyContent: "center" }}>
        <FlatList
          ref={flatRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => <Slide slide={item} fr={fr} C={C} isDark={isDark} />}
          onViewableItemsChanged={onViewableChanged}
          viewabilityConfig={viewConfig}
          scrollEnabled={true}
          getItemLayout={(_, i) => ({ length: W, offset: W * i, index: i })}
        />
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24, paddingHorizontal: 28 }]}>
        <Dots total={slides.length} current={index} activeColor={accent} />

        <Animated.View style={{ transform: [{ scale: btnScale }], width: "100%", marginTop: 24 }}>
          <Pressable onPress={next} activeOpacity={0.9}>
            <LinearGradient
              colors={ctaGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nextBtn}
            >
              <Text style={styles.nextBtnText}>
                {isLast ? (fr ? "Commencer" : "Get Started") : (fr ? "Suivant" : "Next")}
              </Text>
              <Ionicons name={isLast ? "checkmark-circle-outline" : "arrow-forward"} size={20} color="#fff" />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7c6bff",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  skipText: { fontSize: 14, fontWeight: "700" },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: 33,
    marginBottom: 16,
  },
  slideBody: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    fontWeight: "500",
    maxWidth: 320,
  },
  dotsRow: { flexDirection: "row", gap: 6, justifyContent: "center" },
  dot: { height: 7, borderRadius: 4 },
  footer: { alignItems: "center" },
  nextBtn: {
    borderRadius: 18,
    paddingVertical: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#7c6bff",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
  },
  nextBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
