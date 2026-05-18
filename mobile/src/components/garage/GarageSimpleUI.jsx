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
import { tierColor, trackStatusLabel, formatTrackDate } from "../../utils/garageStatus";

const TABS = [
  { id: "today", fr: "À faire", en: "To do", icon: "today-outline" },
  { id: "car", fr: "Ma voiture", en: "My car", icon: "car-outline" },
  { id: "more", fr: "Plus", en: "More", icon: "grid-outline" },
];

export function GarageTabBar({ active, fr, accent, isDark, onChange }) {
  return (
    <View style={[ui.tabBar, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.05)" }]}>
      {TABS.map((tab) => {
        const on = active === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onChange(tab.id)}
            activeOpacity={0.85}
            style={[ui.tab, on && { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#fff" }]}
          >
            <Ionicons name={tab.icon} size={18} color={on ? accent : isDark ? "#64748b" : "#94a3b8"} />
            <Text style={[ui.tabLabel, { color: on ? accent : isDark ? "#94a3b8" : "#64748b", fontWeight: on ? "800" : "600" }]}>
              {fr ? tab.fr : tab.en}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/** Plain-language status for everyone */
export function GarageStatusCard({ alertCount, nextDue, fr, isDark, onFix }) {
  const urgent = alertCount > 0;
  return (
    <View
      style={[
        ui.statusCard,
        {
          backgroundColor: urgent
            ? isDark ? "rgba(239,68,68,0.12)" : "#fef2f2"
            : isDark ? "rgba(34,197,94,0.1)" : "#f0fdf4",
          borderColor: urgent ? "rgba(239,68,68,0.35)" : "rgba(34,197,94,0.35)",
        },
      ]}
    >
      <Ionicons name={urgent ? "alert-circle" : "checkmark-circle"} size={28} color={urgent ? "#ef4444" : "#22c55e"} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[ui.statusTitle, { color: isDark ? "#f1f5f9" : "#0f172a" }]}>
          {urgent
            ? fr
              ? `${alertCount} chose${alertCount > 1 ? "s" : ""} à renouveler`
              : `${alertCount} thing${alertCount > 1 ? "s" : ""} to renew`
            : fr
              ? "Tout va bien pour l'instant"
              : "You're all good for now"}
        </Text>
        <Text style={[ui.statusSub, { color: isDark ? "#94a3b8" : "#64748b" }]}>
          {urgent && nextDue
            ? fr
              ? `En premier : ${nextDue.label} (${nextDue.status})`
              : `First up: ${nextDue.label} (${nextDue.status})`
            : fr
              ? "On vous préviendra avant chaque échéance."
              : "We'll remind you before each deadline."}
        </Text>
      </View>
      {urgent ? (
        <TouchableOpacity onPress={onFix} style={[ui.statusBtn, { backgroundColor: "#ef4444" }]}>
          <Text style={ui.statusBtnText}>{fr ? "Voir" : "View"}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

/** Simple flat to-do list (no timeline rails) */
export function GarageTodoList({ events, fr, isDark, onPress }) {
  if (!events?.length) {
    return (
      <View style={[ui.emptyBox, { borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)" }]}>
        <Ionicons name="happy-outline" size={32} color="#22c55e" />
        <Text style={[ui.emptyText, { color: isDark ? "#94a3b8" : "#64748b" }]}>
          {fr ? "Rien d'urgent ce mois-ci." : "Nothing urgent this month."}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 8 }}>
      {events.map((ev) => {
        const color = tierColor(ev.tier, { green: "#22c55e" });
        return (
          <TouchableOpacity
            key={ev.id}
            onPress={() => onPress?.(ev)}
            activeOpacity={0.85}
            style={[
              ui.todoRow,
              {
                backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
              },
            ]}
          >
            <View style={[ui.todoDot, { backgroundColor: color }]} />
            <View style={{ flex: 1 }}>
              <Text style={[ui.todoTitle, { color: isDark ? "#f1f5f9" : "#0f172a" }]}>{ev.label}</Text>
              <Text style={[ui.todoSub, { color: isDark ? "#64748b" : "#94a3b8" }]}>{ev.subtitle}</Text>
            </View>
            <Text style={[ui.todoWhen, { color }]}>
              {ev.daysUntil <= 0 ? (fr ? "Maintenant" : "Now") : fr ? `Dans ${ev.daysUntil} j` : `In ${ev.daysUntil}d`}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={isDark ? "#475569" : "#cbd5e1"} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function GarageSimpleRow({ item, fr, isDark, onPress }) {
  const color = tierColor(item.tier, { green: "#22c55e", muted: "#94a3b8" });
  const status = trackStatusLabel(item.value, item.type, fr);
  const sub =
    item.type === "km"
      ? fr
        ? `Prochaine vidange vers ${Number(item.expiry || 0).toLocaleString()} km`
        : `Next oil change around ${Number(item.expiry || 0).toLocaleString()} km`
      : item.expiry
        ? fr
          ? `Expire le ${formatTrackDate(item.expiry, fr)}`
          : `Expires ${formatTrackDate(item.expiry, fr)}`
        : fr
          ? "Date non renseignée — appuyez pour ajouter"
          : "No date yet — tap to add";

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[ui.simpleRow, { borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)" }]}>
      <Ionicons name={item.icon} size={22} color={item.color} style={{ width: 28 }} />
      <View style={{ flex: 1 }}>
        <Text style={[ui.simpleTitle, { color: isDark ? "#f1f5f9" : "#0f172a" }]}>{item.label}</Text>
        <Text style={[ui.simpleSub, { color: isDark ? "#64748b" : "#94a3b8" }]}>{sub}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={[ui.simpleStatus, { color }]}>{status}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function GarageGroupCard({ title, subtitle, icon, children, isDark }) {
  return (
    <View style={[ui.groupCard, { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff", borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)" }]}>
      <View style={ui.groupHead}>
        <Ionicons name={icon} size={20} color={isDark ? "#94a3b8" : "#64748b"} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[ui.groupTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>{title}</Text>
          {subtitle ? <Text style={[ui.groupSub, { color: isDark ? "#64748b" : "#94a3b8" }]}>{subtitle}</Text> : null}
        </View>
      </View>
      <View style={{ marginTop: 4 }}>{children}</View>
    </View>
  );
}

export function GarageMileageSimple({ car, fr, accent, isDark, onBump, saving }) {
  return (
    <View style={[ui.groupCard, { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff", borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)" }]}>
      <Text style={[ui.groupTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
        {fr ? "Kilométrage du compteur" : "Odometer"}
      </Text>
      <Text style={[ui.kmBig, { color: accent }]}>{(car.currentMileage || 0).toLocaleString()} km</Text>
      <Text style={[ui.groupSub, { color: isDark ? "#64748b" : "#94a3b8", marginBottom: 12 }]}>
        {fr ? "Appuyez si vous avez roulé récemment :" : "Tap if you drove recently:"}
      </Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[100, 500, 1000].map((km) => (
          <TouchableOpacity
            key={km}
            disabled={saving}
            onPress={() => onBump(km)}
            style={[ui.kmBtn, { borderColor: accent, backgroundColor: `${accent}12` }]}
          >
            {saving ? <ActivityIndicator color={accent} /> : <Text style={{ color: accent, fontWeight: "800" }}>+{km} km</Text>}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function GarageRemindersSimple({ enabled, fr, accent, isDark, onToggle }) {
  return (
    <View style={[ui.reminderSimple, { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff", borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)" }]}>
      <Ionicons name="notifications-outline" size={22} color={accent} />
      <Text style={[ui.reminderSimpleText, { color: isDark ? "#f1f5f9" : "#0f172a", flex: 1, marginLeft: 10 }]}>
        {fr ? "Me rappeler avant les échéances" : "Remind me before deadlines"}
      </Text>
      <Switch value={enabled} onValueChange={onToggle} trackColor={{ false: "#cbd5e1", true: accent }} />
    </View>
  );
}

export function GarageActionGrid({ actions, isDark }) {
  return (
    <View style={ui.actionGrid}>
      {actions.map((a) => (
        <TouchableOpacity key={a.key} onPress={a.onPress} activeOpacity={0.88} style={[ui.actionCell, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#fff", borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)" }]}>
          <View style={[ui.actionIcon, { backgroundColor: `${a.color}18` }]}>
            <Ionicons name={a.icon} size={22} color={a.color} />
          </View>
          <Text style={[ui.actionLabel, { color: isDark ? "#f1f5f9" : "#0f172a" }]}>{a.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function GarageBudgetSimple({ costs, fr, isDark, accent }) {
  return (
    <View style={[ui.groupCard, { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff", borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)" }]}>
      <Text style={[ui.groupTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
        {fr ? "Dépenses estimées" : "Estimated spending"}
      </Text>
      <Text style={[ui.kmBig, { color: accent, marginVertical: 8 }]}>
        ~{costs.perMonth.toLocaleString()} MAD
        <Text style={{ fontSize: 16, fontWeight: "600" }}> {fr ? "/ mois" : "/ month"}</Text>
      </Text>
      {costs.breakdown.map((row) => (
        <View key={row.key} style={ui.budgetRow}>
          <Text style={{ color: isDark ? "#94a3b8" : "#64748b", flex: 1, fontSize: 14 }}>{row.label}</Text>
          <Text style={{ color: isDark ? "#f1f5f9" : "#0f172a", fontWeight: "800", fontSize: 14 }}>{row.value.toLocaleString()} MAD</Text>
        </View>
      ))}
      <Text style={{ color: isDark ? "#64748b" : "#94a3b8", fontSize: 12, marginTop: 10, lineHeight: 18 }}>{costs.funFact}</Text>
    </View>
  );
}

export function GarageServiceSimple({ logs, fr, accent, isDark, onAdd, onDelete }) {
  return (
    <View style={[ui.groupCard, { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff", borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)" }]}>
      <Text style={[ui.groupTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
        {fr ? "Historique d'entretien" : "Service history"}
      </Text>
      <Text style={[ui.groupSub, { color: isDark ? "#64748b" : "#94a3b8", marginBottom: 12 }]}>
        {fr ? "Garage, vidange, réparations…" : "Garage, oil change, repairs…"}
      </Text>
      <TouchableOpacity onPress={onAdd} style={[ui.addBtn, { backgroundColor: accent }]}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={ui.addBtnText}>{fr ? "Ajouter une ligne" : "Add entry"}</Text>
      </TouchableOpacity>
      {!logs?.length ? (
        <Text style={{ textAlign: "center", color: isDark ? "#64748b" : "#94a3b8", marginTop: 16, fontSize: 14 }}>
          {fr ? "Aucun entretien enregistré." : "No services logged yet."}
        </Text>
      ) : (
        logs.slice(0, 8).map((log) => (
          <View key={log._id} style={[ui.logLine, { borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)" }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: isDark ? "#f1f5f9" : "#0f172a", fontWeight: "700", fontSize: 14 }}>{log.title}</Text>
              <Text style={{ color: isDark ? "#64748b" : "#94a3b8", fontSize: 12, marginTop: 2 }}>
                {new Date(log.date).toLocaleDateString(fr ? "fr-FR" : "en-GB")}
              </Text>
            </View>
            <Text style={{ color: accent, fontWeight: "800", marginRight: 8 }}>{Number(log.cost || 0).toLocaleString()} MAD</Text>
            <TouchableOpacity onPress={() => onDelete(log)} hitSlop={12}>
              <Ionicons name="close-circle-outline" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
}

export function GarageTipsSimple({ tips, fr, isDark, onEstimate }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? tips : tips.slice(0, 2);
  if (!tips.length) return null;

  return (
    <View style={[ui.groupCard, { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff", borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)" }]}>
      <Text style={[ui.groupTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
        {fr ? "Conseils pour votre voiture" : "Tips for your car"}
      </Text>
      {shown.map((rec, i) => (
        <TouchableOpacity
          key={i}
          disabled={!rec.action}
          onPress={rec.action === "estimate" ? onEstimate : undefined}
          style={[ui.tipRow, { borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)" }]}
        >
          <Ionicons name={rec.icon} size={20} color={rec.color} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ color: isDark ? "#f1f5f9" : "#0f172a", fontWeight: "700", fontSize: 14 }}>{rec.title}</Text>
            <Text style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: 13, marginTop: 4, lineHeight: 18 }}>{rec.body}</Text>
          </View>
        </TouchableOpacity>
      ))}
      {tips.length > 2 ? (
        <TouchableOpacity onPress={() => setExpanded(!expanded)} style={{ paddingVertical: 12 }}>
          <Text style={{ color: isDark ? "#38bdf8" : "#0284c7", fontWeight: "700", textAlign: "center" }}>
            {expanded ? (fr ? "Moins" : "Less") : fr ? `Voir ${tips.length - 2} autres conseils` : `See ${tips.length - 2} more tips`}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const SERVICE_TYPES = [
  { id: "oil_change", icon: "water-outline", fr: "Vidange", en: "Oil change" },
  { id: "tires", icon: "disc-outline", fr: "Pneus", en: "Tyres" },
  { id: "brakes", icon: "stop-circle-outline", fr: "Freins", en: "Brakes" },
  { id: "repair", icon: "hammer-outline", fr: "Réparation", en: "Repair" },
  { id: "other", icon: "ellipsis-horizontal", fr: "Autre", en: "Other" },
];

export function AddServiceLogModal({ visible, fr, accent, isDark, car, onClose, onSave, saving }) {
  const [type, setType] = useState("oil_change");
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState("");
  const [provider, setProvider] = useState("");

  const submit = () => {
    const t = title.trim() || (fr ? "Entretien" : "Service");
    onSave({
      type,
      title: t,
      date: new Date().toISOString(),
      cost: parseFloat(cost) || 0,
      provider: provider.trim(),
      mileage: car?.currentMileage ?? null,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={ui.modalOverlay}>
        <View style={[ui.modalSheet, { backgroundColor: isDark ? "#0f172a" : "#fff" }]}>
          <Text style={[ui.modalTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]}>
            {fr ? "Ajouter un entretien" : "Add service"}
          </Text>
          <Text style={{ color: isDark ? "#94a3b8" : "#64748b", marginBottom: 16, fontSize: 14 }}>
            {fr ? "Exemple : Vidange chez Total, 450 MAD" : "e.g. Oil change at garage, 450 MAD"}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {SERVICE_TYPES.map((t) => (
              <TouchableOpacity
                key={t.id}
                onPress={() => {
                  setType(t.id);
                  if (!title) setTitle(fr ? t.fr : t.en);
                }}
                style={[ui.typeChip, type === t.id && { borderColor: accent, backgroundColor: `${accent}15` }]}
              >
                <Text style={{ fontWeight: "700", color: type === t.id ? accent : "#64748b", fontSize: 13 }}>{fr ? t.fr : t.en}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={fr ? "Qu'est-ce que vous avez fait ?" : "What did you do?"}
            placeholderTextColor="#94a3b8"
            style={[ui.input, { color: isDark ? "#fff" : "#0f172a", borderColor: isDark ? "rgba(255,255,255,0.15)" : "#e2e8f0" }]}
          />
          <TextInput
            value={cost}
            onChangeText={setCost}
            keyboardType="numeric"
            placeholder={fr ? "Montant en MAD" : "Amount in MAD"}
            placeholderTextColor="#94a3b8"
            style={[ui.input, { color: isDark ? "#fff" : "#0f172a", borderColor: isDark ? "rgba(255,255,255,0.15)" : "#e2e8f0" }]}
          />
          <TextInput
            value={provider}
            onChangeText={setProvider}
            placeholder={fr ? "Garage (optionnel)" : "Shop (optional)"}
            placeholderTextColor="#94a3b8"
            style={[ui.input, { color: isDark ? "#fff" : "#0f172a", borderColor: isDark ? "rgba(255,255,255,0.15)" : "#e2e8f0" }]}
          />
          <TouchableOpacity disabled={saving} onPress={submit} style={{ marginTop: 8 }}>
            <LinearGradient colors={[accent, isDark ? "#0284c7" : "#0369a1"]} style={ui.modalSave}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={ui.modalSaveText}>{fr ? "Enregistrer" : "Save"}</Text>}
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ padding: 16 }}>
            <Text style={{ textAlign: "center", color: "#64748b", fontWeight: "600" }}>{fr ? "Annuler" : "Cancel"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const ui = StyleSheet.create({
  tabBar: { flexDirection: "row", marginHorizontal: 20, marginTop: 12, borderRadius: 14, padding: 4 },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 12 },
  tabLabel: { fontSize: 13 },
  statusCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  statusTitle: { fontSize: 17, fontWeight: "800" },
  statusSub: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  statusBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  statusBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  emptyBox: { padding: 28, borderRadius: 16, borderWidth: 1, alignItems: "center", gap: 8 },
  emptyText: { fontSize: 15, fontWeight: "600", textAlign: "center" },
  todoRow: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, gap: 10 },
  todoDot: { width: 10, height: 10, borderRadius: 5 },
  todoTitle: { fontSize: 15, fontWeight: "700" },
  todoSub: { fontSize: 12, marginTop: 2 },
  todoWhen: { fontSize: 12, fontWeight: "800", marginRight: 4 },
  simpleRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, gap: 10 },
  simpleTitle: { fontSize: 15, fontWeight: "700" },
  simpleSub: { fontSize: 12, marginTop: 3, lineHeight: 17 },
  simpleStatus: { fontSize: 14, fontWeight: "800" },
  groupCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14 },
  groupHead: { flexDirection: "row", alignItems: "flex-start" },
  groupTitle: { fontSize: 17, fontWeight: "800" },
  groupSub: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  kmBig: { fontSize: 28, fontWeight: "900", marginVertical: 6 },
  kmBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, alignItems: "center" },
  reminderSimple: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 14 },
  reminderSimpleText: { fontSize: 15, fontWeight: "600" },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionCell: { width: "47%", padding: 16, borderRadius: 14, borderWidth: 1, alignItems: "center" },
  actionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  actionLabel: { fontSize: 13, fontWeight: "700", textAlign: "center" },
  budgetRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 12 },
  addBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  logLine: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderTopWidth: 1 },
  tipRow: { flexDirection: "row", paddingVertical: 14, borderTopWidth: 1 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 32 },
  modalTitle: { fontSize: 20, fontWeight: "900" },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#e2e8f0", marginRight: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 10 },
  modalSave: { borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  modalSaveText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
