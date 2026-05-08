import { api } from "./client";

const normPhone = (p) => String(p || "").replace(/\s/g, "").trim();

const normIdentifier = (value) => {
  const raw = String(value || "").trim();
  return raw.includes("@") ? raw.toLowerCase() : normPhone(raw);
};

export const login = (identifier, password) =>
  api.post("/auth/login", { identifier: normIdentifier(identifier), password });

export const register = (data) =>
  api.post("/auth/register", { ...data, phone: normPhone(data.phone) });

export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", { email: String(email || "").trim() });

export const resetPassword = (token, password) =>
  api.post(`/auth/reset-password/${token}`, { password });

export const verifyEmail = (token) =>
  api.get(`/auth/verify-email/${token}`);
