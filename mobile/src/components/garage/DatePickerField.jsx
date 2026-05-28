import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useAppLang } from "../../context/AppLangContext";
import { dateLocaleTag } from "../../utils/i18n";

/**
 * Date row + picker that always dismisses after selection (no inline spinner in scroll).
 */
export function DatePickerField({
  label,
  value,
  onChange,
  isDark,
  accent = "#0284c7",
  minimumDate,
  maximumDate,
  emptyLabel,
}) {
  const { pick, lang } = useAppLang();
  const dateLocale = dateLocaleTag(lang);
  const [show, setShow] = useState(false);
  const [draft, setDraft] = useState(() => (value ? new Date(value) : new Date()));

  const titleColor = isDark ? "#f1f5f9" : "#0f172a";
  const muted = isDark ? "#475569" : "#94a3b8";

  const formatted = value
    ? new Date(value).toLocaleDateString(dateLocale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : emptyLabel ?? pick("Not set", "Non renseigné", "غير محدد");

  useEffect(() => {
    if (show) setDraft(value ? new Date(value) : new Date());
  }, [show, value]);

  const open = () => setShow(true);
  const close = () => setShow(false);

  const confirm = () => {
    onChange(draft.toISOString());
    close();
  };

  const onAndroidChange = (event, selectedDate) => {
    close();
    if (event.type === "set" && selectedDate) {
      onChange(selectedDate.toISOString());
    }
  };

  return (
    <View>
      {label ? (
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: isDark ? "#64748b" : "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: 0.8,
            marginBottom: 6,
            marginTop: 16,
          }}
        >
          {label}
        </Text>
      ) : null}
      <TouchableOpacity
        onPress={open}
        activeOpacity={0.75}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 14,
          paddingVertical: 13,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)",
          backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)",
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: value ? titleColor : muted,
          }}
        >
          {formatted}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={muted} />
      </TouchableOpacity>

      {show && Platform.OS === "android" ? (
        <DateTimePicker
          value={draft}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={onAndroidChange}
        />
      ) : null}

      {show && Platform.OS === "ios" ? (
        <Modal visible transparent animationType="fade" onRequestClose={close}>
          <Pressable style={styles.overlay} onPress={close} />
          <View style={[styles.sheet, { backgroundColor: isDark ? "#1e293b" : "#fff" }]}>
            <View style={styles.sheetHead}>
              <TouchableOpacity onPress={close} hitSlop={12}>
                <Text style={{ color: muted, fontWeight: "700", fontSize: 16 }}>
                  {pick("Cancel", "Annuler", "إلغاء")}
                </Text>
              </TouchableOpacity>
              <Text style={{ fontWeight: "800", fontSize: 16, color: titleColor }}>
                {pick("Choose date", "Choisir une date", "اختر التاريخ")}
              </Text>
              <TouchableOpacity onPress={confirm} hitSlop={12}>
                <Text style={{ color: accent, fontWeight: "800", fontSize: 16 }}>
                  OK
                </Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={draft}
              mode="date"
              display="spinner"
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              onChange={(_, d) => {
                if (d) setDraft(d);
              }}
              style={{ height: 200 }}
            />
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  sheetHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(148,163,184,0.25)",
  },
});
