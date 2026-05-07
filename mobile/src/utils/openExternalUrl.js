import { Alert, Linking } from "react-native";
import * as WebBrowser from "expo-web-browser";

/**
 * Open HTTPS links reliably (Cloudinary, etc.) — prefers in-app browser on mobile.
 * tel: / mailto: still use Linking.
 */
export async function openExternalUrl(url, { fr = false } = {}) {
  if (!url || typeof url !== "string") return;
  const u = url.trim();
  if (!u) return;

  try {
    if (u.startsWith("http://") || u.startsWith("https://")) {
      await WebBrowser.openBrowserAsync(u);
      return;
    }
    const can = await Linking.canOpenURL(u).catch(() => true);
    if (can) await Linking.openURL(u);
    else {
      Alert.alert(fr ? "Lien" : "Link", fr ? "Impossible d'ouvrir ce lien." : "This link cannot be opened.");
    }
  } catch {
    try {
      await Linking.openURL(u);
    } catch {
      Alert.alert(
        fr ? "Ouverture impossible" : "Could not open",
        fr ? "Réessayez plus tard ou ouvrez le lien depuis un navigateur." : "Try again or open the link in a browser."
      );
    }
  }
}
