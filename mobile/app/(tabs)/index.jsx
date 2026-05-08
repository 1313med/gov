import { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { useTheme } from "../../src/context/ThemeContext";
import { useSocket } from "../../src/context/SocketContext";

export default function HomeScreen() {
  const { auth } = useAuth();
  const { unreadNotifications } = useSocket();
  const { lang } = useAppLang();
  const { colors: C } = useTheme();
  const router = useRouter();
  const fr = lang === "fr";
  const s = useMemo(() => createHomeStyles(C), [C]);
  const features = useMemo(
    () => [
      { icon: "shield-checkmark-outline", color: C.primary, en: ["Verified Listings", "Every listing is reviewed before going live."], fr: ["Annonces vérifiées", "Chaque annonce est vérifiée avant publication."] },
      { icon: "flash-outline", color: C.accent, en: ["Instant Booking", "Book a rental in seconds."], fr: ["Réservation instantanée", "Réservez en quelques secondes."] },
      { icon: "people-outline", color: "#a78bfa", en: ["Trusted Sellers", "Verified profiles with ratings."], fr: ["Vendeurs de confiance", "Profils vérifiés avec notes."] },
      { icon: "lock-closed-outline", color: C.green, en: ["Secure Platform", "Your data is fully protected."], fr: ["Plateforme sécurisée", "Vos données sont protégées."] },
    ],
    [C],
  );

  return (
    <ScrollView style={{ flex:1, backgroundColor: C.bg }} showsVerticalScrollIndicator={false}>
      <View style={s.hero}>
        <View style={s.heroTop}>
          <View style={s.logoRow}>
            <View style={s.logoBox}><Ionicons name="car-sport" size={20} color="#fff" /></View>
            <Text style={s.logoText}>Goovoiture</Text>
          </View>
          <View style={s.topActions}>
            <TouchableOpacity onPress={() => router.push("/notifications")} style={s.notificationBtn}>
              <Ionicons name="notifications-outline" size={20} color={C.white} />
              {unreadNotifications > 0 && (
                <View style={s.notificationBadge}>
                  <Text style={s.notificationBadgeText}>{unreadNotifications > 99 ? "99+" : unreadNotifications}</Text>
                </View>
              )}
            </TouchableOpacity>
            {auth && <View style={s.roleBadge}><Text style={s.roleText}>{auth.role?.replace("_"," ")}</Text></View>}
          </View>
        </View>
        <Text style={s.heroTitle}>
          {fr ? "Votre\n" : "Your\n"}
          <Text style={{ color: C.primary }}>{fr ? "marketplace auto" : "car marketplace"}</Text>
          {fr ? "\nau Maroc." : "\nin Morocco."}
        </Text>
        <Text style={s.heroSub}>{fr ? "Achetez, vendez et louez des voitures en toute confiance." : "Buy, sell and rent cars with confidence. Thousands of verified listings."}</Text>
        <View style={s.ctaRow}>
          <TouchableOpacity onPress={() => router.push("/(tabs)/cars")} style={s.ctaPrimary}>
            <Ionicons name="car" size={16} color="#fff" />
            <Text style={s.ctaPrimaryText}>{fr ? "Acheter" : "Buy a Car"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(tabs)/rentals")} style={s.ctaSecondary}>
            <Ionicons name="car-sport" size={16} color={C.accent} />
            <Text style={s.ctaSecondaryText}>{fr ? "Louer" : "Rent a Car"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.statsRow}>
        {[["2,400+", fr?"Annonces":"Listings"], ["4.9★", fr?"Note":"Rating"], ["98%", fr?"Satisfaction":"Satisfaction"]].map(([v,l]) => (
          <View key={l} style={s.statCard}>
            <Text style={s.statValue}>{v}</Text>
            <Text style={s.statLabel}>{l}</Text>
          </View>
        ))}
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>{fr ? "Pourquoi Goovoiture ?" : "Why Goovoiture?"}</Text>
        <View style={s.featuresGrid}>
          {features.map((f) => (
            <View key={f.en[0]} style={s.featureCard}>
              <View style={[s.featureIcon, { backgroundColor: f.color + "20" }]}>
                <Ionicons name={f.icon} size={20} color={f.color} />
              </View>
              <Text style={s.featureTitle}>{fr ? f.fr[0] : f.en[0]}</Text>
              <Text style={s.featureDesc}>{fr ? f.fr[1] : f.en[1]}</Text>
            </View>
          ))}
        </View>
      </View>

      {auth && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>{fr ? "Accès rapide" : "Quick Actions"}</Text>
          {auth.role === "customer" && <NavItem s={s} C={C} icon="calendar-outline" label={fr?"Mes réservations":"My Bookings"} onPress={() => router.push("/my-bookings")} />}
          {auth.role === "seller" && <>
            <NavItem s={s} C={C} icon="list-outline"        label={fr?"Mes annonces":"My Sales"}    onPress={() => router.push("/my-sales")} />
            <NavItem s={s} C={C} icon="add-circle-outline"  label={fr?"Nouvelle annonce":"New Listing"} onPress={() => router.push("/new-sale")} color={C.accent} />
          </>}
          {auth.role === "rental_owner" && <>
            <NavItem s={s} C={C} icon="analytics-outline"  label={fr?"Statistiques":"Analytics"}   onPress={() => router.push("/owner-analytics")} color={C.accent} />
            <NavItem s={s} C={C} icon="car-outline"         label={fr?"Mon parc":"My Fleet"}        onPress={() => router.push("/my-fleet")} />
            <NavItem s={s} C={C} icon="clipboard-outline"   label={fr?"Réservations":"Bookings"}    onPress={() => router.push("/owner-bookings")} />
            <NavItem s={s} C={C} icon="add-circle-outline"  label={fr?"Ajouter location":"Add Rental"} onPress={() => router.push("/add-rental")} color={C.accent} />
          </>}
          {auth.role === "admin" && (
            <NavItem s={s} C={C} icon="shield-checkmark-outline" label={fr?"Modération":"Moderation"} onPress={() => router.push("/admin-moderation")} color={C.accent} />
          )}
        </View>
      )}

      {!auth && (
        <View style={{ padding: 24, paddingBottom: 40 }}>
          <View style={s.joinCard}>
            <Ionicons name="person-add-outline" size={36} color={C.primary} />
            <Text style={s.joinTitle}>{fr ? "Rejoindre Goovoiture" : "Join Goovoiture"}</Text>
            <Text style={s.joinSub}>{fr ? "Créez un compte gratuit pour accéder à toutes les fonctionnalités." : "Create a free account to access all features."}</Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")} style={s.joinBtn}>
              <Text style={s.joinBtnText}>{fr ? "S'inscrire" : "Get Started"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function NavItem({ icon, label, onPress, color, s, C }) {
  const c = color ?? C.primary;
  return (
    <TouchableOpacity onPress={onPress} style={s.navItem}>
      <View style={[s.navIcon, { backgroundColor: c + "20" }]}><Ionicons name={icon} size={18} color={c} /></View>
      <Text style={s.navLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={C.muted} />
    </TouchableOpacity>
  );
}

function createHomeStyles(C) {
  return StyleSheet.create({
    hero: { paddingTop: 56, paddingBottom: 40, paddingHorizontal: 24, backgroundColor: C.surface, borderBottomWidth:1, borderBottomColor: C.border },
    heroTop: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom: 24 },
    topActions: { flexDirection: "row", alignItems: "center", gap: 8 },
    logoRow: { flexDirection:"row", alignItems:"center" },
    logoBox: { width:36, height:36, backgroundColor: C.primary, borderRadius:10, alignItems:"center", justifyContent:"center", marginRight:8 },
    logoText: { color: C.white, fontWeight:"700", fontSize:20 },
    notificationBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.card,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    notificationBadge: {
      position: "absolute",
      top: -4,
      right: -6,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: "#ef4444",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
      borderWidth: 1,
      borderColor: C.surface,
    },
    notificationBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
    roleBadge: { backgroundColor: C.pillBg, borderWidth:1, borderColor: C.pillBorder, borderRadius:20, paddingHorizontal:10, paddingVertical:4 },
    roleText: { color: C.primary, fontSize:11, textTransform:"capitalize" },
    heroTitle: { color: C.white, fontSize:34, fontWeight:"700", lineHeight:42 },
    heroSub: { color: C.muted, fontSize:13, marginTop:12, lineHeight:20 },
    ctaRow: { flexDirection:"row", gap:12, marginTop:24 },
    ctaPrimary: { flex:1, backgroundColor: C.primary, borderRadius:12, paddingVertical:12, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:8 },
    ctaPrimaryText: { color:"#fff", fontWeight:"700" },
    ctaSecondary: { flex:1, backgroundColor:"rgba(56,189,248,0.1)", borderWidth:1, borderColor:"rgba(56,189,248,0.4)", borderRadius:12, paddingVertical:12, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:8 },
    ctaSecondaryText: { color: C.accent, fontWeight:"700" },
    statsRow: { flexDirection:"row", padding:24, gap:12 },
    statCard: { flex:1, backgroundColor: C.card, borderWidth:1, borderColor: C.border, borderRadius:16, paddingVertical:16, alignItems:"center" },
    statValue: { color: C.primary, fontWeight:"700", fontSize:20 },
    statLabel: { color: C.muted, fontSize:11, marginTop:4 },
    section: { paddingHorizontal:24, paddingBottom:24 },
    sectionTitle: { color: C.white, fontWeight:"700", fontSize:20, marginBottom:16 },
    featuresGrid: { flexDirection:"row", flexWrap:"wrap", gap:12 },
    featureCard: { backgroundColor: C.card, borderWidth:1, borderColor: C.border, borderRadius:16, padding:16, width:"47%" },
    featureIcon: { width:40, height:40, borderRadius:12, alignItems:"center", justifyContent:"center", marginBottom:12 },
    featureTitle: { color: C.white, fontWeight:"700", fontSize:13, marginBottom:4 },
    featureDesc: { color: C.muted, fontSize:11, lineHeight:16 },
    navItem: { backgroundColor: C.card, borderWidth:1, borderColor: C.border, borderRadius:12, flexDirection:"row", alignItems:"center", paddingHorizontal:16, paddingVertical:14, marginBottom:8 },
    navIcon: { width:32, height:32, borderRadius:8, alignItems:"center", justifyContent:"center", marginRight:12 },
    navLabel: { color: C.white, fontWeight:"500", flex:1 },
    joinCard: { backgroundColor: C.pillBg, borderWidth:1, borderColor: C.pillBorder, borderRadius:20, padding:24, alignItems:"center" },
    joinTitle: { color: C.white, fontWeight:"700", fontSize:18, marginTop:12, marginBottom:6 },
    joinSub: { color: C.muted, fontSize:13, textAlign:"center", marginBottom:16 },
    joinBtn: { backgroundColor: C.primary, borderRadius:12, paddingHorizontal:24, paddingVertical:12 },
    joinBtnText: { color:"#fff", fontWeight:"700" },
  });
}
