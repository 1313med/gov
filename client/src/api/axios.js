import axios from "axios";
import { loadAuth } from "../utils/authStorage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  // Sends the httpOnly cookie on every request automatically
  withCredentials: true,
});

/**
 * Fallback: if localStorage still has a legacy `token` (users who haven't
 * re-logged-in since the httpOnly cookie migration), send it as Bearer so
 * their session keeps working without forcing an immediate re-login.
 */
api.interceptors.request.use((config) => {
  const auth = loadAuth();
  if (auth?.token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});
