import { api } from "./axios";

export const getOwnerAnalytics = (period = "30d") =>
  api.get("/analytics/owner", { params: { period } }).then((r) => r.data);

export const getOwnerInsights = (period = "30d") =>
  api.get("/analytics/owner/insights", { params: { period } }).then((r) => r.data);
