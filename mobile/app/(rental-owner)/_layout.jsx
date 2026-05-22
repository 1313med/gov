import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/context/ThemeContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { useAuth } from "../../src/context/AuthContext";

export default function RentalOwnerLayout() {
  const { colors: C, isDark } = useTheme();
  const { lang } = useAppLang();
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
          title: fr ? "Tableau" : "Dashboard",
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          href: tabHref(perms.manageBookings),
          title: fr ? "Réservations" : "Bookings",
          tabBarIcon: ({ color, size }) => <Ionicons name="clipboard-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          href: tabHref(perms.viewAnalytics),
          title: fr ? "Analytique" : "Analytics",
          tabBarIcon: ({ color, size }) => <Ionicons name="analytics-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="fleet"
        options={{
          href: tabHref(perms.managePricing),
          title: fr ? "Flotte" : "Fleet",
          tabBarIcon: ({ color, size }) => <Ionicons name="car-sport-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          href: isStaff ? tabHref(perms.manageMessages) : null,
          title: fr ? "Messages" : "Messages",
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: fr ? "Profil" : "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
