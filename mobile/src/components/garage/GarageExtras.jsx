import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { tierColor } from "../../utils/garageStatus";

const SERVICE_TYPES = [
  { id: "oil_change", icon: "water-outline", fr: "Vidange", en: "Oil change" },
  { id: "tires", icon: "disc-outline", fr: "Pneus", en: "Tyres" },
  { id: "brakes", icon: "stop-circle-outline", fr: "Freins", en: "Brakes" },
  { id: "repair", icon: "hammer-outline", fr: "Réparation", en: "Repair" },
  { id: "inspection", icon: "clipboard-outline", fr: "Contrôle", en: "Inspection" },
  { id: "other", icon: "ellipsis-horizontal", fr: "Autre", en: "Other" },
];

export function GarageMileageCard({ car, fr, accent, isDark, onBump, saving }) {
  const last = car.lastMileageAt
    ? new Date(car.lastMileageAt).toLocaleDateString(fr ? "fr-FR" : "en-GB", { day: "numeric", month: "short" })
    : null;

  return (
    <View
      style={[
        ex.mileageCard,
        {
          backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.07)",
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[ex.mileageTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
          {fr ? "Kilométrage actuel" : "Current mileage"}
        </Text>
        <Text style={[ex.mileageValue, { color: accent }]}>
          {(car.currentMileage || 0).toLocaleString()} km
        </Text>
        {last ? (
          <Text style={[ex.mileageSub, { color: isDark ? "#64748b" : "#94a3b8" }]}>
            {fr ? `Mis à jour le ${last}` : `Updated ${last}`}
          </Text>
        ) : (
          <Text style={[ex.mileageSub, { color: isDark ? "#64748b" : "#94a3b8" }]}>
            {fr ? "Tapez un bouton pour suivre vos km" : "Tap a button to track km"}
          </Text>
        )}
      </View>
      <View style={ex.bumpRow}>
        {[100, 500, 1000].map((km) => (
          <TouchableOpacity
            key={km}
            disabled={saving}
            onPress={() => onBump(km)}
            activeOpacity={0.85}
            style={[ex.bumpBtn, { borderColor: `${accent}44`, backgroundColor: `${accent}14` }]}
          >
            {saving ? (
              <ActivityIndicator size="small" color={accent} />
            ) : (
              <Text style={[ex.bumpText, { color: accent }]}>+{km}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function GarageRemindersToggle({ enabled, fr, accent, isDark, onToggle }) {
  return (
    <View
      style={[
        ex.reminderRow,
        {
          backgroundColor: isDark ? "rgba(124,107,255,0.08)" : "rgba(98,72,232,0.06)",
          borderColor: isDark ? "rgba(124,107,255,0.2)" : "rgba(98,72,232,0.15)",
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[ex.reminderTitle, { color: isDark ? "#f1f5f9" : "#0f172a" }]}>
          {fr ? "Rappels sur votre téléphone" : "Phone reminders"}
        </Text>
        <Text style={[ex.reminderSub, { color: isDark ? "#94a3b8" : "#64748b" }]}>
          {fr ? "On vous prévient 7 j et 1 j avant chaque échéance" : "We notify you 7 & 1 days before deadlines"}
        </Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: "#64748b", true: accent }}
        thumbColor="#fff"
      />
    </View>
  );
}

export function GarageTimelineSection({ buckets, fr, accent, isDark, onItemPress }) {
  if (!buckets?.length) {
    return (
      <View style={[ex.emptyTimeline, { borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.06)" }]}>
        <Text style={{ fontSize: 28, marginBottom: 8 }}>🎉</Text>
        <Text style={{ color: isDark ? "#94a3b8" : "#64748b", fontWeight: "700", textAlign: "center" }}>
          {fr ? "Rien d'urgent dans les 30 prochains jours" : "Nothing urgent in the next 30 days"}
        </Text>
      </View>
    );
  }

  return (
    <View style={ex.timelineWrap}>
      {buckets.map((bucket) => (
        <View key={bucket.key} style={{ marginBottom: 16 }}>
          <View style={ex.bucketHead}>
            <Text style={ex.bucketEmoji}>{bucket.emoji}</Text>
            <Text style={[ex.bucketLabel, { color: accent }]}>{bucket.label}</Text>
          </View>
          {bucket.events.map((ev, idx) => {
            const color = tierColor(ev.tier, { green: "#22c55e" });
            const isLast = idx === bucket.events.length - 1;
            return (
              <TouchableOpacity key={ev.id} onPress={() => onItemPress?.(ev)} activeOpacity={0.85}>
                <View style={ex.timelineRow}>
                  <View style={ex.timelineRail}>
                    <View style={[ex.timelineDot, { backgroundColor: color, borderColor: `${color}55` }]} />
                    {!isLast ? <View style={[ex.timelineLine, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)" }]} /> : null}
                  </View>
                  <View
                    style={[
                      ex.timelineCard,
                      {
                        backgroundColor: isDark ? "rgba(255,255,255,0.035)" : "#fff",
                        borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.06)",
                      },
                    ]}
                  >
                    <View style={[ex.timelineIcon, { backgroundColor: `${ev.color}18` }]}>
                      <Ionicons name={ev.icon} size={16} color={ev.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[ex.timelineTitle, { color: isDark ? "#f1f5f9" : "#0f172a" }]}>{ev.label}</Text>
                      <Text style={[ex.timelineSub, { color: isDark ? "#64748b" : "#94a3b8" }]}>{ev.subtitle}</Text>
                    </View>
                    <View style={[ex.daysPill, { backgroundColor: `${color}18` }]}>
                      <Text style={[ex.daysPillText, { color }]}>
                        {ev.daysUntil <= 0 ? (fr ? "Now" : "Now") : `${ev.daysUntil}j`}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function GarageCostDashboard({ costs, fr, accent, isDark }) {
  return (
    <View>
      <LinearGradient
        colors={isDark ? [`${accent}22`, `${accent}08`] : [`${accent}14`, `${accent}05`]}
        style={[ex.costHero, { borderColor: isDark ? `${accent}35` : `${accent}25` }]}
      >
        <Text style={[ex.costEyebrow, { color: accent }]}>{fr ? "COÛT MENSUEL ESTIMÉ" : "EST. MONTHLY COST"}</Text>
        <Text style={[ex.costBig, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
          {costs.perMonth.toLocaleString()} <Text style={{ fontSize: 18, fontWeight: "700" }}>MAD</Text>
        </Text>
        <Text style={[ex.costFun, { color: isDark ? "#94a3b8" : "#64748b" }]}>{costs.funFact}</Text>
      </LinearGradient>
      <View style={ex.costGrid}>
        {costs.breakdown.map((row) => (
          <View
            key={row.key}
            style={[
              ex.costTile,
              {
                backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff",
                borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.06)",
              },
            ]}
          >
            <Ionicons name={row.icon} size={18} color={row.color} />
            <Text style={[ex.costTileVal, { color: isDark ? "#f1f5f9" : "#0f172a" }]}>
              {row.value.toLocaleString()} MAD
            </Text>
            <Text style={[ex.costTileLbl, { color: isDark ? "#64748b" : "#94a3b8" }]} numberOfLines={2}>
              {row.label}
            </Text>
          </View>
        ))}
      </View>
      <Text style={[ex.costNote, { color: isDark ? "#64748b" : "#94a3b8" }]}>
        {fr
          ? `${costs.logsCount} entrée(s) d'entretien cette année — ajoutez chaque facture pour un suivi précis.`
          : `${costs.logsCount} service entries this year — add each receipt for accurate tracking.`}
      </Text>
    </View>
  );
}

export function GarageServiceLogSection({ logs, fr, accent, isDark, onAdd, onDelete }) {
  return (
    <View>
      <TouchableOpacity onPress={onAdd} activeOpacity={0.88}>
        <LinearGradient colors={[accent, isDark ? "#0ea5e9" : "#0369a1"]} style={ex.addLogBtn}>
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={ex.addLogText}>{fr ? "Ajouter un entretien (facile)" : "Add service (quick)"}</Text>
        </LinearGradient>
      </TouchableOpacity>
      {!logs?.length ? (
        <Text style={[ex.noLogs, { color: isDark ? "#64748b" : "#94a3b8" }]}>
          {fr ? "Vide pour l'instant — votre premier entretien ici ?" : "Empty — add your first service?"}
        </Text>
      ) : (
        logs.slice(0, 6).map((log) => (
          <View
            key={log._id}
            style={[
              ex.logRow,
              {
                backgroundColor: isDark ? "rgba(255,255,255,0.035)" : "#fff",
                borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.06)",
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[ex.logTitle, { color: isDark ? "#f1f5f9" : "#0f172a" }]}>{log.title}</Text>
              <Text style={[ex.logMeta, { color: isDark ? "#64748b" : "#94a3b8" }]}>
                {new Date(log.date).toLocaleDateString(fr ? "fr-FR" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}
                {log.provider ? ` · ${log.provider}` : ""}
              </Text>
            </View>
            <Text style={[ex.logCost, { color: accent }]}>{Number(log.cost || 0).toLocaleString()} MAD</Text>
            <TouchableOpacity onPress={() => onDelete(log)} hitSlop={12} style={{ marginLeft: 8 }}>
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
}

export function AddServiceLogModal({ visible, fr, accent, isDark, car, onClose, onSave, saving }) {
  const [type, setType] = useState("oil_change");
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState("");
  const [provider, setProvider] = useState("");
  const [mileage, setMileage] = useState(car?.currentMileage ? String(car.currentMileage) : "");

  const pickType = (t) => {
    setType(t.id);
    if (!title) setTitle(fr ? t.fr : t.en);
  };

  const submit = () => {
    const t = title.trim() || (fr ? "Entretien" : "Service");
    onSave({
      type,
      title: t,
      date: new Date().toISOString(),
      cost: parseFloat(cost) || 0,
      provider: provider.trim(),
      mileage: mileage ? parseInt(mileage, 10) : null,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={ex.modalOverlay}>
        <View style={[ex.modalSheet, { backgroundColor: isDark ? "#0f172a" : "#fff" }]}>
          <View style={ex.modalHandle} />
          <Text style={[ex.modalTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
            {fr ? "Nouvel entretien" : "New service"}
          </Text>
          <Text style={[ex.modalSub, { color: isDark ? "#94a3b8" : "#64748b" }]}>
            {fr ? "30 secondes — comme envoyer un WhatsApp" : "30 seconds — as easy as a message"}
          </Text>
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {SERVICE_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => pickType(t)}
                  style={[
                    ex.typeChip,
                    {
                      borderColor: type === t.id ? accent : isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)",
                      backgroundColor: type === t.id ? `${accent}22` : "transparent",
                    },
                  ]}
                >
                  <Ionicons name={t.icon} size={16} color={type === t.id ? accent : isDark ? "#94a3b8" : "#64748b"} />
                  <Text style={{ fontSize: 12, fontWeight: "700", color: type === t.id ? accent : isDark ? "#94a3b8" : "#64748b" }}>
                    {fr ? t.fr : t.en}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={fr ? "Ex: Vidange chez Total" : "e.g. Oil change at garage"}
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              style={[ex.input, { color: isDark ? "#f1f5f9" : "#0f172a", borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)" }]}
            />
            <TextInput
              value={cost}
              onChangeText={setCost}
              keyboardType="numeric"
              placeholder={fr ? "Coût (MAD)" : "Cost (MAD)"}
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              style={[ex.input, { color: isDark ? "#f1f5f9" : "#0f172a", borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)" }]}
            />
            <TextInput
              value={provider}
              onChangeText={setProvider}
              placeholder={fr ? "Garage / ville (optionnel)" : "Shop / city (optional)"}
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              style={[ex.input, { color: isDark ? "#f1f5f9" : "#0f172a", borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)" }]}
            />
            <TextInput
              value={mileage}
              onChangeText={setMileage}
              keyboardType="numeric"
              placeholder={fr ? "Km au compteur" : "Odometer km"}
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              style={[ex.input, { color: isDark ? "#f1f5f9" : "#0f172a", borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)" }]}
            />
          </ScrollView>
          <TouchableOpacity disabled={saving} onPress={submit} activeOpacity={0.88} style={{ marginTop: 12 }}>
            <LinearGradient colors={[accent, isDark ? "#0284c7" : "#0369a1"]} style={ex.modalSave}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={ex.modalSaveText}>{fr ? "Enregistrer" : "Save"}</Text>}
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ paddingVertical: 14 }}>
            <Text style={{ textAlign: "center", color: isDark ? "#94a3b8" : "#64748b", fontWeight: "600" }}>
              {fr ? "Plus tard" : "Later"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const ex = StyleSheet.create({
  mileageCard: { borderRadius: 20, borderWidth: 1, padding: 18, marginBottom: 16 },
  mileageTitle: { fontSize: 12, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" },
  mileageValue: { fontSize: 28, fontWeight: "900", letterSpacing: -0.5, marginTop: 4 },
  mileageSub: { fontSize: 12, marginTop: 4, fontWeight: "500" },
  bumpRow: { flexDirection: "row", gap: 8, marginTop: 14 },
  bumpBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, borderWidth: 1, alignItems: "center" },
  bumpText: { fontSize: 14, fontWeight: "800" },
  reminderRow: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 20 },
  reminderTitle: { fontSize: 15, fontWeight: "800" },
  reminderSub: { fontSize: 12, marginTop: 4, lineHeight: 17 },
  emptyTimeline: { padding: 28, borderRadius: 18, borderWidth: 1, alignItems: "center" },
  timelineWrap: { marginTop: 8 },
  bucketHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  bucketEmoji: { fontSize: 18 },
  bucketLabel: { fontSize: 12, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase" },
  timelineRow: { flexDirection: "row", marginBottom: 4 },
  timelineRail: { width: 24, alignItems: "center" },
  timelineDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  timelineLine: { flex: 1, width: 2, marginTop: 2 },
  timelineCard: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 16, borderWidth: 1, marginBottom: 8, marginLeft: 8 },
  timelineIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  timelineTitle: { fontSize: 14, fontWeight: "800" },
  timelineSub: { fontSize: 11, marginTop: 2 },
  daysPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  daysPillText: { fontSize: 11, fontWeight: "900" },
  costHero: { borderRadius: 20, padding: 20, borderWidth: 1, marginBottom: 12 },
  costEyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  costBig: { fontSize: 36, fontWeight: "900", letterSpacing: -1, marginTop: 6 },
  costFun: { fontSize: 13, marginTop: 10, lineHeight: 19, fontWeight: "500" },
  costGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  costTile: { width: "31%", flexGrow: 1, minWidth: 100, padding: 12, borderRadius: 16, borderWidth: 1, gap: 6 },
  costTileVal: { fontSize: 15, fontWeight: "900" },
  costTileLbl: { fontSize: 10, fontWeight: "600" },
  costNote: { fontSize: 11, marginTop: 12, lineHeight: 16 },
  addLogBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 16, marginBottom: 14 },
  addLogText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  noLogs: { textAlign: "center", paddingVertical: 16, fontWeight: "600" },
  logRow: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 8 },
  logTitle: { fontSize: 14, fontWeight: "800" },
  logMeta: { fontSize: 11, marginTop: 2 },
  logCost: { fontSize: 14, fontWeight: "900" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 32 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(128,128,128,0.4)", alignSelf: "center", marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: "900", letterSpacing: -0.3 },
  modalSub: { fontSize: 13, marginTop: 4, marginBottom: 16 },
  typeChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 10, fontWeight: "600" },
  modalSave: { borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  modalSaveText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
