import { api } from "./client";

export const getOAuthConfig = () => api.get("/auth/oauth/config");

export const exchangeGoogleToken = (idToken, role) =>
  api.post("/auth/oauth/google", { idToken, role });

export const exchangeFacebookToken = (accessToken, role) =>
  api.post("/auth/oauth/facebook", { accessToken, role });

export const exchangeAppleToken = (identityToken, extras = {}) =>
  api.post("/auth/oauth/apple", {
    identityToken,
    email: extras.email,
    name: extras.name,
    role: extras.role,
  });
