import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

/** Sun ↔ Moon — toggles light/dark app palette */
export default function ThemeToggle({ style }) {
  const { isDark, toggleTheme, colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={() => toggleTheme()}
      style={[{ padding: 8, borderRadius: 20 }, style]}
      accessibilityRole="button"
      accessibilityLabel={isDark ? "Switch to light mode" : "Switch to dark mode"}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={22} color={colors.primary} />
    </TouchableOpacity>
  );
}
