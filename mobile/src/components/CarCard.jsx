import { useMemo, useRef } from "react";
import { View, Text, Image, Pressable, Animated, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { resolveMediaUrl } from "../utils/mediaUrl";
import FavoriteHeartButton from "./FavoriteHeartButton";

export default function CarCard({ car, onPress, onFavorite, isFavorite }) {
  const { colors: C, isDark } = useTheme();
  const s = useMemo(() => createCarCardStyles(C, isDark), [C, isDark]);
  const scale = useRef(new Animated.Value(1)).current;
  const uri = resolveMediaUrl(car.images?.[0]);
  const imageUrl = uri ? { uri } : null;
  const ctaGrad = isDark ? ["#7c6bff", "#5b4ddb", "#4338ca"] : ["#6248e8", "#4f46e5", "#4338ca"];
  const mileage =
    car.mileage != null && car.mileage !== ""
      ? `${Number(car.mileage).toLocaleString()} km`
      : null;

  const pressIn = () => Animated.spring(scale, { toValue: 0.98, friction: 6, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();

  return (
    <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut}>
      <Animated.View style={[s.card, { transform: [{ scale }] }]}>
        <View style={s.imgWrap}>
          {imageUrl ? (
            <Image source={imageUrl} style={s.img} resizeMode="cover" />
          ) : (
            <View style={[s.img, s.noImg]}>
              <Ionicons name="car-outline" size={48} color={C.muted} />
            </View>
          )}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.05)", "rgba(0,0,0,0.72)"]}
            locations={[0, 0.45, 1]}
            style={s.imgScrim}
          />
          {onFavorite && <FavoriteHeartButton active={isFavorite} onPress={onFavorite} size="md" variant="overlay" style={s.fav} />}
          {car.status === "sold" && (
            <View style={s.soldBadge}>
              <Text style={s.soldText}>SOLD</Text>
            </View>
          )}
          <View style={s.imgTagRow}>
            {car.year ? (
              <View style={s.imgTag}>
                <Ionicons name="calendar-outline" size={12} color="#fff" style={{ opacity: 0.95 }} />
                <Text style={s.imgTagText}>{car.year}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={s.body}>
          <Text style={s.title} numberOfLines={1}>
            {car.title || `${car.brand} ${car.model}`}
          </Text>
          <View style={s.row}>
            <Ionicons name="location-outline" size={14} color={C.accent} />
            <Text style={s.sub}>{car.city || "—"}</Text>
          </View>
          {(mileage || car.fuel) && (
            <View style={s.metaRow}>
              {mileage ? (
                <View style={s.metaChip}>
                  <Ionicons name="speedometer-outline" size={12} color={C.muted} />
                  <Text style={s.metaText}>{mileage}</Text>
                </View>
              ) : null}
              {car.fuel ? (
                <View style={s.metaChip}>
                  <Ionicons name="flame-outline" size={12} color={C.muted} />
                  <Text style={s.metaText} numberOfLines={1}>
                    {car.fuel}
                  </Text>
                </View>
              ) : null}
            </View>
          )}
          <View style={s.bottom}>
            <Text style={s.price}>{car.price ? `${Number(car.price).toLocaleString()} MAD` : "—"}</Text>
            <LinearGradient colors={ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.ctaGrad}>
              <Text style={s.ctaText}>View</Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </LinearGradient>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

function createCarCardStyles(C, isDark) {
  return StyleSheet.create({
    card: {
      backgroundColor: C.card,
      borderRadius: 22,
      marginBottom: 18,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark ? "rgba(124,107,255,0.22)" : "rgba(98,72,232,0.16)",
      shadowColor: C.primary,
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: isDark ? 0.22 : 0.12,
      shadowRadius: 20,
      elevation: 8,
    },
    imgWrap: { position: "relative", width: "100%" },
    img: { width: "100%", height: 200 },
    imgScrim: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
    noImg: { backgroundColor: isDark ? "#0f1123" : "#e2e8f0", alignItems: "center", justifyContent: "center" },
    fav: { position: "absolute", top: 12, right: 12, zIndex: 3 },
    soldBadge: {
      position: "absolute",
      top: 14,
      left: 14,
      backgroundColor: "#dc2626",
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    soldText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.6 },
    imgTagRow: { position: "absolute", bottom: 12, left: 12, right: 12, flexDirection: "row", gap: 8 },
    imgTag: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: "rgba(0,0,0,0.45)",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.15)",
    },
    imgTagText: { color: "#fff", fontSize: 11, fontWeight: "700" },
    body: { padding: 18, paddingTop: 16 },
    title: { color: C.white, fontWeight: "800", fontSize: 17, marginBottom: 6, letterSpacing: -0.3 },
    row: { flexDirection: "row", alignItems: "center", gap: 5 },
    sub: { color: C.muted, fontSize: 13, fontWeight: "600", flex: 1 },
    metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
    metaChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.06)",
      maxWidth: "48%",
    },
    metaText: { color: C.muted, fontSize: 11, fontWeight: "600", flexShrink: 1 },
    bottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16 },
    price: { color: C.primary, fontWeight: "900", fontSize: 19, letterSpacing: -0.4 },
    ctaGrad: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
    },
    ctaText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  });
}
