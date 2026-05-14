import { View, Image, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

const SRC = require("../../assets/images/brand-footer.png");

/** Small GOV wordmark — transparent PNG, unobtrusive footer placement. */
export default function BrandFooterLogo({ style }) {
  const { isDark } = useTheme();
  return (
    <View pointerEvents="none" style={[styles.wrap, style]}>
      <Image
        source={SRC}
        style={[styles.img, { opacity: isDark ? 0.9 : 0.82 }]}
        resizeMode="contain"
        accessibilityLabel="GOV"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  img: { height: 52, width: 152 },
});
