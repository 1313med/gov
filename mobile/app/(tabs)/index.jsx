import { useMemo, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Pressable,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { useTheme } from "../../src/context/ThemeContext";
import { useSocket } from "../../src/context/SocketContext";
import QuickActionCard from "../../src/components/QuickActionCard";
import { useOwnerBookingAttentionCount } from "../../src/hooks/useOwnerBookingAttentionCount";

const { width: SCREEN_W } = Dimensions.get("window");

function useStaggeredEntrance(count, startDelay = 120) {
  const anims = useRef(
    Array.from({ length: count }, () => ({
      opacity: new Animated.Value(0),
      translate: new Animated.Value(28),
    })),
  ).current;

  const run = useCallback(() => {
    anims.forEach((a) => {
      a.opacity.setValue(0);
      a.translate.setValue(28);
    });
    Animated.stagger(
      72,
      anims.map((a) =>
        Animated.parallel([
          Animated.timing(a.opacity, {
            toValue: 1,
            duration: 520,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(a.translate, {
            toValue: 0,
            friction: 7,
            tension: 42,
            useNativeDriver: true,
          }),
        ]),
      ),
    ).start();
  }, [anims]);

  useEffect(() => {
    const t = setTimeout(run, startDelay);
    return () => clearTimeout(t);
  }, [run, startDelay]);

  return anims;
}

function GlowOrb({ style, colors, scaleAnim }) {
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          borderRadius: 999,
          opacity: 0.55,
        },
        style,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

function ShimmerLine({ color }) {
  const x = useRef(new Animated.Value(-1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(x, {
          toValue: 1,
          duration: 2800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(x, { toValue: -1, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [x]);
  const translateX = x.interpolate({
    inputRange: [-1, 1],
    outputRange: [-SCREEN_W * 0.6, SCREEN_W * 0.6],
  });
  return (
    <View style={{ height: 2, borderRadius: 1, overflow: "hidden", marginTop: 14, marginBottom: 4, backgroundColor: "rgba(255,255,255,0.08)" }}>
      <Animated.View
        style={{
          width: "40%",
          height: "100%",
          backgroundColor: color,
          opacity: 0.9,
          borderRadius: 1,
          transform: [{ translateX }],
        }}
      />
    </View>
  );
}

function PrimaryCta({ onPress, children, colors, style }) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.96, friction: 6, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  return (
    <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut}>
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={ctaStyles.primaryInner}>
          {children}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const ctaStyles = StyleSheet.create({
  primaryInner: {
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    minHeight: 52,
    shadowColor: "#7c6bff",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
});

function StatCard({ value, label, delayAnim, accent, isDark }) {
  return (
    <Animated.View
      style={[
        {
          flex: 1,
          opacity: delayAnim.opacity,
          transform: [{ translateY: delayAnim.translate }],
        },
      ]}
    >
      <LinearGradient
        colors={
          isDark
            ? ["rgba(255,255,255,0.07)", "rgba(255,255,255,0.02)"]
            : ["rgba(255,255,255,0.95)", "rgba(248,250,252,0.88)"]
        }
        style={[
          statCardStyles.card,
          {
            borderColor: isDark ? "rgba(124,107,255,0.28)" : "rgba(98,72,232,0.18)",
          },
        ]}
      >
        <View style={[statCardStyles.accentDot, { backgroundColor: accent }]} />
        <Text style={[statCardStyles.value, { color: accent }]}>{value}</Text>
        <Text style={[statCardStyles.label, { color: isDark ? "#94a3b8" : "#64748b" }]}>{label}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

const statCardStyles = StyleSheet.create({
  card: {
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
  accentDot: { width: 6, height: 6, borderRadius: 3, marginBottom: 10, opacity: 0.9 },
  value: { fontWeight: "800", fontSize: 19, letterSpacing: -0.5 },
  label: { fontSize: 10, fontWeight: "700", marginTop: 4, letterSpacing: 0.6, textTransform: "uppercase" },
});

/** Compact 2×2 “Why us” tile — low vertical footprint, layered finish. */
function FeatureEliteCompact({ icon, color, title, desc, anim, isDark }) {
  const curve = Platform.OS === "ios" ? { borderCurve: "continuous" } : {};
  const rim = isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.9)";
  const spec = isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.88)";
  const titleCol = isDark ? "#f1f5f9" : "#0f172a";
  const descCol = isDark ? "#94a3b8" : "#64748b";

  return (
    <Animated.View
      style={{
        width: "48.2%",
        opacity: anim.opacity,
        transform: [{ translateY: anim.translate }],
      }}
    >
      <View
        style={[
          {
            marginBottom: 10,
            borderRadius: 18,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: isDark ? 0.4 : 0.1,
            shadowRadius: 12,
            elevation: 6,
          },
          curve,
        ]}
      >
        <LinearGradient
          colors={isDark ? ["#14162a", "#0a0c14"] : ["#ffffff", "#eef2f6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            {
              borderRadius: 18,
              borderWidth: 1,
              borderColor: isDark ? "rgba(255,255,255,0.09)" : "rgba(15,23,42,0.06)",
              paddingVertical: 11,
              paddingHorizontal: 11,
              overflow: "hidden",
              minHeight: 88,
            },
            curve,
          ]}
        >
          <LinearGradient
            colors={[`${color}16`, "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <LinearGradient
            colors={[spec, "transparent"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, opacity: 0.85 }}
            pointerEvents="none"
          />
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 9 }}>
            <View style={{ width: 3, marginTop: 3, borderRadius: 2, backgroundColor: color, opacity: 0.95, minHeight: 36 }} />
            <LinearGradient
              colors={[`${color}40`, `${color}10`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[{ width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center" }, curve]}
            >
              <View
                style={[
                  {
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    borderWidth: 1,
                    borderColor: rim,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isDark ? "rgba(0,0,0,0.22)" : "rgba(255,255,255,0.55)",
                  },
                  curve,
                ]}
              >
                <Ionicons name={icon} size={16} color={color} />
              </View>
            </LinearGradient>
            <View style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
              <Text style={{ color: titleCol, fontSize: 12, fontWeight: "800", letterSpacing: -0.2, lineHeight: 15 }} numberOfLines={2}>
                {title}
              </Text>
              <Text style={{ color: descCol, fontSize: 10, lineHeight: 13, marginTop: 4, fontWeight: "600" }} numberOfLines={2}>
                {desc}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const { auth } = useAuth();
  const bookingAttentionCount = useOwnerBookingAttentionCount();
  const { unreadNotifications } = useSocket();
  const { lang } = useAppLang();
  const { colors: C, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fr = lang === "fr";

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(36)).current;
  const orbPulse = useRef(new Animated.Value(1)).current;

  const statAnims = useStaggeredEntrance(3, 280);
  const featureAnims = useStaggeredEntrance(4, 260);
  const quickFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(heroSlide, {
        toValue: 0,
        friction: 8,
        tension: 38,
        useNativeDriver: true,
      }),
    ]).start();
  }, [heroOpacity, heroSlide]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, {
          toValue: 1.12,
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(orbPulse, {
          toValue: 1,
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [orbPulse]);

  useEffect(() => {
    if (!auth) {
      quickFade.setValue(0);
      return;
    }
    quickFade.setValue(0);
    Animated.timing(quickFade, {
      toValue: 1,
      delay: 320,
      duration: 560,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [auth, quickFade]);

  const scrollY = useRef(new Animated.Value(0)).current;

  const features = useMemo(
    () => [
      { icon: "shield-checkmark-outline", color: C.primary, en: ["Verified Listings", "Every listing is reviewed before going live."], fr: ["Annonces vérifiées", "Chaque annonce est vérifiée avant publication."], large: true },
      { icon: "flash-outline", color: C.accent, en: ["Instant Booking", "Book a rental in seconds."], fr: ["Réservation instantanée", "Réservez en quelques secondes."], large: false },
      { icon: "people-outline", color: "#a78bfa", en: ["Trusted Sellers", "Verified profiles with ratings."], fr: ["Vendeurs de confiance", "Profils vérifiés avec notes."], large: false },
      { icon: "lock-closed-outline", color: C.green, en: ["Secure Platform", "Your data is fully protected."], fr: ["Plateforme sécurisée", "Vos données sont protégées."], large: false },
    ],
    [C],
  );

  const heroGradient = isDark
    ? ["#03040a", "#120a24", "#0a1628", "#05060f"]
    : ["#faf5ff", "#e0f2fe", "#f0f9ff", "#f8fafc"];

  const orbA = isDark
    ? ["rgba(124,107,255,0.55)", "rgba(124,107,255,0)"]
    : ["rgba(98,72,232,0.35)", "rgba(98,72,232,0)"];
  const orbB = isDark
    ? ["rgba(56,189,248,0.35)", "rgba(56,189,248,0)"]
    : ["rgba(14,165,233,0.28)", "rgba(14,165,233,0)"];

  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#94a3b8" : "#475569";
  const glassBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.08)";

  const ctaPrimaryGrad = isDark ? ["#7c6bff", "#5b4ddb", "#4338ca"] : ["#6248e8", "#4f46e5", "#4338ca"];
  const ctaRentGrad = isDark
    ? ["rgba(56,189,248,0.25)", "rgba(56,189,248,0.08)"]
    : ["rgba(14,165,233,0.2)", "rgba(14,165,233,0.06)"];

  const s = useMemo(() => createHomeStyles(C, isDark), [C, isDark]);

  const heroParallax = scrollY.interpolate({
    inputRange: [0, 180],
    outputRange: [0, -32],
    extrapolate: "clamp",
  });

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        <Animated.View style={{ transform: [{ translateY: heroParallax }] }}>
          <LinearGradient colors={heroGradient} locations={[0, 0.35, 0.7, 1]} style={[s.hero, { paddingTop: insets.top + 12 }]}>
            <GlowOrb
              scaleAnim={orbPulse}
              colors={orbA}
              style={{ width: 280, height: 280, top: -80, right: -90 }}
            />
            <GlowOrb
              scaleAnim={orbPulse}
              colors={orbB}
              style={{ width: 220, height: 220, bottom: 40, left: -100 }}
            />

            <Animated.View style={{ opacity: heroOpacity, transform: [{ translateY: heroSlide }] }}>
              <View style={s.heroTop}>
                <View style={s.logoRow}>
                  <LinearGradient colors={ctaPrimaryGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.logoBox}>
                    <Ionicons name="car-sport" size={20} color="#fff" />
                  </LinearGradient>
                  <View>
                    <Text style={[s.logoText, { color: titleColor }]}>
                      Goo<Text style={s.logoItalic}>voiture</Text>
                    </Text>
                    <Text style={[s.logoTagline, { color: subColor }]}>
                      {fr ? "Mobilité premium au Maroc" : "Premium mobility in Morocco"}
                    </Text>
                  </View>
                </View>
                <View style={s.topActions}>
                  <TouchableOpacity
                    onPress={() => router.push("/notifications")}
                    activeOpacity={0.85}
                    style={[s.notificationBtn, { borderColor: glassBorder, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)" }]}
                  >
                    <Ionicons name="notifications-outline" size={20} color={titleColor} />
                    {unreadNotifications > 0 && (
                      <View style={s.notificationBadge}>
                        <Text style={s.notificationBadgeText}>{unreadNotifications > 99 ? "99+" : unreadNotifications}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  {auth && (
                    <LinearGradient
                      colors={isDark ? ["rgba(124,107,255,0.2)", "rgba(124,107,255,0.08)"] : ["rgba(98,72,232,0.15)", "rgba(98,72,232,0.05)"]}
                      style={s.roleBadge}
                    >
                      <Text style={[s.roleText, { color: C.primary }]}>{auth.role?.replace("_", " ")}</Text>
                    </LinearGradient>
                  )}
                </View>
              </View>

              <Text style={[s.heroKicker, { color: C.primary }]}>{fr ? "L'excellence routière" : "The road, elevated"}</Text>
              <Text style={[s.heroTitle, { color: titleColor }]}>
                {fr ? "Votre marketplace" : "Your marketplace"}
                {"\n"}
                <Text style={{ color: C.primary, fontStyle: "italic", fontWeight: "800" }}>{fr ? "automobile" : "automotive"}</Text>
                {fr ? " de confiance." : " you trust."}
              </Text>
              <ShimmerLine color={C.primary} />
              <Text style={[s.heroSub, { color: subColor }]}>
                {fr
                  ? "Achetez, vendez et louez des voitures vérifiées — une expérience fluide, sécurisée, inoubliable."
                  : "Buy, sell and rent verified cars — a fluid, secure experience that feels unforgettable."}
              </Text>

              <View style={s.ctaRow}>
                <PrimaryCta
                  onPress={() => router.push("/(tabs)/cars")}
                  colors={ctaPrimaryGrad}
                  style={{ flex: 1 }}
                >
                  <Ionicons name="car" size={18} color="#fff" />
                  <Text style={s.ctaPrimaryText}>{fr ? "Acheter" : "Buy a Car"}</Text>
                </PrimaryCta>
                <Pressable
                  onPress={() => router.push("/(tabs)/rentals")}
                  style={{ flex: 1 }}
                >
                  <LinearGradient
                    colors={ctaRentGrad}
                    style={[s.ctaSecondary, { borderColor: isDark ? "rgba(56,189,248,0.45)" : "rgba(14,165,233,0.4)" }]}
                  >
                    <Ionicons name="car-sport" size={18} color={C.accent} />
                    <Text style={[s.ctaSecondaryText, { color: C.accent }]}>{fr ? "Louer" : "Rent a Car"}</Text>
                  </LinearGradient>
                </Pressable>
              </View>

              <View style={s.quickPills}>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/favorites")}
                  activeOpacity={0.85}
                  style={[s.pill, { borderColor: glassBorder, backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.65)" }]}
                >
                  <Ionicons name="heart" size={14} color="#f472b6" />
                  <Text style={[s.pillText, { color: titleColor }]}>{fr ? "Favoris" : "Saved"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/messages")}
                  activeOpacity={0.85}
                  style={[s.pill, { borderColor: glassBorder, backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.65)" }]}
                >
                  <Ionicons name="chatbubbles-outline" size={14} color={C.accent} />
                  <Text style={[s.pillText, { color: titleColor }]}>{fr ? "Messages" : "Messages"}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        <View style={s.statsRow}>
          {[
            ["2,400+", fr ? "Annonces" : "Listings", C.primary],
            ["4.9★", fr ? "Note" : "Rating", "#fbbf24"],
            ["98%", fr ? "Satisfaction" : "Happy", C.green],
          ].map(([v, l, accent], i) => (
            <StatCard key={l} value={v} label={l} delayAnim={statAnims[i]} accent={accent} isDark={isDark} />
          ))}
        </View>

        <View style={s.sectionWhy}>
          <Text style={[s.sectionEyebrow, { color: C.primary, marginBottom: 5 }]}>{fr ? "Pourquoi nous choisir" : "Why us"}</Text>
          <Text style={[s.sectionTitleTight, { color: titleColor }]}>{fr ? "L'art du mouvement" : "The art of motion"}</Text>
          <Text style={[s.sectionSubTight, { color: subColor }]}>
            {fr
              ? "Chaque détail compte — de la vérification à la signature."
              : "Every detail matters — from verification to the handoff."}
          </Text>

          <View style={s.bento}>
            <View style={s.bentoRow}>
              {features.slice(0, 2).map((f, j) => (
                <FeatureEliteCompact
                  key={f.en[0]}
                  icon={f.icon}
                  color={f.color}
                  title={fr ? f.fr[0] : f.en[0]}
                  desc={fr ? f.fr[1] : f.en[1]}
                  anim={featureAnims[j]}
                  isDark={isDark}
                />
              ))}
            </View>
            <View style={s.bentoRow}>
              {features.slice(2, 4).map((f, j) => (
                <FeatureEliteCompact
                  key={f.en[0]}
                  icon={f.icon}
                  color={f.color}
                  title={fr ? f.fr[0] : f.en[0]}
                  desc={fr ? f.fr[1] : f.en[1]}
                  anim={featureAnims[j + 2]}
                  isDark={isDark}
                />
              ))}
            </View>
          </View>
        </View>

        {auth && (
          <View style={s.section}>
            <Text style={[s.sectionEyebrow, { color: C.accent }]}>{fr ? "Espace pro" : "Your workspace"}</Text>
            <Text style={[s.sectionTitle, { color: titleColor }]}>{fr ? "Accès rapide" : "Quick actions"}</Text>
            <Animated.View style={[s.quickActionsStack, { opacity: quickFade }]}>
              {auth.role === "customer" && (
                <QuickActionCard
                  C={C}
                  isDark={isDark}
                  icon="calendar-outline"
                  label={fr ? "Mes réservations" : "My Bookings"}
                  onPress={() => router.push("/my-bookings")}
                />
              )}
              {auth.role === "seller" && (
                <>
                  <QuickActionCard C={C} isDark={isDark} icon="list-outline" label={fr ? "Mes annonces" : "My Sales"} onPress={() => router.push("/my-sales")} />
                  <QuickActionCard
                    C={C}
                    isDark={isDark}
                    icon="add-circle-outline"
                    label={fr ? "Nouvelle annonce" : "New Listing"}
                    onPress={() => router.push("/new-sale")}
                    color={C.accent}
                  />
                </>
              )}
              {auth.role === "rental_owner" && (
                <>
                  <QuickActionCard C={C} isDark={isDark} icon="analytics-outline" label={fr ? "Statistiques" : "Analytics"} onPress={() => router.push("/owner-analytics")} color={C.accent} />
                  <QuickActionCard
                    C={C}
                    isDark={isDark}
                    icon="calendar-outline"
                    label={fr ? "Calendrier" : "Calendar"}
                    onPress={() => router.push("/owner-booking-calendar")}
                  />
                  <QuickActionCard
                    C={C}
                    isDark={isDark}
                    icon="clipboard-outline"
                    label={fr ? "Réservations" : "Bookings"}
                    onPress={() => router.push("/owner-bookings")}
                    attentionCount={bookingAttentionCount}
                  />
                  <QuickActionCard C={C} isDark={isDark} icon="car-outline" label={fr ? "Mon parc" : "My Fleet"} onPress={() => router.push("/my-fleet")} />
                  <QuickActionCard
                    C={C}
                    isDark={isDark}
                    icon="pulse-outline"
                    label={fr ? "Visibilité des annonces" : "Listing views"}
                    onPress={() => router.push("/owner-listing-views")}
                  />
                  <QuickActionCard C={C} isDark={isDark} icon="construct-outline" label={fr ? "Maintenance" : "Maintenance"} onPress={() => router.push("/maintenance")} />
                  <QuickActionCard
                    C={C}
                    isDark={isDark}
                    icon="add-circle-outline"
                    label={fr ? "Ajouter location" : "Add Rental"}
                    onPress={() => router.push("/add-rental")}
                    color={C.accent}
                  />
                </>
              )}
              {auth.role === "admin" && (
                <QuickActionCard
                  C={C}
                  isDark={isDark}
                  icon="shield-checkmark-outline"
                  label={fr ? "Modération" : "Moderation"}
                  onPress={() => router.push("/admin-moderation")}
                  color={C.accent}
                />
              )}
            </Animated.View>
          </View>
        )}

        {!auth && (
          <View style={{ paddingHorizontal: 24, paddingBottom: 8 }}>
            <LinearGradient
              colors={isDark ? ["rgba(124,107,255,0.18)", "rgba(56,189,248,0.08)"] : ["rgba(98,72,232,0.12)", "rgba(14,165,233,0.06)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[s.joinCard, { borderColor: isDark ? "rgba(124,107,255,0.35)" : "rgba(98,72,232,0.25)" }]}
            >
              <View style={s.joinIconRing}>
                <Ionicons name="person-add-outline" size={32} color={C.primary} />
              </View>
              <Text style={[s.joinTitle, { color: titleColor }]}>{fr ? "Rejoindre Goovoiture" : "Join Goovoiture"}</Text>
              <Text style={[s.joinSub, { color: subColor }]}>
                {fr ? "Créez un compte gratuit — débloquez l'intégralité de l'expérience." : "Create a free account — unlock the full experience."}
              </Text>
              <PrimaryCta onPress={() => router.push("/(auth)/register")} colors={ctaPrimaryGrad} style={{ alignSelf: "stretch", width: "100%" }}>
                <Text style={s.joinBtnText}>{fr ? "Commencer" : "Get Started"}</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </PrimaryCta>
            </LinearGradient>
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
}

function createHomeStyles(C, isDark) {
  return StyleSheet.create({
    hero: {
      paddingBottom: 36,
      paddingHorizontal: 22,
      overflow: "hidden",
    },
    heroTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 },
    topActions: { flexDirection: "row", alignItems: "center", gap: 10 },
    logoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    logoBox: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#7c6bff",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 10,
    },
    logoText: { fontWeight: "800", fontSize: 22, letterSpacing: -0.8 },
    logoItalic: { fontStyle: "italic", color: C.primary, fontWeight: "800" },
    logoTagline: { fontSize: 11, fontWeight: "600", marginTop: 2, letterSpacing: 0.2 },
    notificationBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    notificationBadge: {
      position: "absolute",
      top: 2,
      right: 2,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: "#ef4444",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
      borderWidth: 2,
      borderColor: isDark ? "#0f1123" : "#fff",
    },
    notificationBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
    roleBadge: {
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: isDark ? "rgba(124,107,255,0.35)" : "rgba(98,72,232,0.25)",
    },
    roleText: { fontSize: 11, textTransform: "capitalize", fontWeight: "700" },
    heroKicker: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 2.2,
      textTransform: "uppercase",
      marginBottom: 10,
    },
    heroTitle: { fontSize: 32, fontWeight: "800", lineHeight: 40, letterSpacing: -1 },
    heroSub: { fontSize: 15, marginTop: 14, lineHeight: 24, fontWeight: "500" },
    ctaRow: { flexDirection: "row", gap: 12, marginTop: 26 },
    ctaPrimaryText: { color: "#fff", fontWeight: "800", fontSize: 15, letterSpacing: 0.2 },
    ctaSecondary: {
      borderRadius: 16,
      paddingVertical: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      borderWidth: 1.5,
    },
    ctaSecondaryText: { fontWeight: "800", fontSize: 15 },
    quickPills: { flexDirection: "row", gap: 10, marginTop: 16 },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 1,
    },
    pillText: { fontSize: 13, fontWeight: "700" },
    statsRow: { flexDirection: "row", paddingHorizontal: 22, gap: 10, marginTop: 4 },
    section: { paddingHorizontal: 22, paddingTop: 32, paddingBottom: 8 },
    sectionWhy: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 4 },
    sectionTitleTight: { fontWeight: "800", fontSize: 22, letterSpacing: -0.55, marginBottom: 4 },
    sectionSubTight: { fontSize: 13, lineHeight: 19, marginBottom: 12, fontWeight: "500" },
    sectionEyebrow: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1.8,
      textTransform: "uppercase",
      marginBottom: 8,
    },
    sectionTitle: { fontWeight: "800", fontSize: 26, letterSpacing: -0.6, marginBottom: 8 },
    sectionSub: { fontSize: 14, lineHeight: 22, marginBottom: 22, fontWeight: "500" },
    bento: { gap: 8 },
    bentoRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
    quickActionsStack: { marginTop: 6, gap: 0 },
    joinCard: {
      borderRadius: 24,
      padding: 28,
      alignItems: "center",
      borderWidth: 1,
      marginTop: 8,
    },
    joinIconRing: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: isDark ? "rgba(124,107,255,0.4)" : "rgba(98,72,232,0.35)",
      marginBottom: 16,
      backgroundColor: isDark ? "rgba(124,107,255,0.08)" : "rgba(98,72,232,0.06)",
    },
    joinTitle: { fontWeight: "800", fontSize: 22, marginBottom: 8, letterSpacing: -0.3 },
    joinSub: { fontSize: 14, textAlign: "center", marginBottom: 22, lineHeight: 22, paddingHorizontal: 8 },
    joinBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  });
}
