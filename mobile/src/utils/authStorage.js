import * as SecureStore from "expo-secure-store";

const KEY = "goovoiture_auth";

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
