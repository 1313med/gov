import { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Linking, Dimensions, StyleSheet, LayoutAnimation, Platform, UIManager } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getSaleById } from "../../src/api/sale";
import { startConversation } from "../../src/api/message";
import { addFavorite, removeFavorite, getFavorites } from "../../src/api/user";
import { estimatePrice } from "../../src/api/price";
import ReviewSection from "../../src/components/ReviewSection";
import FavoriteHeartButton from "../../src/components/FavoriteHeartButton";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { resolveMediaUrl } from "../../src/utils/mediaUrl";
import { useTheme } from "../../src/context/ThemeContext";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── Price verdict helpers ───────────────────────────────────────────────────
function getVerdict(listingPrice, est) {
  if (!est || !listingPrice) return null;
  const pct = ((listingPrice - est.mid) / est.mid) * 100;
  if (listingPrice < est.low * 0.95)   return { key: "opportunity", pct, color: "#22c55e", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.3)",  icon: "trending-down-outline" };
  if (listingPrice <= est.high * 1.05) return { key: "fair",        pct, color: "#eab308", bg: "rgba(234,179,8,0.10)",  border: "rgba(234,179,8,0.28)", icon: "checkmark-circle-outline" };
  return                                       { key: "high",        pct, color: "#ef4444", bg: "rgba(239,68,68,0.10)",  border: "rgba(239,68,68,0.28)", icon: "trending-up-outline" };
}

const VERDICT_LABELS = {
  opportunity: {
    fr: { label: "Opportunité",    sub: "Prix bien en dessous du marché" },
    en: { label: "Good Deal",      sub: "Price well below market" },
  },
  fair: {
    fr: { label: "Prix du marché", sub: "Dans la fourchette estimée" },
    en: { label: "Market Price",   sub: "Within estimated range" },
  },
  high: {
    fr: { label: "Prix élevé",     sub: "Au-dessus de l'estimation du marché" },
    en: { label: "High Price",     sub: "Above market estimate" },
  },
};

// ── Collapsible section ─────────────────────────────────────────────────────
function Section({ icon, title, color, children, defaultOpen = false, C: colors }) {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(v => !v);
  }, []);
  return (
    <View style={{ marginBottom: 2 }}>
      <TouchableOpacity onPress={toggle} activeOpacity={0.75}
        style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 }}
      >
        <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: `${color}22`, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name={icon} size={14} color={color} />
        </View>
        <Text style={{ flex: 1, fontSize: 14, fontWeight: "700", color: colors?.white || "#f1f5f9" }}>{title}</Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color={colors?.muted || "#64748b"} />
      </TouchableOpacity>
      {open && <View style={{ paddingBottom: 8 }}>{children}</View>}
    </View>
  );
}

// ── Price Analysis Card ─────────────────────────────────────────────────────
function PriceAnalysisCard({ car, lang, C }) {
  const fr = lang === "fr";
  const [est, setEst]   = useState(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!car?.brand || !car?.year) return;
    setBusy(true);
    estimatePrice({ brand: car.brand, model: car.model, year: car.year, mileage: car.mileage, fuel: car.fuel, gearbox: car.gearbox })
      .then(r => setEst(r.data))
      .catch(() => {})
      .finally(() => setBusy(false));
  }, [car]);

  const verdict = getVerdict(car?.price, est);
  const verdictText = verdict ? VERDICT_LABELS[verdict.key][fr ? "fr" : "en"] : null;

  const toggleOpen = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(v => !v);
  }, []);

  const mutedColor  = C?.muted  || "#64748b";
  const labelColor  = C?.label  || "#94a3b8";
  const borderColor = C?.border || "rgba(255,255,255,0.08)";

  if (busy) return (
    <View style={{ backgroundColor: C?.card, borderRadius: 16, borderWidth: 1, borderColor, padding: 16, marginBottom: 16, alignItems: "center", flexDirection: "row", gap: 10 }}>
      <ActivityIndicator size="small" color="#7c6bff" />
      <Text style={{ color: mutedColor, fontSize: 13 }}>{fr ? "Analyse du prix en cours…" : "Analyzing price…"}</Text>
    </View>
  );

  if (!verdict || !verdictText) return null;

  return (
    <View style={{ backgroundColor: verdict.bg, borderRadius: 16, borderWidth: 1, borderColor: verdict.border, marginBottom: 16, overflow: "hidden" }}>
      {/* Main verdict row */}
      <TouchableOpacity onPress={toggleOpen} activeOpacity={0.8} style={{ padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: `${verdict.color}22`, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name={verdict.icon} size={20} color={verdict.color} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: "900", color: verdict.color }}>{verdictText.label}</Text>
              <View style={{ backgroundColor: `${verdict.color}22`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 }}>
                <Text style={{ fontSize: 11, fontWeight: "800", color: verdict.color }}>
                  {verdict.pct > 0 ? `+${Math.round(verdict.pct)}%` : `${Math.round(verdict.pct)}%`} {fr ? "vs marché" : "vs market"}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 12, color: labelColor, marginTop: 2 }}>{verdictText.sub}</Text>
          </View>
          <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color={mutedColor} />
        </View>

        {/* Price range bar */}
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 11, color: mutedColor }}>{fr ? "Estimation Goovoiture" : "Goovoiture Estimate"}</Text>
            <Text style={{ fontSize: 12, fontWeight: "700", color: labelColor }}>
              {est.low.toLocaleString()} – {est.high.toLocaleString()} MAD
            </Text>
          </View>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: borderColor, position: "relative" }}>
            <LinearGradient colors={["#22c55e", "#eab308", "#ef4444"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 6, borderRadius: 3 }} />
            {(() => {
              const range = est.high * 1.2 - est.low * 0.8;
              const pos = Math.min(Math.max((car.price - est.low * 0.8) / range, 0), 1);
              return (
                <View style={{ position: "absolute", top: -3, left: `${pos * 100}%`, width: 12, height: 12, borderRadius: 6, backgroundColor: "#fff", borderWidth: 2, borderColor: verdict.color, marginLeft: -6 }} />
              );
            })()}
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 10, color: "#22c55e", fontWeight: "700" }}>{fr ? "Bas marché" : "Low market"}</Text>
            <Text style={{ fontSize: 10, color: labelColor }}>● {Number(car.price).toLocaleString()} MAD ({fr ? "annonce" : "listing"})</Text>
            <Text style={{ fontSize: 10, color: "#ef4444", fontWeight: "700" }}>{fr ? "Haut marché" : "High market"}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Opportunity disclaimer */}
      {open && verdict.key === "opportunity" && (
        <View style={{ marginHorizontal: 16, marginBottom: 12, padding: 12, backgroundColor: "rgba(34,197,94,0.08)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(34,197,94,0.2)" }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
            <Ionicons name="information-circle-outline" size={16} color="#22c55e" style={{ marginTop: 1 }} />
            <Text style={{ flex: 1, fontSize: 12, color: labelColor, lineHeight: 18 }}>
              <Text style={{ color: "#22c55e", fontWeight: "700" }}>{fr ? "Ce prix semble attractif." : "This price looks attractive."}</Text>
              {" "}{fr
                ? "Ne basez pas votre décision uniquement sur le prix estimé — inspectez le véhicule et vérifiez tous les documents avant tout engagement."
                : "Don't base your decision solely on the estimated price — inspect the vehicle and verify all documents before committing."}
            </Text>
          </View>
        </View>
      )}

      {/* Breakdown */}
      {open && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase", color: mutedColor, marginBottom: 8 }}>
            {fr ? "Détail de l'estimation" : "Estimate breakdown"}
          </Text>
          {est.breakdown.map((item, i) => (
            <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6, borderBottomWidth: i < est.breakdown.length - 1 ? 1 : 0, borderBottomColor: borderColor }}>
              <Text style={{ fontSize: 12, color: mutedColor, flex: 1 }}>{item.label}</Text>
              <Text style={{ fontSize: 12, fontWeight: "800", color: item.positive === null ? mutedColor : item.positive ? "#22c55e" : "#f97316" }}>{item.value}</Text>
            </View>
          ))}
          <Text style={{ fontSize: 10, color: mutedColor, marginTop: 10, lineHeight: 15 }}>
            {fr
              ? "Estimation basée sur les prix du marché marocain. La valeur réelle dépend de l'état, des options et de la négociation."
              : "Estimate based on Moroccan market prices. Actual value depends on condition, options and negotiation."}
          </Text>
        </View>
      )}
    </View>
  );
}

// ── Buyer Guide Card ────────────────────────────────────────────────────────
const GUIDE_DATA = {
  fr: {
    title: "Guide acheteur Goovoiture",
    sub: "Marché marocain · Conseils vérifiés",
    inspection: {
      title: "Inspection physique",
      items: [
        { icon: "car-outline",         color: "#38bdf8", title: "Carrosserie",      body: "Cherchez des différences de teinte (signe de réparation après accident). Vérifiez la rouille sous les portières, le bas de caisse et dans le coffre." },
        { icon: "flame-outline",       color: "#f97316", title: "Moteur",           body: "Au démarrage à froid : pas de fumée noire (diesel riche) ni bleue (huile brûlée). Vérifiez le niveau et la couleur de l'huile (marron clair = bon signe)." },
        { icon: "speedometer-outline", color: "#a78bfa", title: "Test drive",       body: "Freins : pas de vibration ni de bruit. Direction : le volant ne doit pas tirer d'un côté. Boîte : passages fluides. Climatisation : froid rapide." },
        { icon: "construct-outline",   color: "#eab308", title: "Dessous de caisse", body: "Demandez à un mécanicien de lever la voiture : rouille structurelle, fuite d'huile sur le carter, état des amortisseurs et silentblocs." },
      ],
    },
    documents: {
      title: "Documents à exiger au vendeur",
      items: [
        { icon: "document-text-outline",    color: "#22c55e", title: "Carte grise",           body: "Vérifiez que le nom sur la carte grise correspond exactement au vendeur. Toute différence = risque de vol ou de litige." },
        { icon: "shield-checkmark-outline", color: "#38bdf8", title: "Certificat de non-gage", body: "Document gratuit sur mtpnet.ma — confirme qu'aucune banque ou crédit n'est en cours sur le véhicule. INDISPENSABLE avant achat." },
        { icon: "calendar-outline",         color: "#f97316", title: "Visite technique",       body: "Doit être valide (renouvelée tous les 2 ans). Si expirée, négociez la remise en état ou une réduction du prix équivalente." },
        { icon: "key-outline",              color: "#a78bfa", title: "Clés & carnet entretien", body: "Exigez les deux clés (originale + rechange). Le carnet d'entretien tamponné prouve les révisions régulières et augmente la valeur." },
      ],
    },
    mutation: {
      title: "Processus de mutation au Maroc",
      steps: [
        { num: "1", title: "Certificat de non-gage", body: "Obtenez-le gratuitement sur mtpnet.ma avant de signer quoi que ce soit." },
        { num: "2", title: "Contrat de vente",        body: "Rédigez un contrat manuscrit en 2 exemplaires, signé par vendeur et acheteur. Mentionnez : prix, kilométrage, état, identités." },
        { num: "3", title: "Dossier de mutation",     body: "Carte grise originale, CIN des deux parties, contrat de vente signé, timbres fiscaux (~200–300 MAD)." },
        { num: "4", title: "Ministère du Transport",  body: "Rendez-vous au bureau régional (ou agence agréée). La nouvelle carte grise est délivrée sous 48h à 2 semaines." },
      ],
      costLabel: "Coût total mutation :",
      costAfter: "300–500 MAD (timbres fiscaux + frais d'agence si via intermédiaire).",
    },
  },
  en: {
    title: "Goovoiture Buyer Guide",
    sub: "Moroccan market · Verified tips",
    inspection: {
      title: "Physical Inspection",
      items: [
        { icon: "car-outline",         color: "#38bdf8", title: "Bodywork",     body: "Look for paint shade differences (sign of accident repair). Check for rust under doors, sills and in the trunk." },
        { icon: "flame-outline",       color: "#f97316", title: "Engine",       body: "Cold start: no black smoke (rich diesel) or blue smoke (burning oil). Check oil level and color (light brown = good sign)." },
        { icon: "speedometer-outline", color: "#a78bfa", title: "Test Drive",   body: "Brakes: no vibration or noise. Steering: wheel must not pull to one side. Gearbox: smooth gear changes. AC: cools quickly." },
        { icon: "construct-outline",   color: "#eab308", title: "Undercarriage", body: "Ask a mechanic to lift the car: structural rust, oil leak on sump, condition of shock absorbers and silentblocks." },
      ],
    },
    documents: {
      title: "Documents to Request",
      items: [
        { icon: "document-text-outline",    color: "#22c55e", title: "Registration Card",    body: "Verify the name on the registration card matches the seller exactly. Any difference = risk of theft or dispute." },
        { icon: "shield-checkmark-outline", color: "#38bdf8", title: "Lien-Free Certificate", body: "Free document on mtpnet.ma — confirms no bank or credit is active on the vehicle. ESSENTIAL before buying." },
        { icon: "calendar-outline",         color: "#f97316", title: "Technical Inspection",  body: "Must be valid (renewed every 2 years). If expired, negotiate for repair or equivalent price reduction." },
        { icon: "key-outline",              color: "#a78bfa", title: "Keys & Service History", body: "Request both keys (original + spare). A stamped service booklet proves regular maintenance and increases value." },
      ],
    },
    mutation: {
      title: "Ownership Transfer in Morocco",
      steps: [
        { num: "1", title: "Lien-Free Certificate", body: "Get it free on mtpnet.ma before signing anything." },
        { num: "2", title: "Sale Agreement",         body: "Draft a handwritten contract in 2 copies, signed by both parties. Include: price, mileage, condition, identities." },
        { num: "3", title: "Transfer File",          body: "Original registration card, national IDs of both parties, signed sale contract, tax stamps (~200–300 MAD)." },
        { num: "4", title: "Transport Ministry",     body: "Visit the regional office (or licensed agency). New registration card issued within 48h to 2 weeks." },
      ],
      costLabel: "Total transfer cost:",
      costAfter: "300–500 MAD (tax stamps + agency fees if via intermediary).",
    },
  },
};

function BuyerGuideCard({ lang, C }) {
  const guide = GUIDE_DATA[lang === "fr" ? "fr" : "en"];
  const titleColor = C?.white  || "#f1f5f9";
  const mutedColor = C?.muted  || "#64748b";
  const labelColor = C?.label  || "#94a3b8";
  const borderColor = C?.border || "rgba(255,255,255,0.08)";
  const cardBg = C?.card || "rgba(255,255,255,0.04)";

  const renderItems = (items) => items.map((item, i) => (
    <View key={i} style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
      <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: `${item.color}20`, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
        <Ionicons name={item.icon} size={13} color={item.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: "700", color: titleColor, marginBottom: 2 }}>{item.title}</Text>
        <Text style={{ fontSize: 12, color: mutedColor, lineHeight: 18 }}>{item.body}</Text>
      </View>
    </View>
  ));

  return (
    <View style={{ backgroundColor: cardBg, borderRadius: 16, borderWidth: 1, borderColor, padding: 16, marginBottom: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <LinearGradient colors={["#6248e8", "#4338ca"]} style={{ width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="shield-outline" size={17} color="#fff" />
        </LinearGradient>
        <Text style={{ fontSize: 15, fontWeight: "800", color: titleColor, flex: 1 }}>{guide.title}</Text>
      </View>
      <Text style={{ fontSize: 12, color: mutedColor, marginBottom: 12, marginLeft: 44 }}>{guide.sub}</Text>

      <View style={{ height: 1, backgroundColor: borderColor, marginBottom: 4 }} />

      <Section icon="search-outline" title={guide.inspection.title} color="#38bdf8" defaultOpen C={C}>
        {renderItems(guide.inspection.items)}
      </Section>

      <View style={{ height: 1, backgroundColor: borderColor }} />

      <Section icon="document-text-outline" title={guide.documents.title} color="#22c55e" C={C}>
        {renderItems(guide.documents.items)}
      </Section>

      <View style={{ height: 1, backgroundColor: borderColor }} />

      <Section icon="swap-horizontal-outline" title={guide.mutation.title} color="#a78bfa" C={C}>
        {guide.mutation.steps.map((step, i) => (
          <View key={i} style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
            <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: "rgba(167,139,250,0.15)", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Text style={{ fontSize: 12, fontWeight: "900", color: "#a78bfa" }}>{step.num}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: titleColor, marginBottom: 2 }}>{step.title}</Text>
              <Text style={{ fontSize: 12, color: mutedColor, lineHeight: 18 }}>{step.body}</Text>
            </View>
          </View>
        ))}
        <View style={{ marginTop: 4, padding: 10, backgroundColor: "rgba(167,139,250,0.08)", borderRadius: 10, borderWidth: 1, borderColor: "rgba(167,139,250,0.2)" }}>
          <Text style={{ fontSize: 12, color: labelColor }}>
            {"💡 "}<Text style={{ fontWeight: "700", color: "#a78bfa" }}>{guide.mutation.costLabel}</Text>{" "}{guide.mutation.costAfter}
          </Text>
        </View>
      </Section>
    </View>
  );
}

const { width } = Dimensions.get("window");

export default function CarDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { auth } = useAuth();
  const { lang } = useAppLang();
  const { colors: C } = useTheme();
  const s = useMemo(() => createCarDetailStyles(C), [C]);
  const router = useRouter();
  const t = lang === "fr" ? fr : en;

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    getSaleById(id)
      .then(({ data }) => setCar(data))
      .catch(() => Alert.alert("Error", "Failed to load car"))
      .finally(() => setLoading(false));
    if (auth) {
      getFavorites().then(({ data }) => setIsFav(Array.isArray(data) && data.some((f) => String(f._id || f) === String(id)))).catch(() => {});
    }
  }, [id]);

  const toggleFav = async () => {
    if (!auth) return Alert.alert(t.favLogin);
    try {
      if (isFav) { await removeFavorite(id); setIsFav(false); }
      else { await addFavorite(id); setIsFav(true); }
    } catch { Alert.alert(t.favFail); }
  };

  const contactSeller = async () => {
    if (!auth) return Alert.alert(t.signInContact);
    const s = car?.sellerId || car?.seller;
    const sid = s?._id;
    if (!sid) return Alert.alert("Error", "Seller unavailable");
    setContacting(true);
    try {
      await startConversation({ recipientId: sid, listingId: id, listingModel: "SaleListing" });
      router.push("/(customer)/messages");
    } catch { Alert.alert("Failed to open conversation"); }
    setContacting(false);
  };

  if (loading) return <View style={s.center}><ActivityIndicator color={C.primary} size="large" /></View>;
  if (!car) return (
    <View style={s.center}>
      <Ionicons name="car-outline" size={56} color={C.muted} />
      <Text style={s.notFoundText}>{t.notFound}</Text>
    </View>
  );

  const seller = car.sellerId || car.seller;
  const images = car.images || [];

  return (
    <ScrollView style={{ flex:1, backgroundColor: C.bg }} showsVerticalScrollIndicator={false}>
      {/* Image gallery */}
      <View style={{ backgroundColor: C.surface }}>
        {images.length > 0 ? (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onScroll={e => setImgIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
            scrollEventThrottle={16}>
            {images.map((img, i) => {
              const uri = resolveMediaUrl(img);
              return uri ? (
                <Image key={i} source={{ uri }} style={{ width, height: 280 }} resizeMode="cover" />
              ) : null;
            })}
          </ScrollView>
        ) : (
          <View style={[{ width, height: 280 }, s.center]}>
            <Ionicons name="car-outline" size={72} color={C.muted} />
            <Text style={s.muted}>{t.noImage}</Text>
          </View>
        )}

        {images.length > 1 && (
          <View style={s.dotsRow}>
            {images.map((_, i) => (
              <View key={i} style={[s.dot, i === imgIndex ? s.dotActive : s.dotInactive]} />
            ))}
          </View>
        )}

        <FavoriteHeartButton active={isFav} onPress={toggleFav} size="lg" variant="overlay" style={s.favBtn} />

        {car.status === "sold" && (
          <View style={s.soldBadge}><Text style={s.badgeText}>SOLD</Text></View>
        )}
        {car.status === "approved" && (
          <View style={s.approvedBadge}>
            <Ionicons name="checkmark-circle" size={12} color="#fff" />
            <Text style={[s.badgeText, { marginLeft:4 }]}>{t.approved}</Text>
          </View>
        )}
      </View>

      <View style={s.body}>
        {/* Title & Price */}
        <View style={s.titleRow}>
          <Text style={s.title}>{car.title || `${car.brand} ${car.model}`}</Text>
          <Text style={s.price}>{car.price ? `${Number(car.price).toLocaleString()} MAD` : "—"}</Text>
        </View>
        <View style={s.metaRow}>
          <Ionicons name="location-outline" size={14} color={C.muted} />
          <Text style={s.metaText}>{car.city || t.unknownCity}</Text>
          <Text style={s.metaDot}>·</Text>
          <Text style={s.metaText}>{car.year || t.yearNA}</Text>
        </View>

        {/* Specs */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{t.specifications}</Text>
          <View style={s.specsGrid}>
            {[
              { icon:"business-outline", label:t.brand, value:car.brand },
              { icon:"car-outline", label:t.model, value:car.model },
              { icon:"calendar-outline", label:t.year, value:car.year },
              { icon:"speedometer-outline", label:t.mileage, value:car.mileage ? `${Number(car.mileage).toLocaleString()} ${t.km}` : null },
              { icon:"flame-outline", label:t.fuel, value:car.fuel },
              { icon:"settings-outline", label:t.gearbox, value:car.gearbox },
            ].filter(spec => spec.value).map(spec => (
              <View key={spec.label} style={s.specItem}>
                <View style={s.specLabelRow}>
                  <Ionicons name={spec.icon} size={13} color={C.muted} />
                  <Text style={s.specLabel}>{spec.label}</Text>
                </View>
                <Text style={s.specValue}>{spec.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Price Analysis */}
        <PriceAnalysisCard car={car} lang={lang} C={C} />

        {/* Description */}
        {car.description && (
          <View style={s.card}>
            <Text style={s.cardTitle}>{t.description}</Text>
            <Text style={s.descText}>{car.description}</Text>
          </View>
        )}

        {/* Buyer guide */}
        <BuyerGuideCard lang={lang} C={C} />

        {/* Seller */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{t.seller}</Text>
          <TouchableOpacity onPress={() => seller?._id && router.push(`/seller/${seller._id}`)} style={s.sellerRow}>
            <View style={s.sellerAvatar}>
              <Text style={s.sellerAvatarText}>{seller?.name?.[0]?.toUpperCase() || "?"}</Text>
            </View>
            <View style={{ flex:1 }}>
              <Text style={s.sellerName}>{seller?.name || t.unknownSeller}</Text>
              {seller?.nationalId?.verified ? (
                <View style={{ flexDirection:"row", alignItems:"center", marginTop:2 }}>
                  <Ionicons name="shield-checkmark" size={12} color={C.green} />
                  <Text style={s.verifiedText}>{t.verifiedSeller}</Text>
                </View>
              ) : (
                <View style={{ flexDirection:"row", alignItems:"center", marginTop:2 }}>
                  <Ionicons name="shield-outline" size={12} color="#64748b" />
                  <Text style={[s.verifiedText, { color:"#64748b" }]}>{lang === "fr" ? "Non vérifié" : "Unverified"}</Text>
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.muted} />
          </TouchableOpacity>
        </View>

        {/* Contact */}
        {auth ? (
          <View style={s.actionsGap}>
            {seller?.phone && (
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${seller.phone}`)} style={s.callBtn}>
                <Ionicons name="call" size={18} color="#fff" />
                <Text style={s.actionBtnText}>{t.callSeller}</Text>
              </TouchableOpacity>
            )}
            {seller?.phone && (
              <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/${seller.phone}`)} style={s.waBtn}>
                <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                <Text style={s.actionBtnText}>{t.whatsapp}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={contactSeller} disabled={contacting} style={[s.msgBtn, contacting && { opacity:0.7 }]}>
              <Ionicons name="chatbubble-outline" size={18} color={C.primary} />
              <Text style={s.msgBtnText}>{contacting ? "Opening…" : lang === "fr" ? "Envoyer un message" : "Send Message"}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[s.card, s.loginPrompt]}>
            <Ionicons name="lock-closed-outline" size={28} color={C.muted} />
            <Text style={s.loginPromptText}>
              <Text style={s.loginLink} onPress={() => router.push("/(auth)/login")}>{t.signInContact}</Text>
              {" "}{t.signInContactRest}
            </Text>
          </View>
        )}

        <ReviewSection targetModel="SaleListing" targetId={id} />
      </View>
    </ScrollView>
  );
}

const en = {
  notFound:"Vehicle not found.", noImage:"No image available",
  specifications:"Specifications", brand:"Brand", model:"Model",
  year:"Year", mileage:"Mileage", fuel:"Fuel", gearbox:"Gearbox",
  description:"Description", approved:"Approved", seller:"Seller",
  unknownSeller:"Unknown Seller", verifiedSeller:"Verified Seller",
  callSeller:"Call Seller", whatsapp:"WhatsApp",
  signInContact:"Sign in", signInContactRest:"to contact the seller.",
  km:"km", unknownCity:"Unknown city", yearNA:"Year N/A",
  favLogin:"Please login to save favorites", favFail:"Failed to update favorites",
};
const fr = {
  notFound:"Véhicule introuvable.", noImage:"Aucune image",
  specifications:"Caractéristiques", brand:"Marque", model:"Modèle",
  year:"Année", mileage:"Kilométrage", fuel:"Carburant", gearbox:"Boîte",
  description:"Description", approved:"Approuvée", seller:"Vendeur",
  unknownSeller:"Vendeur inconnu", verifiedSeller:"Vendeur vérifié",
  callSeller:"Appeler", whatsapp:"WhatsApp",
  signInContact:"Connectez-vous", signInContactRest:"pour contacter le vendeur.",
  km:"km", unknownCity:"Ville inconnue", yearNA:"Année N/A",
  favLogin:"Connectez-vous pour sauvegarder", favFail:"Impossible de mettre à jour",
};

function createCarDetailStyles(C) {
  return StyleSheet.create({
    center: { flex:1, alignItems:"center", justifyContent:"center", padding:24, backgroundColor: C.bg },
    notFoundText: { color: C.white, fontWeight:"700", fontSize:18, marginTop:16 },
    muted: { color: C.muted, marginTop:8 },
    dotsRow: { position:"absolute", bottom:12, left:0, right:0, flexDirection:"row", justifyContent:"center", gap:6 },
    dot: { borderRadius:4 },
    dotActive: { width:16, height:8, backgroundColor: C.primary },
    dotInactive: { width:8, height:8, backgroundColor:"rgba(255,255,255,0.4)" },
    favBtn: { position: "absolute", top: 14, right: 14, zIndex: 12 },
    soldBadge: { position:"absolute", top:16, left:16, backgroundColor:"#dc2626", borderRadius:20, paddingHorizontal:12, paddingVertical:4 },
    approvedBadge: { position:"absolute", top:16, left:16, backgroundColor:"rgba(22,163,74,0.9)", borderRadius:20, paddingHorizontal:12, paddingVertical:4, flexDirection:"row", alignItems:"center" },
    badgeText: { color:"#fff", fontSize:12, fontWeight:"700" },
    body: { paddingHorizontal:16, paddingVertical:24 },
    titleRow: { flexDirection:"row", alignItems:"flex-start", justifyContent:"space-between", marginBottom:8 },
    title: { color: C.white, fontWeight:"700", fontSize:22, flex:1, marginRight:8 },
    price: { color: C.primary, fontWeight:"700", fontSize:20 },
    metaRow: { flexDirection:"row", alignItems:"center", marginBottom:16 },
    metaText: { color: C.muted, fontSize:13, marginLeft:4 },
    metaDot: { color: C.muted, marginHorizontal:8 },
    card: { backgroundColor: C.card, borderWidth:1, borderColor: C.border, borderRadius:16, padding:16, marginBottom:16 },
    cardTitle: { color: C.white, fontWeight:"700", fontSize:15, marginBottom:12 },
    specsGrid: { flexDirection:"row", flexWrap:"wrap", gap:12 },
    specItem: { backgroundColor: C.surface, borderWidth:1, borderColor: C.border, borderRadius:12, paddingHorizontal:12, paddingVertical:10, width:"47%" },
    specLabelRow: { flexDirection:"row", alignItems:"center", marginBottom:4 },
    specLabel: { color: C.muted, fontSize:11, marginLeft:4 },
    specValue: { color: C.white, fontWeight:"500", fontSize:13 },
    descText: { color: C.slate, fontSize:13, lineHeight:20 },
    sellerRow: { flexDirection:"row", alignItems:"center" },
    sellerAvatar: { width:48, height:48, borderRadius:24, backgroundColor: C.pillBg, alignItems:"center", justifyContent:"center", marginRight:12 },
    sellerAvatarText: { color: C.primary, fontWeight:"700", fontSize:18 },
    sellerName: { color: C.white, fontWeight:"700" },
    verifiedText: { color: C.green, fontSize:12, marginLeft:4 },
    actionsGap: { gap:12, marginBottom:24 },
    callBtn: { backgroundColor:"#16a34a", borderRadius:12, paddingVertical:16, flexDirection:"row", alignItems:"center", justifyContent:"center" },
    waBtn: { backgroundColor:"#25d366", borderRadius:12, paddingVertical:16, flexDirection:"row", alignItems:"center", justifyContent:"center" },
    msgBtn: { backgroundColor: C.pillBg, borderWidth:1, borderColor: C.pillBorder, borderRadius:12, paddingVertical:16, flexDirection:"row", alignItems:"center", justifyContent:"center" },
    actionBtnText: { color:"#fff", fontWeight:"700", marginLeft:8 },
    msgBtnText: { color: C.primary, fontWeight:"700", marginLeft:8 },
    loginPrompt: { alignItems:"center", marginBottom:24 },
    loginPromptText: { color: C.slate, fontSize:13, textAlign:"center", marginTop:8 },
    loginLink: { color: C.primary, fontWeight:"700" },
  });
}
