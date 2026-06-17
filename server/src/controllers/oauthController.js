const asyncHandler = require("express-async-handler");
const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");
const { loadAllowedOrigins } = require("../utils/corsAllow");
const { findOrCreateOAuthUser } = require("../utils/oauthUser");
const { issueAuthSession } = require("../utils/issueAuthSession");
const { signOAuthState, verifyOAuthState } = require("../utils/oauthState");
const {
  verifyGoogleIdToken,
  verifyFacebookAccessToken,
  verifyAppleIdentityToken,
  apiPublicBase,
  googleClientIds,
} = require("../utils/oauthProviders");

function resolveReturnUrl(returnUrl) {
  const allowed = loadAllowedOrigins();
  const fallback = allowed[0] || "http://localhost:5173";
  if (!returnUrl) return fallback;

  try {
    const target = new URL(returnUrl);
    const ok = allowed.some((origin) => {
      try {
        const allowedUrl = new URL(origin);
        return (
          allowedUrl.origin === target.origin ||
          (process.env.NODE_ENV === "production" &&
            target.hostname.endsWith(".vercel.app"))
        );
      } catch {
        return false;
      }
    });
    return ok ? returnUrl : fallback;
  } catch {
    return fallback;
  }
}

function redirectWithStatus(res, returnUrl, params) {
  const url = new URL(resolveReturnUrl(returnUrl));
  Object.entries(params).forEach(([key, value]) => {
    if (value != null) url.searchParams.set(key, value);
  });
  res.redirect(url.toString());
}

async function completeOAuthLogin(req, res, provider, profile) {
  const role = req.body?.role || req.query?.role || "customer";
  let user;
  try {
    user = await findOrCreateOAuthUser(provider, profile, { role });
  } catch (err) {
    if (err.status) res.status(err.status);
    throw err;
  }
  const payload = issueAuthSession(user, res);

  if (req.oauthMode === "redirect") {
    return redirectWithStatus(res, req.oauthReturnUrl, { oauth: "success" });
  }

  return res.json(payload);
}

// ── Token exchange (web GIS / mobile native) ─────────────────────────────────

exports.exchangeGoogle = asyncHandler(async (req, res) => {
  const idToken = req.body?.idToken || req.body?.token;
  if (!idToken) {
    res.status(400);
    throw new Error("idToken is required");
  }
  const profile = await verifyGoogleIdToken(idToken);
  return completeOAuthLogin(req, res, "google", profile);
});

exports.exchangeFacebook = asyncHandler(async (req, res) => {
  const accessToken = req.body?.accessToken || req.body?.token;
  if (!accessToken) {
    res.status(400);
    throw new Error("accessToken is required");
  }
  const profile = await verifyFacebookAccessToken(accessToken);
  return completeOAuthLogin(req, res, "facebook", profile);
});

exports.exchangeApple = asyncHandler(async (req, res) => {
  const identityToken =
    req.body?.identityToken || req.body?.idToken || req.body?.token;
  if (!identityToken) {
    res.status(400);
    throw new Error("identityToken is required");
  }
  const profile = await verifyAppleIdentityToken(identityToken, {
    email: req.body?.email,
    name: req.body?.name,
  });
  return completeOAuthLogin(req, res, "apple", profile);
});

// ── Google redirect flow (web) ───────────────────────────────────────────────

exports.startGoogle = asyncHandler(async (req, res) => {
  const clientId = googleClientIds()[0];
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    res.status(503);
    throw new Error("Google OAuth is not configured");
  }

  const returnUrl = resolveReturnUrl(req.query.returnUrl);
  const role = req.query.role || "customer";
  const state = signOAuthState({ returnUrl, role, provider: "google" });
  const redirectUri = `${apiPublicBase(req)}/api/auth/oauth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

exports.callbackGoogle = asyncHandler(async (req, res) => {
  const { code, state, error } = req.query;
  let returnUrl = resolveReturnUrl();

  try {
    const parsed = verifyOAuthState(state);
    returnUrl = resolveReturnUrl(parsed.returnUrl);
    req.oauthReturnUrl = returnUrl;
    req.oauthMode = "redirect";
    if (req.query) req.query.role = parsed.role;

    if (error || !code) {
      return redirectWithStatus(res, returnUrl, {
        oauth: "error",
        message: error || "oauth_cancelled",
      });
    }

    const clientId = googleClientIds()[0];
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${apiPublicBase(req)}/api/auth/oauth/google/callback`;
    const oauth = new OAuth2Client(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth.getToken(String(code));
    if (!tokens.id_token) throw new Error("Google did not return an id_token");

    const profile = await verifyGoogleIdToken(tokens.id_token);
    return completeOAuthLogin(req, res, "google", profile);
  } catch (err) {
    return redirectWithStatus(res, returnUrl, {
      oauth: "error",
      message: err.message || "oauth_failed",
    });
  }
});

// ── Facebook redirect flow (web) ─────────────────────────────────────────────

exports.startFacebook = asyncHandler(async (req, res) => {
  const appId = process.env.FACEBOOK_APP_ID;
  if (!appId) {
    res.status(503);
    throw new Error("Facebook OAuth is not configured");
  }

  const returnUrl = resolveReturnUrl(req.query.returnUrl);
  const role = req.query.role || "customer";
  const state = signOAuthState({ returnUrl, role, provider: "facebook" });
  const redirectUri = `${apiPublicBase(req)}/api/auth/oauth/facebook/callback`;

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "email,public_profile",
    state,
  });

  res.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params}`);
});

exports.callbackFacebook = asyncHandler(async (req, res) => {
  const { code, state, error } = req.query;
  let returnUrl = resolveReturnUrl();

  try {
    const parsed = verifyOAuthState(state);
    returnUrl = resolveReturnUrl(parsed.returnUrl);
    req.oauthReturnUrl = returnUrl;
    req.oauthMode = "redirect";
    if (req.query) req.query.role = parsed.role;

    if (error || !code) {
      return redirectWithStatus(res, returnUrl, {
        oauth: "error",
        message: error || "oauth_cancelled",
      });
    }

    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const redirectUri = `${apiPublicBase(req)}/api/auth/oauth/facebook/callback`;

    const tokenRes = await axios.get(
      "https://graph.facebook.com/v19.0/oauth/access_token",
      {
        params: {
          client_id: appId,
          client_secret: appSecret,
          redirect_uri: redirectUri,
          code,
        },
      }
    );

    const accessToken = tokenRes.data?.access_token;
    if (!accessToken) throw new Error("Facebook token exchange failed");

    const profile = await verifyFacebookAccessToken(accessToken);
    return completeOAuthLogin(req, res, "facebook", profile);
  } catch (err) {
    return redirectWithStatus(res, returnUrl, {
      oauth: "error",
      message: err.message || "oauth_failed",
    });
  }
});

// ── Public config for clients ────────────────────────────────────────────────

exports.getOAuthConfig = asyncHandler(async (req, res) => {
  res.json({
    google: {
      enabled: googleClientIds().length > 0,
      webClientId: googleClientIds()[0] || null,
    },
    facebook: {
      enabled: !!process.env.FACEBOOK_APP_ID,
      appId: process.env.FACEBOOK_APP_ID || null,
    },
    apple: {
      enabled: !!(process.env.APPLE_CLIENT_ID || "").trim(),
      clientId: (process.env.APPLE_CLIENT_ID || "").split(",")[0]?.trim() || null,
    },
  });
});
