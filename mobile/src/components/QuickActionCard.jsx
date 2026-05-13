import { useMemo, useRef, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Animated, Platform, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

function createStyles(isDark) {
  return StyleSheet.create({
    wrap: { marginBottom: 12, position: "relative" },
    outer: {
      borderRadius: 22,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: isDark ? 0.55 : 0.14,
      shadowRadius: isDark ? 24 : 16,
      elevation: isDark ? 14 : 8,
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
  });
}

/**
 * Elite quick-action row (home + profile shortcuts).
 * @param {{ icon: string, label: string, onPress: () => void, C: object, isDark: boolean, color?: string, labelColor?: string, attentionCount?: number }} props
 */
export default function QuickActionCard({ icon, label, onPress, C, isDark, color, labelColor, attentionCount = 0 }) {
  const accent = color ?? C.primary;
  const textColor = labelColor ?? C.white;
  const s = useMemo(() => createStyles(isDark), [isDark]);
  const scale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const rim = isDark ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.92)";
  const specular = isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.95)";
  const curve = Platform.OS === "ios" ? { borderCurve: "continuous" } : {};
  const hasAttention = attentionCount > 0;
  const badgeLabel = attentionCount > 99 ? "99+" : `+${attentionCount}`;

  useEffect(() => {
    if (!hasAttention) {
      pulse.setValue(1);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.012,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [hasAttention, pulse]);

  return (
    <View style={s.wrap}>
      {hasAttention ? (
        <LinearGradient
          colors={[accent, "#6366f1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.badge}
          pointerEvents="none"
        >
          <Text style={s.badgeText}>{badgeLabel}</Text>
        </LinearGradient>
      ) : null}
      <Pressable
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.985, friction: 6, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start()}
      >
        <Animated.View
          style={[
            s.outer,
            {
              transform: [{ scale }],
              shadowColor: hasAttention ? accent : isDark ? "#000" : accent,
              shadowOpacity: hasAttention ? (isDark ? 0.55 : 0.22) : isDark ? 0.55 : 0.14,
            },
          ]}
        >
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <LinearGradient
            colors={isDark ? ["#17192f", "#0b0d18", "#080a12"] : ["#ffffff", "#f1f5f9", "#e8edf3"]}
            locations={isDark ? [0, 0.55, 1] : [0, 0.45, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[s.surface, curve, hasAttention && s.surfaceAlert]}
          >
            {hasAttention ? (
              <LinearGradient
                colors={[`${accent}22`, `${accent}08`, "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1.1, y: 1 }}
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
            <View style={[s.spine, { backgroundColor: accent }]} />
            <LinearGradient
              colors={hasAttention ? [`${accent}70`, `${accent}28`] : [`${accent}45`, `${accent}12`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[s.iconPlate, curve]}
            >
              <View style={[s.iconRim, { borderColor: rim, backgroundColor: isDark ? "rgba(6,8,18,0.55)" : "rgba(255,255,255,0.55)" }]}>
                <Ionicons name={icon} size={22} color={hasAttention ? "#fff" : accent} />
              </View>
            </LinearGradient>
            <View style={s.copy}>
              <Text style={[s.label, { color: textColor }]} numberOfLines={2}>
                {label}
              </Text>
              <View style={[s.rule, { backgroundColor: hasAttention ? `${accent}88` : `${accent}55` }]} />
            </View>
            <LinearGradient
              colors={
                isDark
                  ? ["rgba(255,255,255,0.12)", "rgba(255,255,255,0.03)"]
                  : ["rgba(255,255,255,0.95)", "rgba(248,250,252,0.65)"]
              }
              style={[s.ctrl, { borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)" }, curve]}
            >
              <Ionicons name="chevron-forward" size={18} color={accent} />
            </LinearGradient>
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </View>
  );
}
