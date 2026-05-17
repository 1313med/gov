import "react-native-gesture-handler";
import { useEffect, useMemo, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { SocketProvider } from "../src/context/SocketContext";
import { AppLangProvider } from "../src/context/AppLangContext";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import { getOnboardingStatus } from "../src/utils/authStorage";

function getRoleShell(role) {
  if (role === "rental_owner") return "/(rental-owner)";
  if (role === "seller") return "/(car-owner)";
  if (role === "admin") return "/(admin)";
  return "/(customer)";
}

function RootNavigator() {
  const { auth, loading } = useAuth();
  const { colors: C } = useTheme();
  const segments = useSegments();
  const router = useRouter();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const hdr = useMemo(
    () => ({ backgroundColor: C.surface, headerTintColor: C.white }),
    [C.surface, C.white]
  );

  useEffect(() => {
    if (loading) return;
    if (!auth) {
      setOnboardingChecked(true);
      setNeedsOnboarding(false);
      return;
    }
    getOnboardingStatus(auth._id).then((done) => {
      setNeedsOnboarding(!done);
      setOnboardingChecked(true);
    });
  }, [auth, loading]);

  useEffect(() => {
    if (loading || !onboardingChecked) return;
    const group = segments[0];
    const inAuth = group === "(auth)";
    const inOnboarding = inAuth && segments[1] === "onboarding";

    if (!auth) {
      if (!inAuth) router.replace("/(auth)/role-select");
      return;
    }

    if (needsOnboarding && !inOnboarding) {
      // Always re-read SecureStore before redirecting so stale in-memory state
      // (e.g. after onboarding.jsx calls markOnboarded + router.replace) never
      // sends the user back to onboarding mid-navigation.
      getOnboardingStatus(auth._id).then((done) => {
        if (done) {
          setNeedsOnboarding(false);   // heal stale state, no redirect
        } else {
          router.replace("/(auth)/onboarding");
        }
      });
    } else if (!needsOnboarding && inAuth) {
      router.replace(getRoleShell(auth.role));
    }
  }, [auth, loading, onboardingChecked, needsOnboarding, segments]);

  if (loading || (auth && !onboardingChecked)) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={C.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(customer)" />
      <Stack.Screen name="(car-owner)" />
      <Stack.Screen name="(rental-owner)" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="cars/[id]" options={{ headerShown: true, headerTitle: "Car Details", headerStyle: hdr }} />
      <Stack.Screen name="rentals/[id]" options={{ headerShown: true, headerTitle: "Rental Details", headerStyle: hdr }} />
      <Stack.Screen name="seller/[id]" options={{ headerShown: true, headerTitle: "Seller Profile", headerStyle: hdr }} />
      <Stack.Screen name="my-bookings" options={{ headerShown: true, headerTitle: "My Bookings", headerStyle: hdr }} />
      <Stack.Screen name="my-sales" options={{ headerShown: true, headerTitle: "My Listings", headerStyle: hdr }} />
      <Stack.Screen name="new-sale" options={{ headerShown: true, headerTitle: "New Listing", headerStyle: hdr }} />
      <Stack.Screen name="my-fleet" options={{ headerShown: true, headerTitle: "My Fleet", headerStyle: hdr }} />
      <Stack.Screen name="add-rental" options={{ headerShown: true, headerTitle: "Add Rental", headerStyle: hdr }} />
      <Stack.Screen name="owner-bookings" options={{ headerShown: true, headerTitle: "Bookings", headerStyle: hdr }} />
      <Stack.Screen name="owner-analytics" options={{ headerShown: true, headerTitle: "Analytics", headerStyle: hdr }} />
      <Stack.Screen name="owner-booking-calendar" options={{ headerShown: true, headerTitle: "Calendar", headerStyle: hdr }} />
      <Stack.Screen name="owner-listing-views" options={{ headerShown: true, headerTitle: "Listing Views", headerStyle: hdr, headerBackTitle: "Back" }} />
      <Stack.Screen name="maintenance" options={{ headerShown: true, headerTitle: "Maintenance", headerStyle: hdr, headerBackTitle: "Back" }} />
      <Stack.Screen name="maintenance/[rentalId]" options={{ headerShown: true, headerTitle: "Maintenance", headerStyle: hdr, headerBackTitle: "Back" }} />
      <Stack.Screen name="notifications" options={{ headerShown: true, headerTitle: "Notifications", headerStyle: hdr }} />
      <Stack.Screen name="admin-moderation" options={{ headerShown: true, headerTitle: "Moderation", headerStyle: hdr }} />
      <Stack.Screen name="mon-garage" options={{ headerShown: true, headerTitle: "My Garage", headerStyle: hdr }} />
      <Stack.Screen name="add-car" options={{ headerShown: true, headerTitle: "Add Car", headerStyle: hdr }} />
      <Stack.Screen name="estimate" options={{ headerShown: true, headerTitle: "Estimate My Car", headerStyle: hdr }} />
      <Stack.Screen name="price-alerts" options={{ headerShown: true, headerTitle: "Price Alerts", headerStyle: hdr }} />
      <Stack.Screen name="verify-seller" options={{ headerShown: true, headerTitle: "Verify Account", headerStyle: hdr }} />
    </Stack>
  );
}

function ThemedShell() {
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <RootNavigator />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppLangProvider>
          <SocketProvider>
            <ThemedShell />
          </SocketProvider>
        </AppLangProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
