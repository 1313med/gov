import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { PageLoader } from "../src/components/AppLoadingScreen";
import ProfileDocumentsSection from "../src/components/ProfileDocumentsSection";
import { getMyProfile } from "../src/api/user";
import { useTheme } from "../src/context/ThemeContext";
import { useAppLang } from "../src/context/AppLangContext";
import { userCanRentWithDocuments } from "../src/utils/profileDocuments";

/** Full-screen: CIN + license for renting. */
export default function ProfileDocumentsScreen() {
  const { colors: C, isDark } = useTheme();
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const returnTo = params?.return ? String(params.return) : null;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProfile()
      .then((r) => setProfile(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const ready = userCanRentWithDocuments(profile);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: C.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.white} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: C.white }]}>
            {fr ? "Documents pour louer" : "Documents to rent"}
          </Text>
          <Text style={[styles.sub, { color: C.muted }]}>
            {fr
              ? "Permis de conduire et CIN — vous pouvez les ajouter maintenant."
              : "Driving license and national ID — add them anytime."}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}>
        <ProfileDocumentsSection
          profile={profile}
          onProfileChange={setProfile}
          fr={fr}
          C={C}
          isDark={isDark}
          showLicense
          showCin
          expandLicense={!profile?.driverLicense?.imageUrl}
          expandCin={!profile?.nationalId?.imageUrl}
        />

        {ready && returnTo ? (
          <TouchableOpacity
            onPress={() => router.replace(returnTo)}
            style={[styles.doneBtn, { backgroundColor: C.primary }]}
          >
            <Text style={styles.doneBtnText}>{fr ? "Continuer la réservation" : "Continue booking"}</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 8, marginTop: 4 },
  title: { fontSize: 20, fontWeight: "800" },
  sub: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  doneBtn: { marginTop: 20, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  doneBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
