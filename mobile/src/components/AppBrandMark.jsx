import { View, Image, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

const BRAND_ICON_DARK = require("../../assets/images/goovoiture-brand-icon.png");
const BRAND_ICON_LIGHT = require("../../assets/images/goovoiture-brand-icon-light.png");

/**
 * Goovoiture app mark — centered PNG exports per theme.
 */
export default function AppBrandMark({
  size = 52,
  radius,
  halo = false,
  style,
  accessibilityLabel = "Goovoiture",
}) {
  const { isDark } = useTheme();
  const r = radius ?? Math.max(12, Math.round(size * (16 / 52)));
  const source = isDark ? BRAND_ICON_DARK : BRAND_ICON_LIGHT;
  const clipBg = isDark ? "#9876f8" : "#6350e9";

  const haloStyle = halo
    ? {
        shadowColor: isDark ? "#7c6bff" : "#6350e9",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDark ? 0.4 : 0.28,
        shadowRadius: 16,
        elevation: 8,
      }
    : null;

  return (
    <View style={[haloStyle, style]}>
      <View
        style={[
          styles.clip,
          {
            width: size,
            height: size,
            borderRadius: r,
            backgroundColor: clipBg,
          },
        ]}
      >
        <Image
          source={source}
          style={{ width: size, height: size }}
          resizeMode="cover"
          accessibilityLabel={accessibilityLabel}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
});
