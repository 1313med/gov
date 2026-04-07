import { api } from "./axios";

export const getMyBookings = () =>
  api.get("/bookings/mine");

export const getOwnerBookings = () =>
  api.get("/bookings/owner");

export const updateBookingStatus = (id, status) =>
  api.put(`/bookings/${id}/status`, { status });

export const updateBookingDates = (id, data) =>
  api.put(`/bookings/${id}/dates`, data);

export const markBookingPaid = (id) =>
  api.put(`/bookings/${id}/paid`);

export const updateBookingMedia = (id, data) =>
  api.put(`/bookings/${id}/media`, data);