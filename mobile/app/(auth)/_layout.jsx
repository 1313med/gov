import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="role-select" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password/[token]" />
      <Stack.Screen name="verify-email/[token]" />
    </Stack>
  );
}
