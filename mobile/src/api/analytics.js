import { api } from "./client";

export const getOwnerAnalytics = async (period = "30d") => {
  const { data } = await api.get("/analytics/owner", { params: { period } });
  return data;
};

export const getAdminStats = () => api.get("/admin/stats");
