import { useEffect, useMemo, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as AppleAuthentication from "expo-apple-authentication";
import { Platform } from "react-native";
import {
  exchangeAppleToken,
  exchangeFacebookToken,
  exchangeGoogleToken,
  getOAuthConfig,
} from "../api/oauth";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "";
const GOOGLE_IOS_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || "";
const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || "";
const FACEBOOK_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || "";

export function useSocialAuth({ role = "customer", onSuccess, onError } = {}) {
  const [config, setConfig] = useState(null);
  const [busy, setBusy] = useState(null);

  const [googleRequest, googleResponse, promptGoogle] = Google.useIdTokenAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID || undefined,
    iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID || undefined,
  });

  const facebookRedirectUri = useMemo(
    () =>
      AuthSession.makeRedirectUri({
        scheme: "goovoiture",
        path: "oauth/facebook",
      }),
    []
  );

  const [fbRequest, fbResponse, promptFacebook] = Facebook.useAuthRequest({
    clientId: FACEBOOK_APP_ID || "disabled",
    redirectUri: facebookRedirectUri,
    responseType: Facebook.ResponseType.Token,
    scopes: ["public_profile", "email"],
  });

  useEffect(() => {
    getOAuthConfig()
      .then((res) => setConfig(res.data))
      .catch(() =>
        setConfig({
          google: { enabled: false },
          facebook: { enabled: false },
          apple: { enabled: false },
        })
      );
  }, []);

  useEffect(() => {
    if (!googleResponse || busy !== "google") return;
    (async () => {
      try {
        if (googleResponse.type !== "success") {
          if (googleResponse.type !== "dismiss" && googleResponse.type !== "cancel") {
            onError?.("Google sign-in failed");
          }
          return;
        }
        const idToken = googleResponse.params?.id_token;
        if (!idToken) throw new Error("Google did not return an id token");
        const { data } = await exchangeGoogleToken(idToken, role);
        onSuccess?.(data);
      } catch (err) {
        onError?.(
          err?.response?.data?.message || err?.message || "Google sign-in failed"
        );
      } finally {
        setBusy(null);
      }
    })();
  }, [googleResponse, busy, role, onSuccess, onError]);

  useEffect(() => {
    if (!fbResponse || busy !== "facebook") return;
    (async () => {
      try {
        if (fbResponse.type !== "success") {
          if (fbResponse.type !== "dismiss" && fbResponse.type !== "cancel") {
            onError?.("Facebook sign-in failed");
          }
          return;
        }
        const accessToken = fbResponse.authentication?.accessToken;
        if (!accessToken) throw new Error("Facebook did not return an access token");
        const { data } = await exchangeFacebookToken(accessToken, role);
        onSuccess?.(data);
      } catch (err) {
        onError?.(
          err?.response?.data?.message || err?.message || "Facebook sign-in failed"
        );
      } finally {
        setBusy(null);
      }
    })();
  }, [fbResponse, busy, role, onSuccess, onError]);

  async function signInWithGoogle() {
    if (!config?.google?.enabled || !googleRequest) return;
    setBusy("google");
    try {
      await promptGoogle();
    } catch (err) {
      setBusy(null);
      onError?.(err?.message || "Google sign-in failed");
    }
  }

  async function signInWithFacebook() {
    if (!config?.facebook?.enabled || !fbRequest) return;
    setBusy("facebook");
    try {
      await promptFacebook();
    } catch (err) {
      setBusy(null);
      onError?.(err?.message || "Facebook sign-in failed");
    }
  }

  async function signInWithApple() {
    if (!config?.apple?.enabled) return;
    if (Platform.OS !== "ios") {
      onError?.("Apple Sign In is only available on iOS in the mobile app.");
      return;
    }
    setBusy("apple");
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        throw new Error("Apple Sign In failed");
      }
      const fullName = credential.fullName;
      const name = fullName
        ? [fullName.givenName, fullName.familyName].filter(Boolean).join(" ")
        : undefined;
      const { data } = await exchangeAppleToken(credential.identityToken, {
        email: credential.email || undefined,
        name,
        role,
      });
      onSuccess?.(data);
    } catch (err) {
      if (err?.code !== "ERR_REQUEST_CANCELED") {
        onError?.(
          err?.response?.data?.message || err?.message || "Apple Sign In failed"
        );
      }
    } finally {
      setBusy(null);
    }
  }

  return {
    config,
    busy,
    signInWithGoogle,
    signInWithFacebook,
    signInWithApple,
    appleAvailable: Platform.OS === "ios",
  };
}
