import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";

const SHEET_HEIGHT = Math.round(Dimensions.get("window").height * 0.72);
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Compact row on the form — opens a list sheet on tap */
export function CarSelectField({
  label,
  value,
  placeholder,
  onPress,
  disabled = false,
  accent,
  isDark,
  required = false,
}) {
  const titleColor = isDark ? "#f1f5f9" : "#0f172a";
  const muted = isDark ? "#475569" : "#94a3b8";

  return (
    <View style={fieldStyles.wrap}>
      {label ? (
        <Text style={[fieldStyles.lbl, { color: isDark ? "#64748b" : "#94a3b8" }]}>
          {label}
          {required ? "" : ""}
        </Text>
      ) : null}
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.75}
        style={[
          fieldStyles.row,
          {
            borderColor: value
              ? `${accent}55`
              : isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(15,23,42,0.1)",
            backgroundColor: disabled
              ? isDark
                ? "rgba(255,255,255,0.02)"
                : "rgba(15,23,42,0.03)"
              : isDark
                ? "rgba(255,255,255,0.04)"
                : "rgba(255,255,255,0.9)",
            opacity: disabled ? 0.55 : 1,
          },
        ]}
      >
        <Text
          style={{
            flex: 1,
            fontSize: 15,
            fontWeight: value ? "700" : "600",
            color: value ? titleColor : muted,
          }}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={disabled ? muted : accent} />
      </TouchableOpacity>
    </View>
  );
}

/** Bottom sheet with search + scrollable list */
export function CarSelectSheet({
  visible,
  title,
  subtitle,
  options,
  selected,
  onSelect,
  onClose,
  accent,
  isDark,
  fr = true,
  allowOther = false,
  otherValue = "",
  onOtherChange,
  otherPlaceholder,
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [otherMode, setOtherMode] = useState(false);

  const titleColor = isDark ? "#f8fafc" : "#0f172a";

  useEffect(() => {
    if (visible) {
      setQuery("");
      setOtherMode(selected === "Autre");
    }
  }, [visible, selected]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  const pick = (item) => {
    if (item === "Autre" && allowOther) {
      onSelect("Autre");
      setOtherMode(true);
      return;
    }
    onSelect(item);
    onClose();
  };

  const confirmOther = () => {
    if (!otherValue.trim()) return;
    onSelect("Autre");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={sheetStyles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            sheetStyles.sheet,
            {
              backgroundColor: isDark ? "#0f172a" : "#fff",
              paddingBottom: insets.bottom + 12,
              height: SHEET_HEIGHT,
            },
          ]}
        >
          <View style={sheetStyles.handle} />

          <View style={sheetStyles.head}>
            <View style={{ flex: 1 }}>
              <Text style={[sheetStyles.title, { color: titleColor }]}>{title}</Text>
              {subtitle ? (
                <Text style={{ color: isDark ? "#64748b" : "#94a3b8", fontSize: 13, marginTop: 4 }}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={isDark ? "#94a3b8" : "#64748b"} />
            </TouchableOpacity>
          </View>

          {!otherMode ? (
            <>
              <View
                style={[
                  sheetStyles.searchWrap,
                  {
                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)",
                    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc",
                  },
                ]}
              >
                <Ionicons name="search" size={18} color={isDark ? "#64748b" : "#94a3b8"} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={fr ? "Rechercher…" : "Search…"}
                  placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                  style={[sheetStyles.searchInput, { color: titleColor }]}
                  autoCorrect={false}
                  autoCapitalize="words"
                />
                {query ? (
                  <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color={isDark ? "#64748b" : "#94a3b8"} />
                  </TouchableOpacity>
                ) : null}
              </View>

              <FlatList
                style={{ flex: 1 }}
                data={filtered}
                keyExtractor={(item) => item}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 8 }}
                ListEmptyComponent={
                  <Text style={{ textAlign: "center", color: isDark ? "#64748b" : "#94a3b8", paddingVertical: 24 }}>
                    {fr ? "Aucun résultat" : "No results"}
                  </Text>
                }
                renderItem={({ item }) => {
                  const active =
                    selected === item || (item === "Autre" && selected === "Autre");
                  return (
                    <TouchableOpacity
                      onPress={() => pick(item)}
                      activeOpacity={0.7}
                      style={[
                        sheetStyles.option,
                        active && {
                          backgroundColor: `${accent}18`,
                          borderLeftWidth: 3,
                          borderLeftColor: accent,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 16,
                          fontWeight: active ? "800" : "600",
                          color: active ? accent : titleColor,
                        }}
                      >
                        {item}
                      </Text>
                      {active ? <Ionicons name="checkmark-circle" size={22} color={accent} /> : null}
                    </TouchableOpacity>
                  );
                }}
              />
            </>
          ) : (
            <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
              <Text style={{ fontSize: 14, color: isDark ? "#94a3b8" : "#64748b", marginBottom: 12, lineHeight: 20 }}>
                {fr ? "Saisissez le nom exact, puis validez." : "Enter the exact name, then confirm."}
              </Text>
              <TextInput
                value={otherValue}
                onChangeText={onOtherChange}
                placeholder={otherPlaceholder}
                placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                autoFocus
                style={[
                  sheetStyles.otherInput,
                  {
                    borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)",
                    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc",
                    color: titleColor,
                  },
                ]}
              />
              <TouchableOpacity
                onPress={confirmOther}
                disabled={!otherValue.trim()}
                activeOpacity={0.85}
                style={[sheetStyles.confirmBtn, { backgroundColor: accent, opacity: otherValue.trim() ? 1 : 0.45 }]}
              >
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>
                  {fr ? "Valider" : "Confirm"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setOtherMode(false)}
                style={{ marginTop: 14, alignItems: "center" }}
              >
                <Text style={{ color: accent, fontWeight: "700", fontSize: 14 }}>
                  {fr ? "← Retour à la liste" : "← Back to list"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { marginTop: 4 },
  lbl: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
});

const sheetStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    minHeight: 320,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(148,163,184,0.5)",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: { fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, fontWeight: "600", paddingVertical: 0 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(148,163,184,0.2)",
  },
  otherInput: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  confirmBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
});
