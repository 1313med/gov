import "react-native-gesture-handler";
import { useEffect, useMemo, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import AppLoadingScreen from "../src/components/AppLoadingScreen";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { SocketProvider } from "../src/context/SocketContext";
import { AppLangProvider, useAppLang } from "../src/context/AppLangContext";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import { ActiveModeProvider, useActiveMode } from "../src/context/ActiveModeContext";
import { getOnboardingStatus } from "../src/utils/authStorage";
import { resolveHomeHref, shellGroupFromHref, isRoleShellGroup } from "../src/utils/userRoles";
function useStackTitles() {
  const { copy } = useAppLang();
  return copy.screenTitles || {};
}

function RootNavigator() {
  const { auth, loading } = useAuth();
  const { colors: C } = useTheme();
  const { ready: modeReady, activeMode } = useActiveMode();
  const homeHref = useMemo(
    () => resolveHomeHref(auth, activeMode, modeReady),
    [auth, activeMode, modeReady]
  );
  const titles = useStackTitles();
  const segments = useSegments();
  const router = useRouter();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const hdr = useMemo(
    () => ({ backgroundColor: C.surface, headerTintColor: C.white }),
    [C.surface, C.white]
  );

  const stackScreens = useMemo(
    () => [
      ["cars/[id]", titles.carDetails],
      ["rentals/[id]", titles.rentalDetails],
      ["seller/[id]", titles.sellerProfile],
      ["my-bookings", titles.myBookings],
      ["my-sales", titles.myListings],
      ["new-sale", titles.newListing],
      ["my-fleet", titles.myFleet],
      ["add-rental", titles.addRental],
      ["owner-bookings", titles.ownerBookings],
      ["owner-analytics", titles.analytics],
      ["owner-booking-calendar", titles.calendar],
      ["owner-listing-views", titles.listingViews],
      ["maintenance", titles.maintenance],
      ["maintenance/[rentalId]", titles.maintenance],
      ["notifications", titles.notifications],
      ["admin-moderation", titles.moderation],
      ["mon-garage", titles.myGarage],
      ["add-car", titles.addCar],
      ["estimate", titles.estimate],
      ["price-alerts", titles.priceAlerts],
      ["verify-cin", titles.verifyCin],
      ["verify-seller", titles.verifyCin],
      ["profile-documents", titles.profileDocuments || titles.verifyCin],
    ],
    [titles]
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
    if (loading || !onboardingChecked || !modeReady) return;
    const group = segments[0];
    const inAuth = group === "(auth)";
    const inOnboarding = inAuth && segments[1] === "onboarding";
    const inLegacyTabs = group === "(tabs)";

    if (!auth) {
      if (!inAuth) router.replace("/(auth)/role-select");
      return;
    }

    if (needsOnboarding && !inOnboarding) {
      getOnboardingStatus(auth._id).then((done) => {
        if (done) {
          setNeedsOnboarding(false);
        } else {
          router.replace("/(auth)/onboarding");
        }
      });
    } else if (!needsOnboarding && homeHref) {
      const targetGroup = shellGroupFromHref(homeHref);
      const wrongShell =
        isRoleShellGroup(group) && targetGroup && group !== targetGroup;
      if (inAuth || inLegacyTabs || wrongShell) {
        router.replace(homeHref);
      }
    }
  }, [auth, loading, onboardingChecked, needsOnboarding, segments, homeHref, modeReady, router]);

  if (loading || (auth && !onboardingChecked) || (auth && !modeReady)) {
    return <AppLoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(customer)" />
      <Stack.Screen name="(car-owner)" />
      <Stack.Screen name="(rental-owner)" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {stackScreens.map(([name, title]) => (
        <Stack.Screen
          key={name}
          name={name}
          options={{
            headerShown: true,
            headerTitle: title || "",
            headerStyle: hdr,
            headerBackTitle: titles.back ?? "Back",
          }}
        />
      ))}
      <Stack.Screen name="edit-garage-item" options={{ headerShown: false }} />
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
          <ActiveModeProvider>
            <SocketProvider>
              <ThemedShell />
            </SocketProvider>
          </ActiveModeProvider>
        </AppLangProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
