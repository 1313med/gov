import { api } from "./client";

export const verifyUserNationalId = (userId, verified = true) =>
  api.put(`/admin/users/${userId}/national-id/verify`, { verified });
