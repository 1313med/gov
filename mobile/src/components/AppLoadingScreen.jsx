import { useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { useAppLang } from "../context/AppLangContext";
import AppBrandMark from "./AppBrandMark";

const LOGO_MARK_DARK = require("../../assets/images/goovoiture-logo-mark-dark.png");

const PRESETS = {
  full: { ring: 140, logo: 84, brand: true, ambient: true },
  page: { ring: 108, logo: 62, brand: false, ambient: false },
  compact: { ring: 72, logo: 40, brand: false, ambient: false },
};

const THEME = {
  dark: {
    accent: "#a78bfa",
    accentDim: "rgba(167,139,250,0.45)",
    track: "rgba(255,255,255,0.07)",
    plateBg: "rgba(255,255,255,0.035)",
    plateBorder: "rgba(167,139,250,0.2)",
    aura: ["rgba(124,107,255,0.28)", "rgba(124,107,255,0)"],
    brand: "#f8fafc",
    brandAccent: "#c4b5fd",
    message: "#94a3b8",
    dot: "#a78bfa",
  },
  light: {
    accent: "#6248e8",
    accentDim: "rgba(98,72,232,0.4)",
    track: "rgba(15,23,42,0.07)",
    plateBg: "rgba(255,255,255,0.92)",
    plateBorder: "rgba(98,72,232,0.14)",
    aura: ["rgba(98,72,232,0.14)", "rgba(98,72,232,0)"],
    brand: "#0f172a",
    brandAccent: "#6248e8",
    message: "#64748b",
    dot: "#6248e8",
  },
};

function LoadingDots({ color }) {
  const a = useRef(new Animated.Value(0.35)).current;
  const b = useRef(new Animated.Value(0.35)).current;
  const c = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const step = (v, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(v, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0.35, duration: 420, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
          Animated.delay(840 - delay),
        ])
      );
    const l1 = step(a, 0);
    const l2 = step(b, 140);
    const l3 = step(c, 280);
    l1.start();
    l2.start();
    l3.start();
    return () => {
      l1.stop();
      l2.stop();
      l3.stop();
    };
  }, [a, b, c]);

  const dot = (opacity) => (
    <Animated.View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color, opacity, marginHorizontal: 3 }} />
  );

  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 14 }}>
      {dot(a)}
      {dot(b)}
      {dot(c)}
    </View>
  );
}

function AmbientField({ isDark, breathe }) {
  const opacity = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.32, 0.52] });
  const topColors = isDark
    ? ["rgba(124,107,255,0.22)", "rgba(124,107,255,0)"]
    : ["rgba(98,72,232,0.12)", "rgba(98,72,232,0)"];
  const bottomColors = isDark
    ? ["rgba(56,189,248,0.12)", "rgba(56,189,248,0)"]
    : ["rgba(14,165,233,0.08)", "rgba(14,165,233,0)"];

  return (
    <>
      <Animated.View pointerEvents="none" style={[styles.ambientTop, { opacity }]}>
        <LinearGradient colors={topColors} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.ambientBottom, { opacity: breathe }]}>
        <LinearGradient colors={bottomColors} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </>
  );
}

/** Refined loader — single orbit, soft breathe, no shimmer or bounce. */
function EliteMarkLoader({ preset, message, isDark }) {
  const { ring, logo, brand, ambient } = preset;
  const t = isDark ? THEME.dark : THEME.light;

  const orbit = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  const markScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const orbitLoop = Animated.loop(
      Animated.timing(orbit, {
        toValue: 1,
        duration: 2800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const breatheLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 2200,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 2200,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ])
    );
    const markLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(markScale, {
          toValue: 1.018,
          duration: 2000,
          easing: Easing.bezier(0.33, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(markScale, {
          toValue: 1,
          duration: 2000,
          easing: Easing.bezier(0.33, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ])
    );
    orbitLoop.start();
    breatheLoop.start();
    markLoop.start();
    return () => {
      orbitLoop.stop();
      breatheLoop.stop();
      markLoop.stop();
    };
  }, [orbit, breathe, markScale]);

  const rotate = orbit.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const auraOpacity = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });
  const plate = logo + 10;
  const trackSize = ring;
  const arcSize = ring - 6;

  return (
    <View style={styles.inlineRoot}>
      {ambient ? <AmbientField isDark={isDark} breathe={breathe} /> : null}

      <View style={[styles.stage, { width: trackSize, height: trackSize, marginBottom: brand ? 26 : 10 }]}>
        {/* Static track */}
        <View
          style={[
            styles.trackRing,
            {
              width: trackSize,
              height: trackSize,
              borderRadius: trackSize / 2,
              borderColor: t.track,
            },
          ]}
        />

        {/* Single sweeping arc */}
        <Animated.View
          style={[
            styles.arcRing,
            {
              width: arcSize,
              height: arcSize,
              borderRadius: arcSize / 2,
              borderTopColor: t.accent,
              borderRightColor: t.accentDim,
              transform: [{ rotate }],
            },
          ]}
        />

        {/* Soft halo */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.aura,
            {
              width: ring - 16,
              height: ring - 16,
              borderRadius: (ring - 16) / 2,
              opacity: auraOpacity,
            },
          ]}
        >
          <LinearGradient colors={t.aura} style={styles.auraFill} />
        </Animated.View>

        {/* Logo */}
        <Animated.View style={{ transform: [{ scale: markScale }] }}>
          <View
            style={[
              styles.plate,
              {
                width: plate,
                height: plate,
                borderRadius: Math.max(14, logo * 0.22),
                backgroundColor: t.plateBg,
                borderColor: t.plateBorder,
              },
            ]}
          >
            {isDark ? (
              <Image
                source={LOGO_MARK_DARK}
                style={{ width: logo, height: logo }}
                resizeMode="contain"
                accessibilityLabel="Goovoiture"
              />
            ) : (
              <AppBrandMark size={logo} radius={Math.round(logo * 0.22)} />
            )}
          </View>
        </Animated.View>
      </View>

      {brand ? (
        <Text style={[styles.brandWord, { color: t.brand }]}>
          Goo<Text style={[styles.brandAccent, { color: t.brandAccent }]}>voiture</Text>
        </Text>
      ) : null}

      {message ? (
        <View style={{ alignItems: "center" }}>
          <Text style={[styles.message, { color: t.message }]}>{message.replace(/…$|\.{3}$/, "")}</Text>
          <LoadingDots color={t.dot} />
        </View>
      ) : null}
    </View>
  );
}

/** Animated logo — use inside flex containers or full screen. */
export function AppLogoLoader({ variant = "page", message, style }) {
  const { isDark } = useTheme();
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const showCaption = variant !== "compact";
  const label = message ?? (showCaption ? (fr ? "Chargement" : "Loading") : null);
  const preset = PRESETS[variant] || PRESETS.page;

  return (
    <View style={[styles.inlineRoot, style]}>
      <EliteMarkLoader preset={preset} message={label} isDark={isDark} />
    </View>
  );
}

/** Full-screen page load (replaces ActivityIndicator on navigation). */
export function PageLoader({ message }) {
  const { colors: C } = useTheme();
  return (
    <View style={[styles.fill, { backgroundColor: C.bg }]}>
      <AppLogoLoader variant="page" message={message} />
    </View>
  );
}

/** Inline / list section load. */
export function InlineLogoLoader({ message }) {
  return (
    <View style={{ paddingVertical: 28, alignItems: "center", justifyContent: "center" }}>
      <AppLogoLoader variant="compact" message={message} />
    </View>
  );
}

/** App bootstrap — full branding. */
export default function AppLoadingScreen({ message }) {
  const { colors: C } = useTheme();
  return (
    <View style={[styles.fill, { backgroundColor: C.bg }]}>
      <AppLogoLoader variant="full" message={message} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  inlineRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  ambientTop: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    top: "10%",
    right: -100,
  },
  ambientBottom: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    bottom: "14%",
    left: -90,
  },
  stage: {
    alignItems: "center",
    justifyContent: "center",
  },
  trackRing: {
    position: "absolute",
    borderWidth: 1,
  },
  arcRing: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
  },
  aura: {
    position: "absolute",
    overflow: "hidden",
  },
  auraFill: {
    flex: 1,
    borderRadius: 999,
  },
  plate: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  brandWord: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  brandAccent: {
    fontStyle: "italic",
    fontWeight: "800",
  },
  message: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    textAlign: "center",
  },
});
