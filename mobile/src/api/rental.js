import { api } from "./client";

export const getApprovedRentals = (params = {}) => api.get("/rental", { params });
export const getRentalById = (id) => api.get(`/rental/${id}`);
export const getMyRentals = () => api.get("/rental/mine");
export const getOwnerRentals = () => api.get("/rental/owner/mine");
export const createRental = (formData) =>
  api.post("/rental", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const updateRental = (id, data) => api.put(`/rental/${id}`, data);
export const deleteRental = (id) => api.delete(`/rental/${id}`);
export const bookRental = (id, data) => api.post(`/rental/${id}/book`, data);
export const getRentalBookings = (id) => api.get(`/rental/${id}/bookings`);
export const getOwnerBookings = () => api.get("/rental/owner/bookings");
export const getAdminRentals = () => api.get("/rental/admin");
export const updateRentalStatus = (id, status) =>
  api.put(`/rental/admin/${id}/status`, { status });
