import * as SecureStore from "expo-secure-store";

const KEY = "goovoiture_auth";
const LOGIN_FORM_KEY = "goovoiture_login_form";

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
  return raw ? JSON.parse(raw) : null;
}

export async function clearLoginForm() {
  await SecureStore.deleteItemAsync(LOGIN_FORM_KEY);
}
