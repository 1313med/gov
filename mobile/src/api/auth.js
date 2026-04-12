import { api } from "./client";

export const login = (phone, password) =>
  api.post("/auth/login", { phone, password });

export const register = (data) =>
  api.post("/auth/register", data);
