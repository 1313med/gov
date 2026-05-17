import * as SecureStore from "expo-secure-store";

const KEY = "goovoiture_auth";
const LOGIN_FORM_KEY = "goovoiture_login_form";
const ONBOARDING_PREFIX = "goovoiture_onboarded_";

export async function saveAuth(data) {
  await SecureStore.setItemAsync(KEY, JSON.stringify(data));
}

export async function loadAuth() {
  const raw = await SecureStore.getItemAsync(KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearAuth() {
  await SecureStore.deleteItemAsync(KEY);
}

export async function saveLoginForm(data) {
  await SecureStore.setItemAsync(LOGIN_FORM_KEY, JSON.stringify(data));
}

export async function loadLoginForm() {
  const raw = await SecureStore.getItemAsync(LOGIN_FORM_KEY);
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  return {
    phone: parsed?.phone || "",
    remember: parsed?.remember !== false,
  };
}

export async function clearLoginForm() {
  await SecureStore.deleteItemAsync(LOGIN_FORM_KEY);
}

export async function markOnboarded(userId) {
  await SecureStore.setItemAsync(`${ONBOARDING_PREFIX}${userId}`, "1");
}

export async function getOnboardingStatus(userId) {
  const val = await SecureStore.getItemAsync(`${ONBOARDING_PREFIX}${userId}`);
  return !!val;
}
