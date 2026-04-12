import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { SocketProvider } from "../src/context/SocketContext";
import { AppLangProvider } from "../src/context/AppLangContext";
import { C } from "../src/theme";

const hdr = { backgroundColor: C.surface, headerTintColor: C.white };

function RootNavigator() {
  const { auth, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === "(auth)";
    if (!auth && !inAuth) router.replace("/(auth)/login");
    else if (auth && inAuth) router.replace("/(tabs)");
  }, [auth, loading, segments]);

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={C.primary} size="large" />
    </View>
  );

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="cars/[id]"        options={{ headerShown: true, headerTitle: "Car Details",     headerStyle: hdr }} />
      <Stack.Screen name="rentals/[id]"     options={{ headerShown: true, headerTitle: "Rental Details",  headerStyle: hdr }} />
      <Stack.Screen name="seller/[id]"      options={{ headerShown: true, headerTitle: "Seller Profile",  headerStyle: hdr }} />
      <Stack.Screen name="my-bookings"      options={{ headerShown: true, headerTitle: "My Bookings",     headerStyle: hdr }} />
      <Stack.Screen name="my-sales"         options={{ headerShown: true, headerTitle: "My Sales",        headerStyle: hdr }} />
      <Stack.Screen name="new-sale"         options={{ headerShown: true, headerTitle: "New Listing",     headerStyle: hdr }} />
      <Stack.Screen name="my-fleet"         options={{ headerShown: true, headerTitle: "My Fleet",        headerStyle: hdr }} />
      <Stack.Screen name="add-rental"       options={{ headerShown: true, headerTitle: "Add Rental",      headerStyle: hdr }} />
      <Stack.Screen name="owner-bookings"   options={{ headerShown: true, headerTitle: "Bookings",        headerStyle: hdr }} />
      <Stack.Screen name="notifications"    options={{ headerShown: true, headerTitle: "Notifications",   headerStyle: hdr }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppLangProvider>
        <SocketProvider>
          <StatusBar style="light" backgroundColor={C.bg} />
          <RootNavigator />
        </SocketProvider>
      </AppLangProvider>
    </AuthProvider>
  );
}
