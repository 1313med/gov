import axios from "axios";
import { loadAuth } from "../utils/authStorage";

export const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const auth = loadAuth(); // <-- gets { token, name, role, ... }

  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }

  return config;
});
