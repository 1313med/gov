import { api } from "./client";

/** @param {{ scope?: "archived" }} [params] */
export const getNotifications = (params) => api.get("/notifications", { params });
export const markAsRead = (id) => api.put(`/notifications/${id}/read`);
export const archiveNotification = (id, archived = true) =>
  api.put(`/notifications/${id}/archive`, { archived });
