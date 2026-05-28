import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/context/ThemeContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { useAuth } from "../../src/context/AuthContext";

export default function RentalOwnerLayout() {
  const { colors: C, isDark } = useTheme();
  const { lang, pick } = useAppLang();
  const { auth } = useAuth();
  const fr = lang === "fr";

  const isStaff = !!auth?.staffForOwnerId;
  const perms = auth?.staffPermissions || {};

  // Returns null (hidden) for staff tabs they lack permission for, undefined (visible) otherwise
  const tabHref = (granted) => (isStaff && !granted ? null : undefined);

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
        tabBarActiveTintColor: isDark ? "#34d399" : "#059669",
        tabBarInactiveTintColor: C.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700", letterSpacing: 0.2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: pick("Dashboard", "Tableau"),
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          href: tabHref(perms.manageBookings),
          title: pick("Bookings", "Réservations"),
          tabBarIcon: ({ color, size }) => <Ionicons name="clipboard-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          href: tabHref(perms.viewAnalytics),
          title: pick("Analytics", "Analytique"),
          tabBarIcon: ({ color, size }) => <Ionicons name="analytics-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="fleet"
        options={{
          href: tabHref(perms.managePricing),
          title: pick("Fleet", "Flotte"),
          tabBarIcon: ({ color, size }) => <Ionicons name="car-sport-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          href: isStaff ? tabHref(perms.manageMessages) : null,
          title: pick("Messages", "Messages"),
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-outline" size={size} color={color} />,
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
