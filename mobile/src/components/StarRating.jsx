import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function StarRating({ rating, onRate, size = 20 }) {
  return (
    <View style={s.row}>
      {[1,2,3,4,5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onRate && onRate(star)} activeOpacity={onRate ? 0.7 : 1}>
          <Ionicons
            name={rating >= star ? "star" : "star-outline"}
            size={size}
            color={rating >= star ? "#f59e0b" : "#4b5563"}
            style={{ marginRight: 2 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row" },
});
