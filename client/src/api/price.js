import { api } from "./axios";

export const estimatePrice = (data) => api.post("/price/estimate", data);
export const getMyAlerts = () => api.get("/price/alerts");
export const createAlert = (data) => api.post("/price/alerts", data);
export const deleteAlert = (id) => api.delete(`/price/alerts/${id}`);
export const toggleAlert = (id) => api.patch(`/price/alerts/${id}/toggle`);
