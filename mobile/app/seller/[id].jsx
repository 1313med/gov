import { useState, useEffect, useMemo } from "react";
import { PageLoader } from '../../src/components/AppLoadingScreen';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getSellerProfile } from "../../src/api/user";
import { startConversation } from "../../src/api/message";
import CarCard from "../../src/components/CarCard";
import ReviewSection from "../../src/components/ReviewSection";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { resolveMediaUrl } from "../../src/utils/mediaUrl";
import { useTheme } from "../../src/context/ThemeContext";

export default function SellerProfileScreen() {
  const { id } = useLocalSearchParams();
  const { auth } = useAuth();
  const { lang } = useAppLang();
  const { colors: C } = useTheme();
  const s = useMemo(() => createSellerProfileStyles(C), [C]);
  const router = useRouter();
  const fr = lang === "fr";

  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    getSellerProfile(id)
      .then(({ data }) => setPayload(data))
      .catch(() => Alert.alert("Error", "Failed to load seller"))
      .finally(() => setLoading(false));
  }, [id]);

  const contactSeller = async () => {
    if (!auth) return router.push("/(auth)/login");
    setContacting(true);
    try {
      await startConversation({ recipientId: id });
      router.push("/(customer)/messages");
    } catch { Alert.alert("Failed to start conversation"); }
    setContacting(false);
  };

  if (loading) return <PageLoader />;
  const profile = payload?.seller;
  if (!payload || !profile) return <View style={s.center}><Text style={s.white}>Seller not found</Text></View>;

  const listings = payload.listings || [];
  const soldCount = listings.filter((l) => l.status === "sold").length;
  const avatarUri = resolveMediaUrl(profile.avatar);

  return (
    <ScrollView style={{ flex:1, backgroundColor: C.bg }} showsVerticalScrollIndicator={false}>
      <View style={s.hero}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={s.avatarImg} />
        ) : (
          <View style={s.avatar}>
            <Text style={s.avatarText}>{profile.name?.[0]?.toUpperCase() || "?"}</Text>
          </View>
        )}
        <Text style={s.name}>{profile.name}</Text>
        <View style={s.verifiedRow}>
          <Ionicons name="shield-checkmark" size={14} color={C.green} />
          <Text style={s.verifiedText}>{fr ? "Vendeur vérifié" : "Verified Seller"}</Text>
        </View>
        {profile.city && (
          <View style={s.cityRow}>
            <Ionicons name="location-outline" size={14} color={C.muted} />
            <Text style={s.cityText}>{profile.city}</Text>
          </View>
        )}
        {profile.bio ? <Text style={s.bio}>{profile.bio}</Text> : null}

        <View style={s.statsRow}>
          {[
            { value: listings.length, label: fr ? "Annonces" : "Listings" },
            { value: soldCount, label: fr ? "Vendues" : "Sold" },
          ].map((stat) => (
            <View key={stat.label} style={s.statBox}>
              <Text style={s.statVal}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={contactSeller} disabled={contacting} style={[s.contactBtn, contacting && { opacity:0.7 }]}>
          <Ionicons name="chatbubble-outline" size={16} color="#fff" />
          <Text style={s.contactBtnText}>{contacting ? "Opening…" : fr ? "Contacter" : "Contact"}</Text>
        </TouchableOpacity>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>{fr ? "Annonces actives" : "Active Listings"}</Text>
        {listings.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="car-outline" size={48} color="#4b5563" />
            <Text style={s.emptyText}>{fr ? "Aucune annonce" : "No listings yet"}</Text>
          </View>
        ) : (
          listings.map((car) => (
            <CarCard key={car._id} car={car} onPress={() => router.push(`/cars/${car._id}`)} />
          ))
        )}
      </View>

      <View style={s.section}>
        <ReviewSection targetModel="User" targetId={id} />
      </View>
    </ScrollView>
  );
}

function createSellerProfileStyles(C) {
  return StyleSheet.create({
    center: { flex:1, backgroundColor: C.bg, alignItems:"center", justifyContent:"center" },
    white: { color: C.white },
    hero: { backgroundColor: C.surface, borderBottomWidth:1, borderBottomColor: C.border, paddingHorizontal:16, paddingTop:24, paddingBottom:32, alignItems:"center" },
    avatar: { width:96, height:96, borderRadius:48, backgroundColor: C.pillBg, borderWidth:2, borderColor: C.primary, alignItems:"center", justifyContent:"center", marginBottom:12 },
    avatarImg: { width:96, height:96, borderRadius:48, marginBottom:12, borderWidth:2, borderColor: C.primary },
    avatarText: { color: C.primary, fontWeight:"700", fontSize:32 },
    name: { color: C.white, fontWeight:"700", fontSize:20, marginBottom:6 },
    verifiedRow: { flexDirection:"row", alignItems:"center", marginBottom:6 },
    verifiedText: { color: C.green, fontSize:13, marginLeft:4 },
    cityRow: { flexDirection:"row", alignItems:"center", marginBottom:4 },
    cityText: { color: C.muted, fontSize:13, marginLeft:4 },
    bio: { color: C.slate, fontSize:13, textAlign:"center", marginTop:8, lineHeight:20, paddingHorizontal:16 },
    statsRow: { flexDirection:"row", gap:16, marginTop:20 },
    statBox: { backgroundColor: C.card, borderWidth:1, borderColor: C.border, borderRadius:16, paddingHorizontal:32, paddingVertical:12, alignItems:"center" },
    statVal: { color: C.primary, fontWeight:"700", fontSize:20 },
    statLabel: { color: C.muted, fontSize:11, marginTop:2 },
    contactBtn: { marginTop:20, backgroundColor: C.primary, borderRadius:12, paddingHorizontal:32, paddingVertical:12, flexDirection:"row", alignItems:"center" },
    contactBtnText: { color:"#fff", fontWeight:"700", marginLeft:8 },
    section: { padding:16 },
    sectionTitle: { color: C.white, fontWeight:"700", fontSize:17, marginBottom:16 },
    empty: { alignItems:"center", paddingVertical:40 },
    emptyText: { color: C.muted, fontSize:13, marginTop:12 },
  });
}
