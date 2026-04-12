import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../theme";
import { SERVER_URL } from "../config";

export default function RentalCard({ rental, onPress, onFavorite, isFavorite }) {
  const imageUrl = rental.images?.[0] ? { uri: `${SERVER_URL}/uploads/${rental.images[0]}` } : null;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={s.card}>
      <View>
        {imageUrl
          ? <Image source={imageUrl} style={s.img} resizeMode="cover" />
          : <View style={[s.img, s.noImg]}><Ionicons name="car-sport-outline" size={48} color="#4b5563" /></View>
        }
        {onFavorite && (
          <TouchableOpacity onPress={onFavorite} style={s.fav}>
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? C.red : C.white} />
          </TouchableOpacity>
        )}
        <View style={s.priceBadge}>
          <Text style={s.priceText}>{rental.pricePerDay} MAD/day</Text>
        </View>
      </View>
      <View style={s.body}>
        <Text style={s.title} numberOfLines={1}>{rental.title || `${rental.brand} ${rental.model}`}</Text>
        <View style={s.row}>
          <Ionicons name="location-outline" size={13} color={C.muted} />
          <Text style={s.sub}>{rental.city || "Unknown"}</Text>
          {rental.gearbox && <><Text style={s.dot}>·</Text><Text style={s.sub}>{rental.gearbox}</Text></>}
        </View>
        <View style={s.bottom}>
          <Text style={s.price}>{rental.pricePerDay} MAD<Text style={s.perDay}> / day</Text></Text>
          <View style={s.viewBtn}><Text style={s.viewText}>Book →</Text></View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: C.card, borderRadius: 16, marginBottom: 16, overflow: "hidden", borderWidth: 1, borderColor: C.border },
  img: { width: "100%", height: 176 },
  noImg: { backgroundColor: C.surface, alignItems: "center", justifyContent: "center" },
  fav: { position: "absolute", top: 12, right: 12, backgroundColor: "rgba(5,6,15,0.7)", borderRadius: 20, padding: 6 },
  priceBadge: { position: "absolute", bottom: 12, left: 12, backgroundColor: "rgba(124,107,255,0.9)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  priceText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  body: { padding: 16 },
  title: { color: C.white, fontWeight: "700", fontSize: 16, marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center" },
  sub: { color: C.muted, fontSize: 12, marginLeft: 4 },
  dot: { color: C.muted, marginHorizontal: 6 },
  bottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  price: { color: C.accent, fontWeight: "700", fontSize: 18 },
  perDay: { color: C.muted, fontSize: 13, fontWeight: "400" },
  viewBtn: { backgroundColor: C.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: C.border },
  viewText: { color: C.accent, fontSize: 12, fontWeight: "600" },
});
