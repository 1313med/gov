import { api } from "./axios";

export const getOwnerAnalytics = (period = "30d") =>
  api.get("/analytics/owner", { params: { period } }).then((r) => r.data);

export const getOwnerInsights = (period = "30d", lang = "en") =>
  api
    .get("/analytics/owner/insights", {
      params: { period, lang: String(lang).toLowerCase().startsWith("fr") ? "fr" : "en" },
    })
    .then((r) => r.data);

export const getOwnerPricing = () =>
  api.get("/analytics/owner/pricing").then((r) => r.data);
