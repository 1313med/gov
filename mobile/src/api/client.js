import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../config";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const raw = await SecureStore.getItemAsync("goovoiture_auth");
  if (raw) {
    const auth = JSON.parse(raw);
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
  }
  return config;
});
