import { useState, useCallback, useRef } from "react";
import { PageLoader, InlineLogoLoader } from '../../src/components/AppLoadingScreen';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../src/api/client";
import { useAppLang } from "../../src/context/AppLangContext";
import { useTheme } from "../../src/context/ThemeContext";

const ROLE_META = {
  admin:         { label: "Admin",        color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  "rental-owner":{ label: "Rental Owner", color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  "car-owner":   { label: "Car Owner",    color: "#38bdf8", bg: "rgba(56,189,248,0.12)" },
  customer:      { label: "Customer",     color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
};

function roleMeta(role) {
  return ROLE_META[role] || { label: role || "User", color: "#94a3b8", bg: "rgba(148,163,184,0.12)" };
}

export default function AdminUsersScreen() {
  const { lang, pick } = useAppLang();
  const fr = lang === "fr";
  const { colors: C, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [users, setUsers]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [hasMore, setHasMore]     = useState(true);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing]   = useState(false);
  const [search, setSearch]       = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [busyId, setBusyId]       = useState(null);

  const searchTimer = useRef(null);
  const accent = isDark ? "#f87171" : "#dc2626";
  const LIMIT = 20;

  const fetchUsers = useCallback(async (pg = 1, q = search, role = roleFilter, reset = false) => {
    try {
      const params = { page: pg, limit: LIMIT };
      if (q.trim()) params.search = q.trim();
      if (role !== "all") params.role = role;
      const res = await api.get("/admin/users", { params });
      const list = Array.isArray(res.data?.users) ? res.data.users
        : Array.isArray(res.data) ? res.data : [];
      const tot = res.data?.total ?? list.length;
      setTotal(tot);
      setUsers((prev) => (reset || pg === 1) ? list : [...prev, ...list]);
      setHasMore(list.length === LIMIT);
      setPage(pg);
    } catch (e) {
      if (e?.response?.status !== 404) {
        Alert.alert(pick("Error", "Erreur"), e?.response?.data?.message || (pick("Failed to load users.", "Impossible de charger les utilisateurs.")));
      }
      if (reset || pg === 1) setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [search, roleFilter, fr]);

  // Initial load
  useState(() => { fetchUsers(1, "", "all", true); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers(1, search, roleFilter, true);
  };

  const onLoadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    fetchUsers(page + 1);
  };

  const onSearchChange = (text) => {
    setSearch(text);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setLoading(true);
      fetchUsers(1, text, roleFilter, true);
    }, 600);
  };

  const onRoleFilter = (role) => {
    setRoleFilter(role);
    setLoading(true);
    fetchUsers(1, search, role, true);
  };

  const toggleBan = async (user) => {
    const isBanned = user.isBanned || user.banned;
    const action = isBanned ? (pick("unban", "débannir")) : (pick("ban", "bannir"));
    Alert.alert(
      pick("Confirm", "Confirmer"),
      pick(`Are you sure you want to ${action} ${user.name || user.email}?`, `Voulez-vous ${action} ${user.name || user.email} ?`),
      [
        { text: pick("Cancel", "Annuler"), style: "cancel" },
        {
          text: pick("Confirm", "Confirmer"),
          style: isBanned ? "default" : "destructive",
          onPress: async () => {
            setBusyId(user._id);
            try {
              await api.patch(`/admin/users/${user._id}/${isBanned ? "unban" : "ban"}`);
              setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, isBanned: !isBanned, banned: !isBanned } : u));
            } catch (e) {
              Alert.alert(pick("Error", "Erreur"), e?.response?.data?.message || (pick("Action failed.", "Action échouée.")));
            } finally {
              setBusyId(null);
            }
          },
        },
      ]
    );
  };

  const ROLES = ["all", "customer", "car-owner", "rental-owner", "admin"];
  const roleLabels = {
    all: pick("All", "Tous"),
    customer: pick("Customer", "Client"),
    "car-owner": pick("Car Owner", "Proprio."),
    "rental-owner": pick("Rental", "Loueur"),
    admin: "Admin",
  };

  const renderUser = ({ item: user }) => {
    const meta = roleMeta(user.role);
    const isBanned = user.isBanned || user.banned;
    const busy = busyId === user._id;
    const initials = (user.name || user.email || "?").slice(0, 2).toUpperCase();

    return (
      <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: `${meta.color}22` }]}>
          <Text style={{ color: meta.color, fontWeight: "800", fontSize: 15 }}>{initials}</Text>
        </View>

        {/* Info */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <Text style={{ color: isDark ? "#f1f5f9" : "#0f172a", fontWeight: "700", fontSize: 14 }} numberOfLines={1}>
              {user.name || "—"}
            </Text>
            {isBanned && (
              <View style={styles.bannedBadge}>
                <Text style={{ color: "#f87171", fontSize: 9, fontWeight: "800" }}>{pick("BANNED", "BANNI")}</Text>
              </View>
            )}
          </View>
          <Text style={{ color: C.muted, fontSize: 12, marginTop: 1 }} numberOfLines={1}>{user.email}</Text>
          <View style={[styles.rolePill, { backgroundColor: meta.bg }]}>
            <Text style={{ color: meta.color, fontSize: 10, fontWeight: "800" }}>{meta.label.toUpperCase()}</Text>
          </View>
        </View>

        {/* Action */}
        <TouchableOpacity
          onPress={() => toggleBan(user)}
          disabled={busy}
          activeOpacity={0.8}
          style={[styles.banBtn, { backgroundColor: isBanned ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.1)" }]}
        >
          {busy ? (
            <ActivityIndicator size={14} color={isBanned ? "#34d399" : "#f87171"} />
          ) : (
            <Ionicons name={isBanned ? "lock-open-outline" : "ban-outline"} size={16} color={isBanned ? "#34d399" : "#f87171"} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <LinearGradient
        colors={isDark ? ["#0a0406", "#110305"] : ["#fff1f2", "#ffe4e6"]}
        style={{ paddingTop: insets.top + 12, paddingBottom: 16, paddingHorizontal: 20 }}
      >
        <Text style={{ fontSize: 10, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase", color: accent, marginBottom: 2 }}>
          {pick("ADMINISTRATION", "ADMINISTRATION")}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 22, fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a", letterSpacing: -0.5 }}>
            {pick("Users", "Utilisateurs")}
          </Text>
          {total > 0 && (
            <View style={[styles.totalBadge, { backgroundColor: `${accent}18`, borderColor: `${accent}30` }]}>
              <Text style={{ color: accent, fontWeight: "800", fontSize: 12 }}>{total}</Text>
            </View>
          )}
        </View>

        {/* Search */}
        <View style={[styles.searchBar, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", borderColor: C.border }]}>
          <Ionicons name="search-outline" size={16} color={C.muted} />
          <TextInput
            value={search}
            onChangeText={onSearchChange}
            placeholder={pick("Search by name or email…", "Rechercher par nom ou email…")}
            placeholderTextColor={C.muted}
            style={{ flex: 1, color: isDark ? "#f1f5f9" : "#0f172a", fontSize: 14, marginLeft: 8 }}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange("")}>
              <Ionicons name="close-circle" size={16} color={C.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Role filter chips */}
        <FlatList
          horizontal
          data={ROLES}
          keyExtractor={(r) => r}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingTop: 10 }}
          renderItem={({ item: role }) => {
            const active = roleFilter === role;
            const meta = role === "all" ? { color: accent } : roleMeta(role);
            return (
              <TouchableOpacity
                onPress={() => onRoleFilter(role)}
                activeOpacity={0.8}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? `${meta.color}20` : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
                    borderColor: active ? `${meta.color}50` : C.border,
                  },
                ]}
              >
                <Text style={{ color: active ? meta.color : C.muted, fontWeight: "700", fontSize: 11 }}>
                  {roleLabels[role]}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </LinearGradient>

      {/* List */}
      {loading ? <PageLoader /> : users.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <Ionicons name="people-outline" size={48} color={C.muted} />
          <Text style={{ color: isDark ? "#f1f5f9" : "#0f172a", fontWeight: "700", fontSize: 16, marginTop: 14 }}>
            {pick("No users found", "Aucun utilisateur trouvé")}
          </Text>
          <Text style={{ color: C.muted, fontSize: 13, marginTop: 6, textAlign: "center" }}>
            {search ? (pick("Try a different search term.", "Essayez un autre terme de recherche.")) : (pick("No users for this filter.", "Aucun utilisateur pour ce filtre."))}
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u._id}
          renderItem={renderUser}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: insets.bottom + 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loadingMore ? <InlineLogoLoader /> : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 16, borderWidth: 1, padding: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center",
  },
  rolePill: {
    alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginTop: 5,
  },
  bannedBadge: {
    backgroundColor: "rgba(248,113,113,0.12)", borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2,
  },
  banBtn: {
    width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 10, marginTop: 12,
  },
  chip: {
    borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6,
  },
  totalBadge: {
    borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4,
  },
});
