import { useCallback, useState } from "react";
import { Tabs, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/context/ThemeContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { useAuth } from "../../src/context/AuthContext";
import { getMySales } from "../../src/api/sale";
import { userHasApprovedSale } from "../../src/utils/profileDocuments";

export default function CustomerLayout() {
  const { colors: C, isDark } = useTheme();
  const { lang, pick } = useAppLang();
  const fr = lang === "fr";
  const { auth } = useAuth();
  const [showSellTab, setShowSellTab] = useState(false);

  const refreshSellTab = useCallback(() => {
    if (!auth) {
      setShowSellTab(false);
      return;
    }
    getMySales()
      .then((r) => setShowSellTab(userHasApprovedSale(r.data)))
      .catch(() => setShowSellTab(false));
  }, [auth?._id]);

  useFocusEffect(refreshSellTab);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700", letterSpacing: 0.2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: pick("Explore", "Explorer"),
          tabBarIcon: ({ color, size }) => <Ionicons name="search-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: pick("Bookings", "Réservations"),
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: pick("Messages", "Messages"),
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: pick("Saved", "Favoris"),
          tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-cars"
        options={{
          href: showSellTab ? undefined : null,
          title: pick("My cars", "Mes ventes"),
          tabBarIcon: ({ color, size }) => <Ionicons name="pricetag-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: pick("Profile", "Profil"),
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
