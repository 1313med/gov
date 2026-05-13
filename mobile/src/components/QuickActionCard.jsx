import { useMemo, useRef, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Animated, Platform, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

function createStyles(isDark) {
  return StyleSheet.create({
    wrap: { marginBottom: 12, position: "relative" },
    wrapFeatured: { marginBottom: 18 },
    wrapElevated: { marginBottom: 14 },
    outer: {
      borderRadius: 22,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: isDark ? 0.55 : 0.14,
      shadowRadius: isDark ? 24 : 16,
      elevation: isDark ? 14 : 8,
    },
    outerElevated: {
      borderRadius: 24,
      shadowOffset: { width: 0, height: 14 },
      shadowRadius: isDark ? 26 : 18,
      elevation: isDark ? 16 : 9,
    },
    outerFeatured: {
      borderRadius: 26,
      shadowOffset: { width: 0, height: 18 },
      shadowRadius: isDark ? 32 : 22,
      elevation: isDark ? 18 : 11,
    },
    surface: {
      borderRadius: 22,
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 12,
      paddingRight: 12,
      paddingVertical: 14,
      minHeight: 76,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.75)",
      overflow: "hidden",
    },
    surfaceAlert: {
      borderColor: "rgba(124,107,255,0.42)",
    },
    sheen: {
      position: "absolute",
      top: 0,
      left: "18%",
      right: "18%",
      height: 1,
      opacity: isDark ? 0.85 : 0.9,
    },
    spine: {
      width: 3,
      alignSelf: "stretch",
      marginVertical: 10,
      marginRight: 12,
      borderRadius: 2,
      opacity: 0.95,
    },
    iconPlate: {
      width: 50,
      height: 50,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },
    iconRim: {
      width: 46,
      height: 46,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    copy: { flex: 1, minWidth: 0, justifyContent: "center", paddingRight: 8 },
    label: { fontSize: 16, fontWeight: "800", letterSpacing: -0.35 },
    featuredSub: { fontSize: 11, fontWeight: "700", letterSpacing: 0.2, marginTop: 3 },
    rule: { height: 2, borderRadius: 2, marginTop: 8, alignSelf: "flex-start", width: 36, opacity: 0.9 },
    ctrl: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    badge: {
      position: "absolute",
      top: -4,
      right: 8,
      minWidth: 26,
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: 999,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: "rgba(8,10,18,0.95)",
      zIndex: 4,
      alignItems: "center",
      justifyContent: "center",
    },
    badgeText: { color: "#fff", fontWeight: "900", fontSize: 11, letterSpacing: -0.2 },
    featuredSparkle: {
      position: "absolute",
      top: -6,
      left: 14,
      zIndex: 5,
    },
  });
}

/**
 * Quick-action row — optional `featured` (hero) or `elevated` (second-tier) styling.
 */
export default function QuickActionCard({
  icon,
  label,
  onPress,
  C,
  isDark,
  color,
  labelColor,
  attentionCount = 0,
  attentionWeight = "primary",
  featured = false,
  featuredSubtitle,
  featuredKicker = "INSIGHTS",
  elevated = false,
  elevatedSubtitle,
  elevatedKicker = "PRIORITY",
}) {
  const accent = color ?? C.primary;
  const textColor = labelColor ?? C.white;
  const s = useMemo(() => createStyles(isDark), [isDark]);
  const scale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const borderGlow = useRef(new Animated.Value(0.72)).current;
  const rim = isDark ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.92)";
  const specular = isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.95)";
  const curve = Platform.OS === "ios" ? { borderCurve: "continuous" } : {};
  const hasAttention = attentionCount > 0;
  const isSoft = attentionWeight === "soft" && hasAttention;
  const badgeLabel = attentionCount > 99 ? "99+" : `+${attentionCount}`;
  const subMutedFeatured = isDark ? "rgba(186,230,253,0.72)" : "rgba(2,132,199,0.85)";
  const subMutedElevated = isDark ? "rgba(196,181,253,0.82)" : "rgba(91,77,219,0.88)";

  const tier = featured ? "featured" : elevated ? "elevated" : "default";

  const br = tier === "featured" ? 24 : tier === "elevated" ? 22 : 22;
  const plateW = tier === "featured" ? 56 : tier === "elevated" ? 52 : 50;
  const rimW = tier === "featured" ? 52 : tier === "elevated" ? 48 : 46;
  const iconSz = tier === "featured" ? 25 : tier === "elevated" ? 23 : 22;
  const ctrlW = tier === "featured" ? 44 : tier === "elevated" ? 42 : 40;
  const chevSz = tier === "featured" ? 20 : tier === "elevated" ? 19 : 18;
  const labFs = tier === "featured" ? 17 : tier === "elevated" ? 16 : 16;
  const ruleW = tier === "featured" ? 52 : tier === "elevated" ? 44 : 36;
  const spineW = tier === "featured" ? 4 : tier === "elevated" ? 4 : 3;
  const spineMv = tier === "featured" ? 12 : tier === "elevated" ? 11 : 10;
  const minH = tier === "featured" ? 88 : tier === "elevated" ? 82 : 76;
  const padV = tier === "featured" ? 16 : tier === "elevated" ? 15 : 14;
  const padH = tier === "featured" ? 14 : tier === "elevated" ? 13 : 12;
  const plateRadius = tier === "featured" ? 18 : tier === "elevated" ? 17 : 16;
  const rimRadius = tier === "featured" ? 15 : tier === "elevated" ? 14.5 : 14;
  const plateMr = tier === "featured" ? 16 : tier === "elevated" ? 15 : 14;
  const ringPad = tier === "featured" ? 2.5 : tier === "elevated" ? 1.5 : 0;
  const ringOuterR = tier === "featured" ? 26 : tier === "elevated" ? 24 : 0;

  useEffect(() => {
    if (!hasAttention) {
      pulse.setValue(1);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: isSoft ? 1.004 : 1.012,
          duration: isSoft ? 3400 : 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: isSoft ? 3400 : 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [hasAttention, isSoft, pulse]);

  useEffect(() => {
    if (tier === "default") {
      borderGlow.setValue(1);
      return undefined;
    }
    if (tier === "featured") {
      borderGlow.setValue(0.68);
    } else {
      borderGlow.setValue(0.5);
    }
    const hi = tier === "featured" ? 1 : 0.78;
    const lo = tier === "featured" ? 0.62 : 0.42;
    const dur = tier === "featured" ? 3200 : 4200;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(borderGlow, {
          toValue: hi,
          duration: dur,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(borderGlow, {
          toValue: lo,
          duration: dur,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [tier, borderGlow]);

  const surfaceColors =
    tier === "featured"
      ? isDark
        ? ["#152a3d", "#0c1528", "#080b14"]
        : ["#f0f9ff", "#e0f2fe", "#f8fafc"]
      : tier === "elevated"
        ? isDark
          ? ["#181528", "#101228", "#080a12"]
          : ["#faf8ff", "#f3f0ff", "#f8fafc"]
        : isDark
          ? ["#17192f", "#0b0d18", "#080a12"]
          : ["#ffffff", "#f1f5f9", "#e8edf3"];
  const surfaceLocations = tier === "featured" ? [0, 0.5, 1] : isDark ? [0, 0.55, 1] : [0, 0.45, 1];

  const innerClipBg =
    tier === "featured" ? (isDark ? "#06080f" : "#eff6ff") : tier === "elevated" ? (isDark ? "#0a0c18" : "#faf8ff") : undefined;

  const innerClipRadius = tier === "featured" ? 24 : tier === "elevated" ? 22 : br;

  const ringGradientColors =
    tier === "featured"
      ? [accent, isDark ? "#6366f1" : "#38bdf8", accent]
      : [C.primary, isDark ? "#4c3fb8" : "#818cf8", C.primary];

  const cardBody = (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <LinearGradient
        colors={surfaceColors}
        locations={surfaceLocations}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          s.surface,
          curve,
          {
            borderRadius: br,
            minHeight: minH,
            paddingVertical: padV,
            paddingLeft: padH,
            paddingRight: padH,
            borderWidth: tier !== "default" ? 0 : 1,
            borderColor:
              tier !== "default"
                ? "transparent"
                : isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(255,255,255,0.75)",
          },
          tier === "default" && hasAttention && (isSoft ? { borderColor: "rgba(124,107,255,0.22)" } : s.surfaceAlert),
        ]}
      >
        {hasAttention ? (
          <LinearGradient
            colors={
              isSoft
                ? [`${accent}0e`, `${accent}05`, "transparent"]
                : [`${accent}22`, `${accent}08`, "transparent"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1.1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        ) : null}
        {tier === "featured" ? (
          <LinearGradient
            colors={[`${accent}18`, "transparent", `${accent}0a`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        ) : null}
        {tier === "elevated" ? (
          <LinearGradient
            colors={["rgba(124,107,255,0.14)", "transparent", "rgba(99,102,241,0.06)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        ) : null}
        <LinearGradient
          colors={[`${accent}24`, `${accent}06`, "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1.1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <LinearGradient
          colors={[specular, "transparent"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={s.sheen}
          pointerEvents="none"
        />
        <View
          style={[
            s.spine,
            {
              width: spineW,
              marginVertical: spineMv,
              backgroundColor: accent,
              opacity: tier !== "default" ? 1 : 0.95,
            },
          ]}
        />
        <LinearGradient
          colors={
            hasAttention
              ? isSoft
                ? [`${accent}38`, `${accent}14`]
                : [`${accent}70`, `${accent}28`]
              : tier === "featured"
                ? [`${accent}55`, `${accent}1a`]
                : tier === "elevated"
                  ? [`${C.primary}50`, `${C.primary}18`]
                  : [`${accent}45`, `${accent}12`]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            s.iconPlate,
            curve,
            {
              width: plateW,
              height: plateW,
              borderRadius: plateRadius,
              marginRight: plateMr,
            },
          ]}
        >
          <View
            style={[
              s.iconRim,
              {
                width: rimW,
                height: rimW,
                borderRadius: rimRadius,
                borderColor: rim,
                backgroundColor: isDark ? "rgba(6,8,18,0.55)" : "rgba(255,255,255,0.55)",
              },
            ]}
          >
            <Ionicons
              name={icon}
              size={iconSz}
              color={hasAttention ? (isSoft ? accent : "#fff") : accent}
            />
          </View>
        </LinearGradient>
        <View style={s.copy}>
          {tier === "featured" && featuredKicker ? (
            <Text
              style={{
                fontSize: 9,
                fontWeight: "900",
                letterSpacing: 2,
                color: subMutedFeatured,
                marginBottom: 2,
              }}
              numberOfLines={1}
            >
              {featuredKicker}
            </Text>
          ) : null}
          {tier === "elevated" && elevatedKicker ? (
            <Text
              style={{
                fontSize: 9,
                fontWeight: "900",
                letterSpacing: 1.6,
                color: subMutedElevated,
                marginBottom: 2,
              }}
              numberOfLines={1}
            >
              {elevatedKicker}
            </Text>
          ) : null}
          <Text
            style={[
              s.label,
              {
                color: textColor,
                fontSize: labFs,
                letterSpacing: tier === "featured" ? -0.4 : -0.35,
              },
            ]}
            numberOfLines={2}
          >
            {label}
          </Text>
          {tier === "featured" && featuredSubtitle ? (
            <Text style={[s.featuredSub, { color: subMutedFeatured }]} numberOfLines={1}>
              {featuredSubtitle}
            </Text>
          ) : null}
          {tier === "elevated" && elevatedSubtitle ? (
            <Text style={[s.featuredSub, { color: subMutedElevated }]} numberOfLines={1}>
              {elevatedSubtitle}
            </Text>
          ) : null}
          <View
            style={[
              s.rule,
              {
                width: ruleW,
                marginTop: tier === "featured" ? 10 : tier === "elevated" ? 9 : 8,
                backgroundColor: hasAttention
                  ? isSoft
                    ? `${accent}44`
                    : `${accent}88`
                  : tier === "featured"
                    ? `${accent}99`
                    : tier === "elevated"
                      ? `${C.primary}80`
                      : `${accent}55`,
              },
            ]}
          />
        </View>
        <LinearGradient
          colors={
            isDark
              ? ["rgba(255,255,255,0.14)", "rgba(255,255,255,0.04)"]
              : ["rgba(255,255,255,0.95)", "rgba(248,250,252,0.65)"]
          }
          style={[
            s.ctrl,
            {
              width: ctrlW,
              height: ctrlW,
              borderRadius: tier === "featured" ? 16 : tier === "elevated" ? 15 : 14,
              borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.08)",
            },
            curve,
          ]}
        >
          <Ionicons name="chevron-forward" size={chevSz} color={accent} />
        </LinearGradient>
      </LinearGradient>
    </Animated.View>
  );

  const innerClip = {
    borderRadius: innerClipRadius,
    overflow: "hidden",
    backgroundColor: innerClipBg,
  };

  const showRing = tier === "featured" || tier === "elevated";

  const outerStyle =
    tier === "featured" ? s.outerFeatured : tier === "elevated" ? s.outerElevated : s.outer;

  const shadowColor =
    tier === "featured" ? accent : tier === "elevated" ? C.primary : hasAttention ? accent : isDark ? "#000" : accent;

  const shadowOpacity =
    tier === "featured"
      ? isDark
        ? 0.42
        : 0.2
      : tier === "elevated"
        ? isDark
          ? 0.34
          : 0.16
        : hasAttention
          ? isSoft
            ? isDark
              ? 0.28
              : 0.12
            : isDark
              ? 0.55
              : 0.22
          : isDark
            ? 0.55
            : 0.14;

  const pressInScale = tier === "featured" ? 0.982 : tier === "elevated" ? 0.984 : 0.985;

  return (
    <View style={[s.wrap, featured && s.wrapFeatured, elevated && !featured && s.wrapElevated]}>
      {featured ? (
        <View style={s.featuredSparkle} pointerEvents="none">
          <Ionicons name="sparkles" size={18} color={accent} style={{ opacity: isDark ? 0.85 : 0.75 }} />
        </View>
      ) : null}
      {hasAttention ? (
        <LinearGradient
          colors={isSoft ? [`${accent}55`, `${accent}30`] : [accent, "#6366f1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.badge, isSoft && { minWidth: 22, paddingHorizontal: 6, paddingVertical: 3, borderWidth: 1.5 }]}
          pointerEvents="none"
        >
          <Text style={[s.badgeText, isSoft && { fontSize: 9, opacity: 0.92 }]}>{badgeLabel}</Text>
        </LinearGradient>
      ) : null}
      <Pressable
        onPress={onPress}
        onPressIn={() =>
          Animated.spring(scale, { toValue: pressInScale, friction: 6, useNativeDriver: true }).start()
        }
        onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start()}
      >
        <Animated.View
          style={[
            outerStyle,
            {
              transform: [{ scale }],
              shadowColor,
              shadowOpacity,
            },
          ]}
        >
          {showRing ? (
            <Animated.View style={{ opacity: borderGlow }}>
              <LinearGradient
                colors={ringGradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: ringOuterR, padding: ringPad }}
              >
                <View style={innerClip}>{cardBody}</View>
              </LinearGradient>
            </Animated.View>
          ) : (
            cardBody
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
}
