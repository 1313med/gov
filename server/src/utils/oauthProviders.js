const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");
const { createRemoteJWKSet, jwtVerify } = require("jose");

const googleClient = new OAuth2Client();
const appleJwks = createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys")
);

function googleClientIds() {
  return (process.env.GOOGLE_CLIENT_ID || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function appleClientIds() {
  return (process.env.APPLE_CLIENT_ID || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function verifyGoogleIdToken(idToken) {
  const audiences = googleClientIds();
  if (!audiences.length) {
    throw new Error("Google OAuth is not configured");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: audiences,
  });
  const payload = ticket.getPayload();
  if (!payload?.sub) throw new Error("Invalid Google token");

  return {
    providerId: payload.sub,
    email: payload.email || null,
    name: payload.name || payload.given_name || null,
    avatar: payload.picture || null,
    emailVerified: payload.email_verified === true,
  };
}

async function verifyFacebookAccessToken(accessToken) {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error("Facebook OAuth is not configured");
  }

  const appToken = `${appId}|${appSecret}`;
  const debug = await axios.get("https://graph.facebook.com/debug_token", {
    params: { input_token: accessToken, access_token: appToken },
  });

  const meta = debug.data?.data;
  if (!meta?.is_valid || meta.app_id !== appId) {
    throw new Error("Invalid Facebook token");
  }

  const profileRes = await axios.get("https://graph.facebook.com/me", {
    params: {
      fields: "id,name,email,picture.type(large)",
      access_token: accessToken,
    },
  });
  const profile = profileRes.data;
  if (!profile?.id) throw new Error("Invalid Facebook profile");

  return {
    providerId: profile.id,
    email: profile.email || null,
    name: profile.name || null,
    avatar: profile.picture?.data?.url || null,
    emailVerified: !!profile.email,
  };
}

async function verifyAppleIdentityToken(identityToken, fallback = {}) {
  const audiences = appleClientIds();
  if (!audiences.length) {
    throw new Error("Apple Sign In is not configured");
  }

  const { payload } = await jwtVerify(identityToken, appleJwks, {
    issuer: "https://appleid.apple.com",
    audience: audiences,
  });

  if (!payload?.sub) throw new Error("Invalid Apple token");

  const email =
    (typeof payload.email === "string" && payload.email) ||
    fallback.email ||
    null;

  return {
    providerId: String(payload.sub),
    email,
    name: fallback.name || null,
    avatar: null,
    emailVerified: payload.email_verified === true || !!email,
  };
}

function apiPublicBase(req) {
  if (process.env.API_PUBLIC_URL) {
    return process.env.API_PUBLIC_URL.replace(/\/+$/, "");
  }
  return `${req.protocol}://${req.get("host")}`;
}

module.exports = {
  verifyGoogleIdToken,
  verifyFacebookAccessToken,
  verifyAppleIdentityToken,
  apiPublicBase,
  googleClientIds,
};
