import AsyncStorage from "@react-native-async-storage/async-storage";
import { normalizeRoleKey } from "../constants/roleThemes";

const STORAGE_KEY = "goovoiture-auth-role-intent";

export async function saveAuthRoleIntent(role) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, normalizeRoleKey(role));
  } catch {
    /* ignore */
  }
}

export async function loadAuthRoleIntent() {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    return normalizeRoleKey(value || "customer");
  } catch {
    return "customer";
  }
}
