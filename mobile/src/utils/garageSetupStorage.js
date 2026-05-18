import AsyncStorage from "@react-native-async-storage/async-storage";

const deferKey = (userId) => `goovoiture_garage_setup_deferred_${userId}`;

export async function isGarageSetupDeferred(userId) {
  if (!userId) return false;
  const v = await AsyncStorage.getItem(deferKey(userId));
  return v === "1";
}

export async function deferGarageSetup(userId) {
  if (!userId) return;
  await AsyncStorage.setItem(deferKey(userId), "1");
}

export async function clearGarageSetupDefer(userId) {
  if (!userId) return;
  await AsyncStorage.removeItem(deferKey(userId));
}
