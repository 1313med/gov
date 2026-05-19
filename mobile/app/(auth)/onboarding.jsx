import { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";
import AppBrandMark from "../../src/components/AppBrandMark";
import { markOnboarded } from "../../src/utils/authStorage";
import { useActiveMode } from "../../src/context/ActiveModeContext";
import {
  getOnboardingMeta,
  getOnboardingSlides,
} from "../../src/content/roleOnboarding.fr";
import {
  getUserRoles,
  homeShellForUser,
  normalizeRoleSlug,
} from "../../src/utils/userRoles";

const { width: W } = Dimensions.get("window");

function resolveOnboardingRole(auth, activeMode) {
  const roles = getUserRoles(auth);
  if (activeMode && roles.includes(normalizeRoleSlug(activeMode))) {
    return normalizeRoleSlug(activeMode);
  }
  return normalizeRoleSlug(auth?.role);
}

function GlowOrb({ style, colors, pulse }) {
  return (
    <Animated.View pointerEvents="none" style={[styles.orb, style, { opacity: pulse }]}>
      <LinearGradient colors={colors} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

function SlideCard({ slide, meta, isDark, index, scrollX }) {
  const inputRange = [(index - 1) * W, index * W, (index + 1) * W];
  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.88, 1, 0.88],
    extrapolate: "clamp",
  });
  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.35, 1, 0.35],
    extrapolate: "clamp",
  });
  const translateY = scrollX.interpolate({
    inputRange,
    outputRange: [24, 0, 24],
    extrapolate: "clamp",
  });

  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#94a3b8" : "#64748b";
  const chipBg = isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.05)";
  const chipBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)";
  const isWelcome = slide.kind === "welcome";

  return (
    <Animated.View
      style={[
        styles.slideWrap,
        { width: W, opacity, transform: [{ scale }, { translateY }] },
      ]}
    >
      {isWelcome ? (
        <View style={[styles.welcomeBadge, { borderColor: `${meta.accent}55` }]}>
          <LinearGradient
            colors={[`${meta.accent}33`, `${meta.accent}12`]}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="ribbon-outline" size={14} color={meta.accent} />
          <Text style={[styles.welcomeBadgeTxt, { color: meta.accent }]}>
            {meta.label} · {meta.tagline}
          </Text>
        </View>
      ) : null}

      <LinearGradient
        colors={meta.heroGrad}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.iconRing, { borderColor: `${meta.accent}40` }]}
      >
        <View style={[styles.iconInner, { backgroundColor: `${meta.accent}18` }]}>
          <Ionicons name={slide.icon} size={isWelcome ? 56 : 48} color={meta.accent} />
        </View>
      </LinearGradient>

      <Text style={[styles.slideTitle, { color: titleColor }]}>{slide.title}</Text>
      <Text style={[styles.slideBody, { color: subColor }]}>{slide.body}</Text>

      <View style={styles.tipsWrap}>
        {slide.tips.map((tip) => (
          <View
            key={tip}
            style={[styles.tipChip, { backgroundColor: chipBg, borderColor: chipBorder }]}
          >
            <Ionicons name="checkmark-circle" size={16} color={meta.accent} />
            <Text style={[styles.tipTxt, { color: isDark ? "#e2e8f0" : "#334155" }]}>{tip}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

export default function OnboardingScreen() {
  const { auth } = useAuth();
  const { activeMode, ready: modeReady, ensureCarOwnerLanding, ensureRentalOwnerLanding } =
    useActiveMode();
  const { colors: C, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const role = resolveOnboardingRole(auth, modeReady ? activeMode : null);
  const roles = getUserRoles(auth);
  const multiRole =
    [roles.includes("car_owner"), roles.includes("rental_owner"), roles.includes("admin")].filter(
      Boolean,
    ).length > 1;
  const meta = getOnboardingMeta(role);
  const slides = getOnboardingSlides(role, { multiRole });
  const [index, setIndex] = useState(0);
  const flatRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const orbPulse = useRef(new Animated.Value(0.45)).current;

  const isLast = index === slides.length - 1;
  const progress = (index + 1) / slides.length;

  const bgGrad = isDark
    ? ["#03040a", "#0c0a18", "#05060f"]
    : ["#faf5ff", "#f0f9ff", "#f8fafc"];

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, {
          toValue: 0.75,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(orbPulse, {
          toValue: 0.4,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [orbPulse]);

  const finish = useCallback(async () => {
    if (auth?._id) await markOnboarded(auth._id);
    const r = normalizeRoleSlug(role);
    if (r === "car_owner") {
      await ensureCarOwnerLanding();
      router.replace("/(car-owner)");
    } else if (r === "rental_owner") {
      await ensureRentalOwnerLanding();
      router.replace("/(rental-owner)");
    } else {
      router.replace(homeShellForUser({ role: r, roles: auth?.roles }));
    }
  }, [auth, role, ensureCarOwnerLanding, ensureRentalOwnerLanding, router]);

  const next = () => {
    if (isLast) {
      Animated.sequence([
        Animated.spring(btnScale, { toValue: 0.96, friction: 6, useNativeDriver: true }),
        Animated.spring(btnScale, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]).start(finish);
    } else {
      const nextIdx = index + 1;
      flatRef.current?.scrollToIndex({ index: nextIdx, animated: true });
      setIndex(nextIdx);
    }
  };

  const onViewableChanged = useRef(({ viewableItems }) => {
    if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index);
  }).current;

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
    useNativeDriver: false,
  });

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      <LinearGradient colors={bgGrad} style={StyleSheet.absoluteFill} />

      <GlowOrb
        style={{ width: 220, height: 220, top: -40, right: -60 }}
        colors={[`${meta.accent}55`, "transparent"]}
        pulse={orbPulse}
      />
      <GlowOrb
        style={{ width: 180, height: 180, bottom: 120, left: -70 }}
        colors={[`${meta.accent}33`, "transparent"]}
        pulse={orbPulse}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.topRow}>
          <AppBrandMark size={40} radius={12} gradientColors={meta.grad} halo />
          <Pressable onPress={finish} hitSlop={14} style={styles.skipBtn}>
            <Text style={[styles.skipTxt, { color: C.muted }]}>Passer</Text>
          </Pressable>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)" }]}>
          <LinearGradient
            colors={meta.grad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]}
          />
        </View>
        <Text style={[styles.stepLbl, { color: C.muted }]}>
          Étape {index + 1} sur {slides.length}
        </Text>
      </View>

      <Animated.FlatList
        ref={flatRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item, index: i }) => (
          <SlideCard slide={item} meta={meta} isDark={isDark} index={i} scrollX={scrollX} />
        )}
        onViewableItemsChanged={onViewableChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 55 }}
        getItemLayout={(_, i) => ({ length: W, offset: W * i, index: i })}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  width: i === index ? 22 : 7,
                  backgroundColor: i === index ? meta.accent : `${meta.accent}35`,
                },
              ]}
            />
          ))}
        </View>

        <Animated.View style={{ transform: [{ scale: btnScale }], width: "100%" }}>
          <Pressable onPress={next}>
            <LinearGradient
              colors={meta.grad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.cta, { shadowColor: meta.accent }]}
            >
              <Text style={styles.ctaTxt}>
                {isLast ? "C'est parti !" : "Continuer"}
              </Text>
              <Ionicons
                name={isLast ? "rocket-outline" : "arrow-forward"}
                size={22}
                color="#fff"
              />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  orb: { position: "absolute", borderRadius: 999 },
  topBar: { paddingHorizontal: 22, zIndex: 2 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  skipBtn: { paddingVertical: 8, paddingHorizontal: 4 },
  skipTxt: { fontSize: 14, fontWeight: "700" },
  progressTrack: {
    height: 5,
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: { height: "100%", borderRadius: 999 },
  stepLbl: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  slideWrap: {
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
  },
  welcomeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 20,
  },
  welcomeBadgeTxt: { fontSize: 12, fontWeight: "800", letterSpacing: 0.3 },
  iconRing: {
    width: 132,
    height: 132,
    borderRadius: 66,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    marginBottom: 28,
  },
  iconInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.6,
    lineHeight: 32,
    marginBottom: 12,
    maxWidth: 340,
  },
  slideBody: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
    fontWeight: "500",
    maxWidth: 320,
    marginBottom: 22,
  },
  tipsWrap: { width: "100%", maxWidth: 320, gap: 10 },
  tipChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  tipTxt: { flex: 1, fontSize: 13, fontWeight: "600", lineHeight: 18 },
  footer: { paddingHorizontal: 28, paddingTop: 8, zIndex: 2 },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginBottom: 18,
  },
  dot: { height: 7, borderRadius: 4 },
  cta: {
    borderRadius: 18,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  ctaTxt: { color: "#fff", fontWeight: "800", fontSize: 17, letterSpacing: 0.2 },
});
