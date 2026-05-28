import { useRef, useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
  Pressable,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";
import { useAppLang } from "../../src/context/AppLangContext";
import ThemeToggle from "../../src/components/ThemeToggle";
import AppBrandMark from "../../src/components/AppBrandMark";
import { saveAuthRoleIntent } from "../../src/utils/authRoleIntent";

const { width: W } = Dimensions.get("window");

const ROLES = [
  {
    key: "customer",
    icon: "search-outline",
    activeIcon: "search",
    colorLight: "#6248e8",
    colorDark: "#a78bfa",
    gradLight: ["#6248e8", "#4f46e5", "#4338ca"],
    gradDark: ["#a78bfa", "#7c6bff", "#5b4ddb"],
    en: {
      title: "Rent or buy",
      subtitle: "Browse verified cars and rentals across Morocco.",
      tag: "Explore",
      hint: "For drivers & travelers",
      bullets: ["Browse verified listings", "Compare options quickly", "Book with confidence"],
    },
    fr: {
      title: "Louer ou acheter",
      subtitle: "Parcourez des milliers de voitures vérifiées et locations.",
      tag: "Explorer",
      hint: "Conducteurs & voyageurs",
      bullets: ["Parcourir des annonces vérifiées", "Comparer rapidement les options", "Réserver en confiance"],
    },
  },
  {
    key: "car_owner",
    icon: "car-sport-outline",
    activeIcon: "car-sport",
    colorLight: "#0284c7",
    colorDark: "#38bdf8",
    gradLight: ["#0ea5e9", "#0284c7", "#0369a1"],
    gradDark: ["#38bdf8", "#0ea5e9", "#0284c7"],
    en: {
      title: "I own a car",
      subtitle: "Track insurance, maintenance, and renewals in one garage.",
      tag: "My garage",
      hint: "Personal car care",
      bullets: ["Follow maintenance and deadlines", "Centralize documents", "Get expiry reminders"],
    },
    fr: {
      title: "Je possède une voiture",
      subtitle: "Suivez assurance, entretien et échéances dans un seul garage.",
      tag: "Mon garage",
      hint: "Entretien personnel",
      bullets: ["Suivre l'entretien et les échéances", "Centraliser vos documents", "Recevoir des rappels utiles"],
    },
  },
  {
    key: "rental_owner",
    icon: "business-outline",
    activeIcon: "business",
    colorLight: "#059669",
    colorDark: "#34d399",
    gradLight: ["#10b981", "#059669", "#047857"],
    gradDark: ["#34d399", "#10b981", "#059669"],
    en: {
      title: "I rent out cars",
      subtitle: "Manage your fleet, bookings, revenue, and calendar.",
      tag: "My fleet",
      hint: "Professional hosts",
      bullets: ["Manage all your cars", "Track bookings and calendar", "Monitor revenue clearly"],
    },
    fr: {
      title: "Je loue mes voitures",
      subtitle: "Gérez flotte, réservations, revenus et calendrier.",
      tag: "Ma flotte",
      hint: "Loueurs pro",
      bullets: ["Gérer toutes vos voitures", "Suivre réservations et calendrier", "Voir les revenus clairement"],
    },
  },
];

function GlowOrb({ style, colors, scaleAnim }) {
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: "absolute", borderRadius: 999, opacity: 0.5 }, style, { transform: [{ scale: scaleAnim }] }]}
    >
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

function TrustDot({ icon, label, isDark }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <Ionicons name={icon} size={11} color={isDark ? "#a78bfa" : "#6248e8"} />
      <Text style={{ fontSize: 10, fontWeight: "600", color: isDark ? "#64748b" : "#94a3b8" }}>{label}</Text>
    </View>
  );
}

const JOURNEY_ICONS = ["compass-outline", "person-add-outline", "rocket-outline"];

function JourneySteps({ fr, hasSelection, isDark, pulseAnim, lineScale }) {
  const accent = isDark ? "#a78bfa" : "#6248e8";
  const steps = [
    { label: fr ? "Choisir le rôle" : "Pick your role", done: true },
    { label: fr ? "Créer le compte" : "Create account", done: hasSelection },
    { label: fr ? "Commencer" : "Get started", done: hasSelection },
  ];

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  });

  return (
    <View style={[styles.journeyShell, { borderColor: isDark ? "rgba(167,139,250,0.22)" : "rgba(98,72,232,0.18)" }]}>
      <View style={styles.journeyHeader}>
        <Ionicons name="trail-sign-outline" size={14} color={accent} />
        <Text style={[styles.journeyHeaderTxt, { color: accent }]}>
          {fr ? "VOTRE PARCOURS EN 3 ÉTAPES" : "YOUR 3-STEP PATH"}
        </Text>
      </View>

      <View style={styles.journeyTrack}>
        <View style={[styles.journeyLineBase, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)" }]} />
        <Animated.View
          style={[
            styles.journeyLineFillWrap,
            {
              transform: [{ scaleX: lineScale }],
            },
          ]}
        >
          <LinearGradient colors={[accent, isDark ? "#7c6bff" : "#4f46e5"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.journeyLineFill} />
        </Animated.View>

        {steps.map((step, i) => {
          const done = step.done;
          const isCurrent = i === 0 || (i === 1 && hasSelection);
          return (
            <View key={step.label} style={styles.journeyNodeCol}>
              <Animated.View
                style={[
                  styles.journeyNodeOuter,
                  {
                    borderColor: done ? accent : isDark ? "#334155" : "#cbd5e1",
                    transform: i === 0 ? [{ scale: pulseScale }] : undefined,
                  },
                ]}
              >
                {done ? (
                  <LinearGradient colors={isDark ? ["#a78bfa", "#7c6bff"] : ["#6248e8", "#4f46e5"]} style={styles.journeyNodeInner}>
                    {i === 0 && hasSelection ? (
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    ) : (
                      <Ionicons name={JOURNEY_ICONS[i]} size={12} color="#fff" />
                    )}
                  </LinearGradient>
                ) : (
                  <View style={[styles.journeyNodeInner, { backgroundColor: isDark ? "#1e293b" : "#e2e8f0" }]}>
                    <Ionicons name={JOURNEY_ICONS[i]} size={12} color={isDark ? "#64748b" : "#94a3b8"} />
                  </View>
                )}
              </Animated.View>
              <Text
                style={[
                  styles.journeyNodeLbl,
                  {
                    color: isCurrent ? (isDark ? "#e9d5ff" : "#4338ca") : isDark ? "#64748b" : "#94a3b8",
                    fontWeight: isCurrent ? "800" : "600",
                  },
                ]}
                numberOfLines={2}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const BURST_ANGLES = [0, 60, 120, 180, 240, 300];

function ChoiceReadyModal({ visible, role, fr, isDark, grad, onContinue, onDismiss, bottomInset }) {
  const backdrop = useRef(new Animated.Value(0)).current;
  const sheet = useRef(new Animated.Value(0)).current;
  const iconPop = useRef(new Animated.Value(0)).current;
  const content = useRef(new Animated.Value(0)).current;
  const ctaPulse = useRef(new Animated.Value(1)).current;
  const arrowNudge = useRef(new Animated.Value(0)).current;
  const burstAnims = useRef(BURST_ANGLES.map(() => new Animated.Value(0))).current;
  const shimmer = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    if (!visible || !role) return;

    backdrop.setValue(0);
    sheet.setValue(0);
    iconPop.setValue(0);
    content.setValue(0);
    burstAnims.forEach((a) => a.setValue(0));
    shimmer.setValue(-60);

    const burstSeq = burstAnims.map((a, i) =>
      Animated.sequence([
        Animated.delay(180 + i * 40),
        Animated.timing(a, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ])
    );

    Animated.parallel([
      Animated.timing(backdrop, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(sheet, { toValue: 1, friction: 6, tension: 62, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.delay(90),
      Animated.spring(iconPop, { toValue: 1, friction: 4, tension: 88, useNativeDriver: true }),
      Animated.parallel([Animated.timing(content, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }), ...burstSeq]),
    ]).start();

    const shine = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 72, duration: 2200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: -60, duration: 0, useNativeDriver: true }),
      ])
    );
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(ctaPulse, { toValue: 1.045, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(ctaPulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    const nudge = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowNudge, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(arrowNudge, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    shine.start();
    pulse.start();
    nudge.start();

    return () => {
      shine.stop();
      pulse.stop();
      nudge.stop();
    };
  }, [visible, role?.key, backdrop, sheet, iconPop, content, burstAnims, shimmer]);

  if (!role) return null;

  const copy = fr ? role.fr : role.en;
  const color = isDark ? role.colorDark : role.colorLight;
  const sheetScale = sheet.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] });
  const sheetY = sheet.interpolate({ inputRange: [0, 1], outputRange: [72, 0] });
  const iconScale = iconPop.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
  const iconRotate = iconPop.interpolate({ inputRange: [0, 1], outputRange: ["-18deg", "0deg"] });
  const contentY = content.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
  const arrowX = arrowNudge.interpolate({ inputRange: [0, 1], outputRange: [0, 6] });
  const backdropOpacity = backdrop.interpolate({ inputRange: [0, 1], outputRange: [0, 0.72] });

  const formSteps = fr
    ? ["Profil rapide", "Email & mot de passe", "C'est parti !"]
    : ["Quick profile", "Email & password", "You're in!"];

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onDismiss}>
      <View style={styles.modalRoot}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} accessibilityLabel={fr ? "Fermer" : "Close"}>
          <Animated.View style={[styles.modalBackdrop, { opacity: backdropOpacity }]} />
        </Pressable>

        <Animated.View
          style={[
            styles.modalSheetWrap,
            {
              paddingBottom: bottomInset + 16,
              opacity: sheet,
              transform: [{ scale: sheetScale }, { translateY: sheetY }],
            },
          ]}
        >
          <View style={[styles.modalSheet, { borderColor: `${color}44`, backgroundColor: isDark ? "#0a0c14" : "#ffffff" }]}>
            <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modalRibbon}>
              <Ionicons name="sparkles" size={14} color="#fff" />
              <Text style={styles.modalRibbonTxt}>{fr ? "VOTRE CHOIX EST PRÊT" : "YOUR CHOICE IS READY"}</Text>
              <Ionicons name="sparkles" size={14} color="#fff" />
            </LinearGradient>

            <View style={styles.modalIconFloat}>
              {BURST_ANGLES.map((deg, i) => {
                const rad = (deg * Math.PI) / 180;
                const tx = burstAnims[i].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.cos(rad) * 38],
                });
                const ty = burstAnims[i].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.sin(rad) * 38],
                });
                const burstOpacity = burstAnims[i].interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 0] });
                return (
                  <Animated.View
                    key={deg}
                    pointerEvents="none"
                    style={[
                      styles.modalBurstDot,
                      {
                        backgroundColor: color,
                        opacity: burstOpacity,
                        transform: [{ translateX: tx }, { translateY: ty }],
                      },
                    ]}
                  />
                );
              })}

              <Animated.View
                style={[
                  styles.modalIconRing,
                  { borderColor: color, transform: [{ scale: iconScale }] },
                ]}
              />
              <Animated.View style={{ transform: [{ scale: iconScale }, { rotate: iconRotate }] }}>
                <LinearGradient colors={grad} style={styles.modalIcon}>
                  <Ionicons name={role.activeIcon} size={32} color="#fff" />
                  <Animated.View
                    pointerEvents="none"
                    style={[styles.modalIconShine, { transform: [{ translateX: shimmer }, { skewX: "-18deg" }] }]}
                  />
                </LinearGradient>
              </Animated.View>
            </View>

            <Animated.View style={{ opacity: content, transform: [{ translateY: contentY }] }}>
              <Text style={[styles.modalHeadline, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
                {fr ? "Plus qu'une étape !" : "One step away!"}
              </Text>
              <Text style={[styles.modalModeLine, { color }]}>
                {copy.tag} · {copy.title}
              </Text>
              <Text style={[styles.modalPitch, { color: isDark ? "#94a3b8" : "#64748b" }]}>
                {fr
                  ? `Créez votre compte pour débloquer le mode ${copy.tag} et accéder à toutes les fonctionnalités.`
                  : `Create your account to unlock ${copy.tag} mode and access every feature.`}
              </Text>

              <View style={styles.modalFormTrack}>
                {formSteps.map((step, i) => (
                  <View key={step} style={styles.modalFormStep}>
                    <View style={[styles.modalFormDot, { backgroundColor: i === 0 ? color : isDark ? "#334155" : "#cbd5e1" }]}>
                      <Text style={styles.modalFormDotTxt}>{i + 1}</Text>
                    </View>
                    <Text style={[styles.modalFormLbl, { color: isDark ? "#cbd5e1" : "#475569" }]}>{step}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                onPress={onContinue}
                style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1, marginTop: 18 })}
                accessibilityRole="button"
                accessibilityLabel={fr ? "Créer mon compte" : "Create my account"}
              >
                <Animated.View style={{ transform: [{ scale: ctaPulse }] }}>
                  <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modalCta}>
                    <View>
                      <Text style={styles.modalCtaTitle}>{fr ? "Créer mon compte" : "Create my account"}</Text>
                      <Text style={styles.modalCtaSub}>
                        {fr ? "Remplir le formulaire — 2 min" : "Fill the form — 2 min"}
                      </Text>
                    </View>
                    <Animated.View style={{ transform: [{ translateX: arrowX }] }}>
                      <Ionicons name="arrow-forward-circle" size={28} color="#fff" />
                    </Animated.View>
                  </LinearGradient>
                </Animated.View>
              </Pressable>

              <Pressable onPress={onDismiss} style={styles.modalDismiss} hitSlop={12}>
                <Text style={[styles.modalDismissTxt, { color: isDark ? "#64748b" : "#94a3b8" }]}>
                  {fr ? "Choisir un autre mode" : "Pick a different mode"}
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function RoleCard({ role, index, selected, onPress, isDark, fr, anim, selectAnim }) {
  const copy = fr ? role.fr : role.en;
  const color = isDark ? role.colorDark : role.colorLight;
  const grad = isDark ? role.gradDark : role.gradLight;
  const isSelected = selected === role.key;

  const borderGlow = selectAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const cardScale = selectAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });

  return (
    <Animated.View
      style={{
        opacity: anim.opacity,
        transform: [{ translateY: anim.translate }, { scale: cardScale }],
      }}
    >
      <Pressable onPress={() => onPress(role.key)} style={({ pressed }) => ({ opacity: pressed ? 0.94 : 1 })}>
        <Animated.View
          style={[
            styles.cardOuter,
            {
              borderColor: isSelected ? color : isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.07)",
              shadowColor: color,
              shadowOpacity: isSelected ? 0.45 : 0.08,
              shadowRadius: isSelected ? 24 : 10,
              shadowOffset: { width: 0, height: isSelected ? 12 : 4 },
              elevation: isSelected ? 12 : 4,
            },
          ]}
        >
          {isSelected ? (
            <LinearGradient
              colors={[`${color}55`, `${color}15`, "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          ) : null}

          <Animated.View
            style={[styles.cardSpine, { backgroundColor: isSelected ? color : "transparent", opacity: borderGlow }]}
          />

          <View style={styles.cardBody}>
            <View style={styles.cardTopRow}>
              <Text style={[styles.cardIndex, { color: isSelected ? color : isDark ? "#475569" : "#94a3b8" }]}>
                {String(index + 1).padStart(2, "0")}
              </Text>
              <View style={[styles.tagChip, { borderColor: `${color}44`, backgroundColor: `${color}14` }]}>
                <Text style={[styles.tagChipTxt, { color }]}>{copy.tag}</Text>
              </View>
            </View>

            <View style={styles.cardMain}>
              <View style={styles.iconRingWrap}>
                {isSelected ? (
                  <Animated.View
                    style={[
                      styles.iconRingGlow,
                      {
                        borderColor: color,
                        opacity: borderGlow,
                        transform: [
                          {
                            scale: selectAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.08] }),
                          },
                        ],
                      },
                    ]}
                  />
                ) : null}
                <LinearGradient
                  colors={isSelected ? grad : [`${color}28`, `${color}10`]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconBox}
                >
                  <Ionicons name={isSelected ? role.activeIcon : role.icon} size={28} color={isSelected ? "#fff" : color} />
                </LinearGradient>
              </View>

              <View style={styles.cardCopy}>
                <Text style={[styles.cardTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>{copy.title}</Text>
                <Text style={[styles.cardHint, { color }]}>{copy.hint}</Text>
                <Text style={[styles.cardSub, { color: isDark ? "#94a3b8" : "#64748b" }]} numberOfLines={2}>
                  {copy.subtitle}
                </Text>
              </View>

              <View style={[styles.radioOuter, { borderColor: isSelected ? color : isDark ? "#334155" : "#cbd5e1" }]}>
                {isSelected ? (
                  <LinearGradient colors={grad} style={styles.radioInner}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </LinearGradient>
                ) : null}
              </View>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function RoleSelectScreen() {
  const { colors: C, isDark } = useTheme();
  const { lang, setLang } = useAppLang();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fr = lang === "fr";

  const [selected, setSelected] = useState(null);
  const [choiceModalVisible, setChoiceModalVisible] = useState(false);

  const orbPulse = useRef(new Animated.Value(1)).current;
  const orbDrift = useRef(new Animated.Value(0)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(20)).current;
  const shimmer = useRef(new Animated.Value(-1)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const btnGlow = useRef(new Animated.Value(0.4)).current;
  const journeyPulse = useRef(new Animated.Value(0)).current;
  const journeyLine = useRef(new Animated.Value(0.34)).current;

  const cardAnims = useRef(ROLES.map(() => ({ opacity: new Animated.Value(0), translate: new Animated.Value(36) }))).current;
  const selectAnims = useRef(ROLES.map(() => new Animated.Value(0))).current;

  const selectedRole = useMemo(() => ROLES.find((r) => r.key === selected), [selected]);
  const selectedGrad = selectedRole
    ? isDark
      ? selectedRole.gradDark
      : selectedRole.gradLight
    : isDark
      ? ["#7c6bff", "#5b4ddb"]
      : ["#6248e8", "#4f46e5"];

  useEffect(() => {
    ROLES.forEach((_, i) => {
      Animated.spring(selectAnims[i], {
        toValue: selected === ROLES[i].key ? 1 : 0,
        friction: 7,
        tension: 55,
        useNativeDriver: true,
      }).start();
    });
  }, [selected, selectAnims]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(heroSlide, { toValue: 0, friction: 8, tension: 38, useNativeDriver: true }),
    ]).start();

    Animated.stagger(
      90,
      cardAnims.map((a) =>
        Animated.parallel([
          Animated.timing(a.opacity, { toValue: 1, duration: 560, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.spring(a.translate, { toValue: 0, friction: 7, tension: 44, useNativeDriver: true }),
        ])
      )
    ).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, { toValue: 1.16, duration: 5200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orbPulse, { toValue: 1, duration: 5200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    const drift = Animated.loop(
      Animated.sequence([
        Animated.timing(orbDrift, { toValue: 1, duration: 8000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orbDrift, { toValue: 0, duration: 8000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    const shine = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: -1, duration: 0, useNativeDriver: true }),
      ])
    );
    pulse.start();
    drift.start();
    shine.start();

    return () => {
      pulse.stop();
      drift.stop();
      shine.stop();
    };
  }, []);

  useEffect(() => {
    Animated.timing(journeyLine, {
      toValue: selected ? 1 : 0.34,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [selected, journeyLine]);

  useEffect(() => {
    if (!selected) {
      btnGlow.setValue(0.5);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(btnGlow, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(btnGlow, { toValue: 0.55, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [selected, btnGlow]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(journeyPulse, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(journeyPulse, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [journeyPulse]);

  const handleSelect = (key) => {
    setSelected(key);
    setChoiceModalVisible(true);
    saveAuthRoleIntent(key);
  };

  const handleContinue = () => {
    if (!selected) return;
    setChoiceModalVisible(false);
    saveAuthRoleIntent(selected);
    Animated.sequence([
      Animated.spring(btnScale, { toValue: 0.96, friction: 6, useNativeDriver: true }),
      Animated.spring(btnScale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start(() => {
      router.push({ pathname: "/(auth)/register", params: { role: selected } });
    });
  };

  const goToLogin = () => {
    const role = selected || "customer";
    saveAuthRoleIntent(role);
    router.push({ pathname: "/(auth)/login", params: { role } });
  };

  const heroGrad = isDark
    ? ["#020108", "#120a28", "#061018", "#03040a"]
    : ["#faf5ff", "#ede9fe", "#e0f2fe", "#f8fafc"];
  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#94a3b8" : "#475569";
  const primary = isDark ? "#a78bfa" : "#6248e8";

  const orbDriftY = orbDrift.interpolate({ inputRange: [0, 1], outputRange: [0, 18] });
  const shimmerX = shimmer.interpolate({
    inputRange: [-1, 1],
    outputRange: [-W * 0.4, W * 0.4],
  });

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#03040a" : C.bg }}>
      <LinearGradient pointerEvents="none" colors={heroGrad} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFill} />
      <GlowOrb
        scaleAnim={orbPulse}
        colors={isDark ? ["rgba(167,139,250,0.45)", "rgba(167,139,250,0)"] : ["rgba(98,72,232,0.3)", "rgba(98,72,232,0)"]}
        style={{ width: 220, height: 220, top: -80, right: -70 }}
      />
      <Animated.View style={{ transform: [{ translateY: orbDriftY }] }}>
        <GlowOrb
          scaleAnim={orbPulse}
          colors={isDark ? ["rgba(56,189,248,0.28)", "rgba(56,189,248,0)"] : ["rgba(14,165,233,0.22)", "rgba(14,165,233,0)"]}
          style={{ width: 160, height: 160, top: 120, left: -70 }}
        />
      </Animated.View>

      <ScrollView
        contentContainerStyle={[styles.scrollRoot, { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        bounces
      >
        <View style={styles.topBar}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => setLang(fr ? "en" : "fr")} style={[styles.langBtn, { borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)" }]}>
            <Text style={{ color: primary, fontWeight: "800", fontSize: 12 }}>{fr ? "EN" : "FR"}</Text>
          </TouchableOpacity>
          <ThemeToggle />
        </View>

        <Animated.View
          style={[styles.compactHero, { opacity: heroOpacity, transform: [{ translateY: heroSlide }] }]}
        >
          <View style={styles.heroRow}>
            <AppBrandMark size={52} radius={16} halo />

            <View style={styles.heroCopy}>
              <Text style={[styles.kicker, { color: primary }]}>{fr ? "BIENVENUE" : "WELCOME"}</Text>
              <View style={styles.brandWrap}>
                <Text style={[styles.brand, { color: titleColor }]}>
                  Goo<Text style={{ fontStyle: "italic", color: primary }}>voiture</Text>
                </Text>
                <Animated.View
                  pointerEvents="none"
                  style={[styles.brandShine, { transform: [{ translateX: shimmerX }, { skewX: "-18deg" }] }]}
                />
              </View>
              <Text style={[styles.heroTagline, { color: primary }]} numberOfLines={1}>
                {fr ? "Mobilité premium au Maroc" : "Premium mobility in Morocco"}
              </Text>
            </View>
          </View>

          <Text style={[styles.heroSub, { color: subColor }]} numberOfLines={2}>
            {fr
              ? "Choisissez votre parcours — d'autres rôles pourront être ajoutés plus tard."
              : "Pick your path — you can add more roles later."}
          </Text>

          <View style={styles.trustRow}>
            <TrustDot icon="shield-checkmark-outline" label={fr ? "Sécurisé" : "Secure"} isDark={isDark} />
            <Text style={[styles.trustSep, { color: isDark ? "#334155" : "#cbd5e1" }]}>·</Text>
            <TrustDot icon="checkmark-done-outline" label={fr ? "Vérifié" : "Verified"} isDark={isDark} />
            <Text style={[styles.trustSep, { color: isDark ? "#334155" : "#cbd5e1" }]}>·</Text>
            <TrustDot icon="sparkles-outline" label="Premium" isDark={isDark} />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: heroOpacity, marginBottom: 16 }}>
          <JourneySteps fr={fr} hasSelection={!!selected} isDark={isDark} pulseAnim={journeyPulse} lineScale={journeyLine} />
        </Animated.View>

        <Text style={[styles.pickLabel, { color: isDark ? "#64748b" : "#94a3b8" }]}>
          {fr ? "CHOISISSEZ VOTRE MODE" : "PICK YOUR MODE"}
        </Text>

        {ROLES.map((role, i) => (
          <RoleCard
            key={role.key}
            role={role}
            index={i}
            selected={selected}
            onPress={handleSelect}
            isDark={isDark}
            fr={fr}
            anim={cardAnims[i]}
            selectAnim={selectAnims[i]}
          />
        ))}

        <Animated.View style={{ transform: [{ scale: btnScale }], marginTop: 6 }}>
          <Pressable onPress={handleContinue} disabled={!selected} style={({ pressed }) => ({ opacity: pressed && selected ? 0.92 : 1 })}>
            <Animated.View style={{ opacity: btnGlow }}>
              <LinearGradient
                colors={selected ? selectedGrad : isDark ? ["#1e293b", "#1e293b"] : ["#e2e8f0", "#e2e8f0"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
              >
                <Text style={[styles.continueTxt, { color: selected ? "#fff" : isDark ? "#64748b" : "#94a3b8" }]}>
                  {selected
                    ? fr
                      ? `Continuer en mode ${selectedRole?.fr?.tag || ""}`
                      : `Continue with ${selectedRole?.en?.tag || "this role"}`
                    : fr
                      ? "Sélectionnez une option"
                      : "Select an option"}
                </Text>
                <Ionicons
                  name={selected ? "arrow-forward-circle" : "ellipse-outline"}
                  size={22}
                  color={selected ? "#fff" : isDark ? "#64748b" : "#94a3b8"}
                />
              </LinearGradient>
            </Animated.View>
          </Pressable>
        </Animated.View>

        <Pressable
          onPress={goToLogin}
          style={({ pressed }) => [styles.loginRow, pressed && { opacity: 0.85 }]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="link"
          accessibilityLabel={fr ? "Se connecter" : "Sign in"}
        >
          <Text style={[styles.loginQ, { color: subColor }]}>{fr ? "Déjà un compte ? " : "Already have an account? "}</Text>
          <Text style={[styles.loginLink, { color: primary }]}>{fr ? "Se connecter" : "Sign in"}</Text>
        </Pressable>
      </ScrollView>

      <ChoiceReadyModal
        visible={choiceModalVisible && !!selectedRole}
        role={selectedRole}
        fr={fr}
        isDark={isDark}
        grad={selectedGrad}
        onContinue={handleContinue}
        onDismiss={() => setChoiceModalVisible(false)}
        bottomInset={insets.bottom}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollRoot: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  topBar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  compactHero: {
    marginBottom: 16,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 10,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  kicker: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2.4,
    marginBottom: 2,
  },
  brandWrap: {
    overflow: "hidden",
    marginBottom: 2,
  },
  brand: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  brandShine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: "rgba(255,255,255,0.35)",
    opacity: 0.35,
  },
  heroTagline: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  heroSub: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    marginBottom: 8,
  },
  trustRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  trustSep: {
    fontSize: 12,
    fontWeight: "700",
  },
  pickLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginBottom: 12,
  },
  journeyShell: {
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "rgba(124,107,255,0.04)",
  },
  journeyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 14,
  },
  journeyHeaderTxt: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  journeyTrack: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    position: "relative",
    paddingHorizontal: 4,
  },
  journeyLineBase: {
    position: "absolute",
    left: 28,
    right: 28,
    top: 15,
    height: 3,
    borderRadius: 2,
  },
  journeyLineFillWrap: {
    position: "absolute",
    left: 28,
    right: 28,
    top: 15,
    height: 3,
    borderRadius: 2,
    transformOrigin: "left",
    overflow: "hidden",
  },
  journeyLineFill: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  journeyNodeCol: {
    flex: 1,
    alignItems: "center",
    maxWidth: W * 0.28,
  },
  journeyNodeOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    zIndex: 2,
  },
  journeyNodeInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  journeyNodeLbl: {
    fontSize: 9,
    textAlign: "center",
    lineHeight: 12,
    letterSpacing: 0.1,
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#020108",
  },
  modalSheetWrap: {
    paddingHorizontal: 20,
    width: "100%",
  },
  modalSheet: {
    borderRadius: 28,
    borderWidth: 1.5,
    overflow: "hidden",
    paddingBottom: 20,
    shadowColor: "#7c6bff",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 24,
  },
  modalRibbon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  modalRibbonTxt: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  modalIconFloat: {
    alignItems: "center",
    justifyContent: "center",
    height: 88,
    marginTop: 8,
    marginBottom: 4,
  },
  modalBurstDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalIconRing: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 28,
    borderWidth: 2,
    opacity: 0.5,
  },
  modalIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  modalIconShine: {
    position: "absolute",
    width: 20,
    height: 80,
    backgroundColor: "rgba(255,255,255,0.28)",
    left: 8,
    top: -4,
  },
  modalHeadline: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
    textAlign: "center",
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  modalModeLine: {
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.3,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  modalPitch: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 22,
    marginBottom: 16,
  },
  modalFormTrack: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    gap: 6,
  },
  modalFormStep: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  modalFormDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  modalFormDotTxt: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
  },
  modalFormLbl: {
    fontSize: 9,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 12,
  },
  modalCta: {
    marginHorizontal: 18,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalCtaTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  modalCtaSub: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  modalDismiss: {
    alignItems: "center",
    marginTop: 14,
    paddingVertical: 6,
  },
  modalDismissTxt: {
    fontSize: 13,
    fontWeight: "600",
  },
  cardOuter: {
    borderRadius: 22,
    borderWidth: 1.5,
    marginBottom: 14,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  cardSpine: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
  },
  cardBody: {
    padding: 18,
    paddingLeft: 20,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  cardIndex: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  tagChipTxt: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  cardMain: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  iconRingWrap: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  iconRingGlow: {
    position: "absolute",
    width: 62,
    height: 62,
    borderRadius: 20,
    borderWidth: 2,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  cardCopy: {
    flex: 1,
    paddingTop: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.35,
    marginBottom: 2,
  },
  cardHint: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  cardSub: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },
  radioOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  radioInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  continueBtn: {
    borderRadius: 18,
    paddingVertical: 17,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#7c6bff",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  continueBtnDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  continueTxt: {
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: -0.2,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    flexWrap: "wrap",
    paddingVertical: 12,
    zIndex: 10,
  },
  loginQ: { fontSize: 14, fontWeight: "500" },
  loginLink: { fontSize: 14, fontWeight: "800" },
});
