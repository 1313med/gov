import { api } from "./client";

export const getMyBookings = () => api.get("/bookings/mine");
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);
export const getOwnerBookings = () => api.get("/bookings/owner");
export const updateBookingStatus = (id, status) =>
  api.put(`/bookings/${id}/status`, { status });
export const updateBookingDates = (id, data) =>
  api.put(`/bookings/${id}/dates`, data);
export const markBookingPaid = (id) => api.put(`/bookings/${id}/paid`);
export const updateBookingMedia = (id, formData) =>
  api.put(`/bookings/${id}/media`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
