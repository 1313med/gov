import { api } from "./client";

const normPhone = (p) => String(p || "").replace(/\s/g, "").trim();

export const login = (phone, password) =>
  api.post("/auth/login", { phone: normPhone(phone), password });

export const register = (data) =>
  api.post("/auth/register", { ...data, phone: normPhone(data.phone) });
