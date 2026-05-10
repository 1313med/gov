import { useMemo, useRef } from "react";
import { View, Text, Image, Pressable, Animated, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAppLang } from "../context/AppLangContext";
import { resolveMediaUrl } from "../utils/mediaUrl";
import FavoriteHeartButton from "./FavoriteHeartButton";

export default function RentalCard({ rental, onPress, onFavorite, isFavorite }) {
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const { colors: C, isDark } = useTheme();
  const s = useMemo(() => createRentalCardStyles(C, isDark), [C, isDark]);
  const scale = useRef(new Animated.Value(1)).current;
  const uri = resolveMediaUrl(rental.images?.[0]);
  const imageUrl = uri ? { uri } : null;
  const now = Date.now();
  const activeDealCount = (rental.offers || []).filter((o) => o.isActive && (!o.expiresAt || new Date(o.expiresAt).getTime() > now)).length;
  const ctaGrad = isDark ? ["#38bdf8", "#0ea5e9", "#6366f1"] : ["#0ea5e9", "#0284c7", "#4f46e5"];
  const badgeGrad = isDark ? ["rgba(56,189,248,0.95)", "rgba(99,102,241,0.9)"] : ["#0ea5e9", "#6366f1"];

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
              <Ionicons name="car-sport-outline" size={48} color={C.muted} />
            </View>
          )}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.06)", "rgba(0,0,0,0.75)"]}
            locations={[0, 0.4, 1]}
            style={s.imgScrim}
          />
          {activeDealCount > 0 && (
            <View style={s.dealBadge}>
              <Ionicons name="pricetag" size={12} color="#fef08a" />
              <Text style={s.dealBadgeText}>
                {activeDealCount > 1 ? (fr ? `${activeDealCount} offres` : `${activeDealCount} deals`) : fr ? "Promo" : "Deal"}
              </Text>
            </View>
          )}
          {onFavorite && <FavoriteHeartButton active={isFavorite} onPress={onFavorite} size="md" variant="overlay" style={s.fav} />}
          <LinearGradient colors={badgeGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.priceBadge}>
            <Text style={s.priceBadgeText}>
              {rental.pricePerDay} MAD<Text style={s.priceBadgeSub}>/{fr ? "j" : "d"}</Text>
            </Text>
          </LinearGradient>
        </View>
        <View style={s.body}>
          <Text style={s.title} numberOfLines={1}>
            {rental.title || `${rental.brand} ${rental.model}`}
          </Text>
          <View style={s.row}>
            <Ionicons name="location-outline" size={14} color={C.accent} />
            <Text style={s.sub}>{rental.city || "—"}</Text>
            {rental.gearbox ? (
              <>
                <Text style={s.dot}>·</Text>
                <Text style={s.sub} numberOfLines={1}>
                  {rental.gearbox}
                </Text>
              </>
            ) : null}
          </View>
          <View style={s.bottom}>
            <View>
              <Text style={s.priceLabel}>{fr ? "À partir de" : "From"}</Text>
              <Text style={s.price}>
                {rental.pricePerDay} MAD<Text style={s.perDay}> {fr ? "/ jour" : "/ day"}</Text>
              </Text>
            </View>
            <LinearGradient colors={ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.ctaGrad}>
              <Text style={s.ctaText}>{fr ? "Réserver" : "Book"}</Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </LinearGradient>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

function createRentalCardStyles(C, isDark) {
  return StyleSheet.create({
    card: {
      backgroundColor: C.card,
      borderRadius: 22,
      marginBottom: 18,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark ? "rgba(56,189,248,0.24)" : "rgba(2,132,199,0.18)",
      shadowColor: C.accent,
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: isDark ? 0.2 : 0.1,
      shadowRadius: 20,
      elevation: 8,
    },
    imgWrap: { position: "relative", width: "100%" },
    img: { width: "100%", height: 200 },
    imgScrim: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
    noImg: { backgroundColor: isDark ? "#0f1123" : "#e2e8f0", alignItems: "center", justifyContent: "center" },
    fav: { position: "absolute", top: 12, right: 12, zIndex: 4 },
    dealBadge: {
      position: "absolute",
      top: 14,
      left: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: "rgba(251,191,36,0.22)",
      borderWidth: 1,
      borderColor: "rgba(251,191,36,0.45)",
      borderRadius: 999,
      paddingHorizontal: 11,
      paddingVertical: 6,
    },
    dealBadgeText: { color: "#fde68a", fontSize: 11, fontWeight: "800", letterSpacing: 0.2 },
    priceBadge: {
      position: "absolute",
      bottom: 12,
      left: 12,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    priceBadgeText: { color: "#fff", fontSize: 13, fontWeight: "900", letterSpacing: -0.2 },
    priceBadgeSub: { fontSize: 11, fontWeight: "700", opacity: 0.9 },
    body: { padding: 18, paddingTop: 16 },
    title: { color: C.white, fontWeight: "800", fontSize: 17, marginBottom: 6, letterSpacing: -0.3 },
    row: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
    sub: { color: C.muted, fontSize: 13, fontWeight: "600", marginLeft: 5 },
    dot: { color: C.muted, marginHorizontal: 6 },
    bottom: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 16 },
    priceLabel: { color: C.muted, fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
    price: { color: C.accent, fontWeight: "900", fontSize: 19, letterSpacing: -0.4 },
    perDay: { color: C.muted, fontSize: 13, fontWeight: "600" },
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
