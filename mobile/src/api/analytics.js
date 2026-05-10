import { api } from "./client";

export const getOwnerAnalytics = async (period = "30d") => {
  const { data } = await api.get("/analytics/owner", { params: { period } });
  return data;
};

export const getOwnerInsights = async (period = "30d", lang = "en") => {
  const { data } = await api.get("/analytics/owner/insights", {
    params: { period, lang: String(lang).toLowerCase().startsWith("fr") ? "fr" : "en" },
  });
  return data;
};

export const getAdminStats = () => api.get("/admin/stats");
