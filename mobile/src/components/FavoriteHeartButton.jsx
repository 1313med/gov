import { useRef, useEffect } from "react";
import { Pressable, Animated, View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { alpha } from "../theme";

const PRESETS = {
  sm: { outer: 40, icon: 18 },
  md: { outer: 46, icon: 20 },
  lg: { outer: 52, icon: 23 },
};

/**
 * Favorites control aligned with app chrome: primary CTA gradient when saved,
 * favScrim + hairline border when not (same language as listing overlays).
 */
export default function FavoriteHeartButton({ active, onPress, size = "md", variant = "overlay", style, hitSlop = 10 }) {
  const { colors: C, isDark } = useTheme();
  const d = PRESETS[size] || PRESETS.md;
  const pressScale = useRef(new Animated.Value(1)).current;
  const heartPop = useRef(new Animated.Value(1)).current;

  const ctaGrad = isDark ? ["#7c6bff", "#5b4ddb", "#4338ca"] : ["#6248e8", "#4f46e5", "#4338ca"];

  useEffect(() => {
    if (active) {
      heartPop.setValue(0.88);
      Animated.spring(heartPop, { toValue: 1, friction: 6, tension: 200, useNativeDriver: true }).start();
    } else {
      heartPop.setValue(1);
    }
  }, [active, heartPop]);

  const pressIn = () => Animated.spring(pressScale, { toValue: 0.94, friction: 6, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(pressScale, { toValue: 1, friction: 5, useNativeDriver: true }).start();

  const inactiveBorder =
    variant === "overlay"
      ? "rgba(255,255,255,0.22)"
      : isDark
        ? alpha(C.primary, 0.35)
        : alpha(C.primary, 0.25);

  const inactiveBg =
    variant === "overlay" ? C.favScrim : isDark ? C.card : "rgba(255,255,255,0.96)";

  const inactiveIcon = variant === "overlay" ? "#f8fafc" : C.primary;

  const circleStyle = {
    width: d.outer,
    height: d.outer,
    borderRadius: d.outer / 2,
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <Animated.View style={[{ transform: [{ scale: pressScale }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        hitSlop={hitSlop}
        accessibilityRole="button"
        accessibilityLabel={active ? "Remove from favorites" : "Add to favorites"}
      >
        {active ? (
          <LinearGradient
            colors={ctaGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              circleStyle,
              {
                shadowColor: C.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: isDark ? 0.38 : 0.28,
                shadowRadius: 14,
                elevation: 10,
              },
            ]}
          >
            <Animated.View style={{ transform: [{ scale: heartPop }] }}>
              <Ionicons name="heart" size={d.icon} color="#ffffff" />
            </Animated.View>
          </LinearGradient>
        ) : (
          <View
            style={[
              circleStyle,
              {
                backgroundColor: inactiveBg,
                borderWidth: 1,
                borderColor: inactiveBorder,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 4,
              },
            ]}
          >
            <Ionicons name="heart-outline" size={d.icon} color={inactiveIcon} style={{ opacity: variant === "overlay" ? 0.95 : 0.9 }} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}
