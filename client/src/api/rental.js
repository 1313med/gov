import { api } from "./axios";

// Public rentals (approved only)
export const getApprovedRentals = (params = {}) =>
  api.get("/rental", { params });

// Rental owner
export const getMyRentals = () => api.get("/rental/mine");

// Admin
export const getAdminRentals = () => api.get("/rental/admin");
export const updateRentalStatus = (id, status) =>
  api.put(`/rental/admin/${id}/status`, { status });
