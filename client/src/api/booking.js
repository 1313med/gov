import { api } from "./axios";

export const getMyBookings = () =>
  api.get("/bookings/mine");

// params: { page, limit, status }
export const getOwnerBookings = (params = {}) =>
  api.get("/bookings/owner", { params });

export const updateBookingStatus = (id, status) =>
  api.put(`/bookings/${id}/status`, { status });

export const updateBookingDates = (id, data) =>
  api.put(`/bookings/${id}/dates`, data);

export const markBookingPaid = (id) =>
  api.put(`/bookings/${id}/paid`);

export const updateBookingMedia = (id, data) =>
  api.put(`/bookings/${id}/media`, data);