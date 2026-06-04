import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { useAppLang } from "../context/AppLangContext";

/* ─────────────────────────────────────────────
   THEME TOKENS
───────────────────────────────────────────── */
const THEME = {
  dark: {
    accent:  "#7c6bff",
    accentB: "#38bdf8",
    accentC: "#a78bfa",
    track:   "rgba(255,255,255,0.05)",
    ring1:   ["#7c6bff", "rgba(124,107,255,0.25)", "transparent", "transparent"],
    ring2:   ["#38bdf8", "rgba(56,189,248,0.2)",   "transparent", "transparent"],
    ring3:   ["rgba(167,139,250,0.5)", "transparent", "transparent", "rgba(167,139,250,0.1)"],
    dot1:    "#7c6bff",
    dot2:    "#38bdf8",
    dot3:    "#a78bfa",
    brand:   "#f8fafc",
    brandEm: "#a78bfa",
    msg:     "rgba(255,255,255,0.32)",
    dotC:    "#7c6bff",
  },
  light: {
    accent:  "#6248e8",
    accentB: "#0ea5e9",
    accentC: "#8b5cf6",
    track:   "rgba(15,23,42,0.06)",
    ring1:   ["#6248e8", "rgba(98,72,232,0.25)",   "transparent", "transparent"],
    ring2:   ["#0ea5e9", "rgba(14,165,233,0.2)",   "transparent", "transparent"],
    ring3:   ["rgba(139,92,246,0.5)", "transparent", "transparent", "rgba(139,92,246,0.1)"],
    dot1:    "#6248e8",
    dot2:    "#0ea5e9",
    dot3:    "#8b5cf6",
    brand:   "#0f172a",
    brandEm: "#6248e8",
    msg:     "#94a3b8",
    dotC:    "#6248e8",
  },
};

/* ─────────────────────────────────────────────
   SPIN RING
───────────────────────────────────────────── */
function SpinRing({ size, borderWidth, colors, duration, reverse = false }) {
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(rot, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true })
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const rotate = rot.interpolate({
    inputRange: [0, 1],
    outputRange: reverse ? ["360deg", "0deg"] : ["0deg", "360deg"],
  });
  const [c0, c1, c2, c3] = colors;

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth,
        borderTopColor:    c0,
        borderRightColor:  c1,
        borderBottomColor: c2,
        borderLeftColor:   c3,
        transform: [{ rotate }],
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   ORBITAL DOT
───────────────────────────────────────────── */
function OrbitalDot({ radius, color, duration, initialOffset = 0, size = 6, glowColor, reverse = false }) {
  const rot   = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rot, { toValue: reverse ? -1 : 1, duration, easing: Easing.linear, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1,   duration: duration * 0.4, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: duration * 0.4, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    return () => { rot.stopAnimation(); pulse.stopAnimation(); };
  }, []);

  const rotate = rot.interpolate({
    inputRange:  reverse ? [-1, 0] : [0, 1],
    outputRange: reverse
      ? ["-360deg", `${initialOffset}deg`]
      : [`${initialOffset}deg`, `${initialOffset + 360}deg`],
  });

  return (
    <Animated.View
      style={{ position: "absolute", width: radius * 2, height: radius * 2, transform: [{ rotate }] }}
    >
      <Animated.View
        style={{
          position: "absolute",
          top:   -size / 2,
          left:  radius - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: pulse,
          shadowColor: glowColor || color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: size * 1.4,
          elevation: 6,
        }}
      />
    </Animated.View>
  );
}

/* ─────────────────────────────────────────────
   WAVE DOTS
───────────────────────────────────────────── */
function WaveDots({ color }) {
  const vs = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const anims = vs.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(v, { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 350, easing: Easing.in(Easing.cubic),  useNativeDriver: true }),
          Animated.delay(420 - i * 150),
        ])
      )
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, []);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 10 }}>
      {vs.map((v, i) => (
        <Animated.View
          key={i}
          style={{
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: color,
            opacity: v,
            transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }],
          }}
        />
      ))}
    </View>
  );
}

/* ─────────────────────────────────────────────
   PRESETS
───────────────────────────────────────────── */
const PRESETS = {
  full:    { r1: 34, r2: 50, r3: 66, brand: true,  message: true  },
  page:    { r1: 26, r2: 38, r3: 52, brand: false, message: true  },
  compact: { r1: 16, r2: 24, r3: 33, brand: false, message: false },
};

/* ─────────────────────────────────────────────
   CORE LOADER
───────────────────────────────────────────── */
function EliteLoader({ preset, message, isDark }) {
  const t = isDark ? THEME.dark : THEME.light;
  const { r1, r2, r3, brand, message: showMsg } = preset;

  const enterOp   = useRef(new Animated.Value(0)).current;
  const enterScale = useRef(new Animated.Value(0.85)).current;
  const brandOp   = useRef(new Animated.Value(0)).current;
  const msgOp     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(enterOp,    { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(enterScale, { toValue: 1, friction: 7, tension: 55, useNativeDriver: true }),
      ]),
      Animated.timing(brandOp, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(msgOp,   { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const stageSize = (r3 + 12) * 2;

  return (
    <View style={S.root}>

      {/* ── Stage: rings + dots only, no center plate ── */}
      <Animated.View
        style={[
          S.stage,
          { width: stageSize, height: stageSize },
          { opacity: enterOp, transform: [{ scale: enterScale }] },
        ]}
      >
        {/* Track rings */}
        <View style={[S.abs, { width: (r3 + 11) * 2, height: (r3 + 11) * 2, borderRadius: r3 + 11, borderWidth: 1, borderColor: t.track }]} />
        <View style={[S.abs, { width: (r2 + 4) * 2,  height: (r2 + 4) * 2,  borderRadius: r2 + 4,  borderWidth: 1, borderColor: t.track }]} />

        {/* Spinning arcs */}
        <SpinRing size={(r3 + 10) * 2} borderWidth={1.5} colors={t.ring3} duration={9000} reverse />
        <SpinRing size={r2 * 2}        borderWidth={2}   colors={t.ring2} duration={3600} />
        <SpinRing size={r1 * 2}        borderWidth={2.5} colors={t.ring1} duration={1800} />

        {/* Orbital glow dots */}
        <OrbitalDot radius={r3 + 10} color={t.dot3} duration={9000}  initialOffset={55}  size={5} glowColor={t.accentC} reverse />
        <OrbitalDot radius={r3 + 10} color={t.dot3} duration={9000}  initialOffset={235} size={4} glowColor={t.accentC} reverse />
        <OrbitalDot radius={r2}      color={t.dot2} duration={3600}  initialOffset={90}  size={6} glowColor={t.accentB} />
        <OrbitalDot radius={r1}      color={t.dot1} duration={1800}  initialOffset={180} size={5} glowColor={t.accent}  />

        {/* Center pulse dot */}
        <CenterPulse color={t.accent} accentB={t.accentB} />
      </Animated.View>

      {/* ── Brand ── */}
      {brand ? (
        <Animated.View style={{ opacity: brandOp, alignItems: "center", marginTop: 24 }}>
          <Text style={[S.brandWord, { color: t.brand }]}>
            Goo<Text style={[S.brandEm, { color: t.brandEm }]}>voiture</Text>
          </Text>
          <View style={[S.brandBar, { backgroundColor: t.accent }]} />
        </Animated.View>
      ) : null}

      {/* ── Message ── */}
      {showMsg && message ? (
        <Animated.View style={{ opacity: msgOp, alignItems: "center", marginTop: brand ? 16 : 14 }}>
          <Text style={[S.msg, { color: t.msg }]}>{message.replace(/…$|\.{3}$/, "")}</Text>
          <WaveDots color={t.dotC} />
        </Animated.View>
      ) : null}
    </View>
  );
}

/* ─────────────────────────────────────────────
   CENTER PULSE DOT  — tiny glowing point, no fill
───────────────────────────────────────────── */
function CenterPulse({ color, accentB }) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const op    = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.4, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(op,   { toValue: 1,   duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 0.7, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(op,   { toValue: 0.4, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ])
    ).start();
    return () => { scale.stopAnimation(); op.stopAnimation(); };
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: color,
        opacity: op,
        transform: [{ scale }],
        shadowColor: accentB,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 4,
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   PUBLIC EXPORTS  (same API as before)
───────────────────────────────────────────── */
export function AppLogoLoader({ variant = "page", message, style }) {
  const { isDark } = useTheme();
  const { pick }   = useAppLang();
  const preset = PRESETS[variant] ?? PRESETS.page;
  const label  = message ?? (variant !== "compact" ? pick("Loading", "Chargement") : null);
  return (
    <View style={[S.fill, style]}>
      <EliteLoader preset={preset} message={label} isDark={isDark} />
    </View>
  );
}

export function PageLoader({ message }) {
  const { colors: C } = useTheme();
  return (
    <View style={[S.fill, { backgroundColor: C.bg }]}>
      <AppLogoLoader variant="page" message={message} />
    </View>
  );
}

export function InlineLogoLoader({ message }) {
  return (
    <View style={{ paddingVertical: 28, alignItems: "center", justifyContent: "center" }}>
      <AppLogoLoader variant="compact" message={message} />
    </View>
  );
}

export default function AppLoadingScreen({ message }) {
  const { colors: C } = useTheme();
  return (
    <View style={[S.fill, { backgroundColor: C.bg }]}>
      <AppLogoLoader variant="full" message={message} />
    </View>
  );
}

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const S = StyleSheet.create({
  fill:  { flex: 1 },
  root:  { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  abs:   { position: "absolute", alignSelf: "center" },
  stage: { alignItems: "center", justifyContent: "center" },
  brandWord: { fontSize: 24, fontWeight: "800", letterSpacing: -0.5, fontFamily: "System" },
  brandEm:   { fontStyle: "italic", fontWeight: "800" },
  brandBar:  { width: 24, height: 2, borderRadius: 2, marginTop: 6, opacity: 0.55 },
  msg:       { fontSize: 10, fontWeight: "600", letterSpacing: 1.4, textTransform: "uppercase", textAlign: "center" },
});
