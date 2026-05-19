import { api } from "./axios";

export const verifyUserNationalId = (userId, verified = true) =>
  api.put(`/admin/users/${userId}/national-id/verify`, { verified });

export const getPendingCinUsers = (params = {}) =>
  api.get("/admin/users", { params: { cinPending: true, limit: 50, ...params } });
