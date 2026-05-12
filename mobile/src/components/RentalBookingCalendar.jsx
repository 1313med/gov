import { useMemo, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";

/** YYYY-MM-DD → UTC midnight ms (same convention as rental detail billing). */
function utcMillisFromYmd(str) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (!m) return NaN;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function ymdFromUtcMs(ms) {
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

function todayUtcYmd() {
  const n = new Date();
  return ymdFromUtcMs(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
}

/** First weekday (0=Sun … 6=Sat) of UTC month. */
function utcFirstWeekday(year, month0) {
  return new Date(Date.UTC(year, month0, 1)).getUTCDay();
}

function createStyles(C) {
  return StyleSheet.create({
    wrap: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: C.border,
      overflow: "hidden",
      backgroundColor: C.surface,
    },
    gradientBar: { height: 3, width: "100%" },
    head: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
      backgroundColor: C.card,
    },
    monthLabel: { color: C.white, fontWeight: "800", fontSize: 15, letterSpacing: 0.2 },
    navBtn: { padding: 8, borderRadius: 10, backgroundColor: C.surface },
    dowRow: {
      flexDirection: "row",
      paddingHorizontal: 4,
      paddingTop: 8,
      paddingBottom: 4,
    },
    dowCell: { flex: 1, alignItems: "center" },
    dowText: { color: C.muted, fontSize: 10, fontWeight: "700" },
    grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 4, paddingBottom: 10 },
    cell: {
      width: `${100 / 7}%`,
      aspectRatio: 1,
      maxHeight: 44,
      alignItems: "center",
      justifyContent: "center",
      padding: 2,
    },
    cellInner: {
      width: "100%",
      height: "100%",
      maxWidth: 40,
      maxHeight: 40,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    cellDay: { color: C.white, fontSize: 13, fontWeight: "600" },
    cellMuted: { color: "rgba(255,255,255,0.22)" },
    cellBlocked: { color: C.muted, textDecorationLine: "line-through" },
    cellToday: { borderWidth: 1.5, borderColor: C.primary },
    cellSelected: { backgroundColor: "rgba(124,107,255,0.35)" },
    cellRangeMid: { backgroundColor: "rgba(124,107,255,0.18)" },
    cellDisabledFill: { backgroundColor: "rgba(248,113,113,0.12)" },
    hint: { paddingHorizontal: 12, paddingBottom: 10, paddingTop: 2 },
    hintText: { color: C.muted, fontSize: 11, lineHeight: 16 },
    legendRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 12, paddingBottom: 8 },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    legendDot: { width: 10, height: 10, borderRadius: 4 },
    legendTxt: { color: C.muted, fontSize: 10 },
  });
}

/**
 * @param {object} props
 * @param {Set<string>} props.blockedDays — YYYY-MM-DD (UTC calendar day), confirmed + owner blocks
 * @param {string} props.startDate
 * @param {string} props.endDate
 * @param {(r: { startDate: string, endDate: string }) => void} props.onRangeChange
 * @param {boolean} props.fr
 */
export default function RentalBookingCalendar({ blockedDays, startDate, endDate, onRangeChange, fr }) {
  const { colors: C } = useTheme();
  const s = useMemo(() => createStyles(C), [C]);

  const now = new Date();
  const [vy, setVy] = useState(now.getUTCFullYear());
  const [vm, setVm] = useState(now.getUTCMonth());

  const monthLabel = useMemo(() => {
    const d = new Date(Date.UTC(vy, vm, 1));
    return d.toLocaleDateString(fr ? "fr-FR" : "en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  }, [vy, vm, fr]);

  const dow = fr ? ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const cells = useMemo(() => {
    const first = utcFirstWeekday(vy, vm);
    const startOffset = first === 0 ? 6 : first - 1;
    const daysInMonth = new Date(Date.UTC(vy, vm + 1, 0)).getUTCDate();
    const list = [];
    for (let i = 0; i < startOffset; i++) list.push({ type: "pad" });
    for (let day = 1; day <= daysInMonth; day++) {
      const ymd = `${vy}-${String(vm + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      list.push({ type: "day", day, ymd });
    }
    while (list.length % 7 !== 0) list.push({ type: "pad" });
    while (list.length < 42) list.push({ type: "pad" });
    return list;
  }, [vy, vm]);

  const todayY = todayUtcYmd();

  const prevMonth = () => {
    if (vm === 0) {
      setVm(11);
      setVy((y) => y - 1);
    } else setVm((m) => m - 1);
  };

  const nextMonth = () => {
    if (vm === 11) {
      setVm(0);
      setVy((y) => y + 1);
    } else setVm((m) => m + 1);
  };

  const rangeContainsBlocked = useCallback(
    (aStr, bStr) => {
      const lo = aStr <= bStr ? aStr : bStr;
      const hi = aStr <= bStr ? bStr : aStr;
      let t = utcMillisFromYmd(lo);
      const end = utcMillisFromYmd(hi);
      if (!Number.isFinite(t) || !Number.isFinite(end)) return false;
      for (; t <= end; t += 86400000) {
        if (blockedDays.has(ymdFromUtcMs(t))) return true;
      }
      return false;
    },
    [blockedDays],
  );

  const onPressDay = (ymd) => {
    if (blockedDays.has(ymd)) return;
    if (ymd < todayY) return;

    if (!startDate || (startDate && endDate)) {
      onRangeChange({ startDate: ymd, endDate: "" });
      return;
    }

    if (!endDate) {
      let lo = startDate;
      let hi = ymd;
      if (ymd < startDate) {
        lo = ymd;
        hi = startDate;
      }
      if (rangeContainsBlocked(lo, hi)) {
        onRangeChange({ startDate: ymd, endDate: "" });
        return;
      }
      if (ymd < startDate) onRangeChange({ startDate: ymd, endDate: startDate });
      else onRangeChange({ startDate, endDate: ymd });
    }
  };

  const cellVisual = (ymd) => {
    const blocked = blockedDays.has(ymd);
    const past = ymd < todayY;
    const disabled = blocked || past;
    const isToday = ymd === todayY;
    let rangeStyle = null;
    if (startDate && endDate && startDate <= endDate) {
      if (ymd === startDate || ymd === endDate) rangeStyle = s.cellSelected;
      else if (ymd > startDate && ymd < endDate) rangeStyle = s.cellRangeMid;
    } else if (startDate && ymd === startDate) {
      rangeStyle = s.cellSelected;
    }
    return { disabled, blocked, past, isToday, rangeStyle };
  };

  return (
    <View style={s.wrap}>
      <LinearGradient colors={[C.primary, "#22d3ee"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.gradientBar} />
      <View style={s.head}>
        <TouchableOpacity onPress={prevMonth} style={s.navBtn} accessibilityLabel={fr ? "Mois précédent" : "Previous month"}>
          <Ionicons name="chevron-back" size={22} color={C.primary} />
        </TouchableOpacity>
        <Text style={s.monthLabel}>{monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}</Text>
        <TouchableOpacity onPress={nextMonth} style={s.navBtn} accessibilityLabel={fr ? "Mois suivant" : "Next month"}>
          <Ionicons name="chevron-forward" size={22} color={C.primary} />
        </TouchableOpacity>
      </View>

      <View style={s.dowRow}>
        {dow.map((w) => (
          <View key={w} style={s.dowCell}>
            <Text style={s.dowText}>{w}</Text>
          </View>
        ))}
      </View>

      <View style={s.grid}>
        {cells.map((c, idx) => {
          if (c.type === "pad") return <View key={`p-${idx}`} style={s.cell} />;
          const { ymd } = c;
          const { disabled, blocked, past, isToday, rangeStyle } = cellVisual(ymd);
          return (
            <View key={ymd} style={s.cell}>
              <TouchableOpacity
                onPress={() => onPressDay(ymd)}
                disabled={disabled}
                activeOpacity={0.7}
                style={[
                  s.cellInner,
                  rangeStyle,
                  isToday && !rangeStyle && s.cellToday,
                  blocked && s.cellDisabledFill,
                  past && !blocked && { opacity: 0.35 },
                ]}
              >
                <Text style={[s.cellDay, past && !blocked && s.cellMuted, blocked && s.cellBlocked]}>
                  {c.day}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <View style={s.legendRow}>
        <View style={s.legendItem}>
          <View style={[s.legendDot, { backgroundColor: "rgba(248,113,113,0.45)" }]} />
          <Text style={s.legendTxt}>{fr ? "Indisponible" : "Unavailable"}</Text>
        </View>
        <View style={s.legendItem}>
          <View style={[s.legendDot, { backgroundColor: "rgba(124,107,255,0.45)" }]} />
          <Text style={s.legendTxt}>{fr ? "Votre sélection" : "Your stay"}</Text>
        </View>
      </View>

      <View style={s.hint}>
        <Text style={s.hintText}>
          {fr
            ? "Touchez la date de début puis la date de fin. Les jours déjà réservés (confirmé) ou bloqués par le propriétaire ne sont pas sélectionnables."
            : "Tap your start date, then your end date. Days already booked (confirmed) or blocked by the owner cannot be selected."}
        </Text>
      </View>
    </View>
  );
}
