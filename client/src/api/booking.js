import { api } from "./axios";

export const getMyBookings = () =>
  api.get("/bookings/mine");

export const getOwnerBookings = () =>
  api.get("/bookings/owner");

export const updateBookingStatus = (id, status) =>
  api.put(`/bookings/${id}/status`, { status });
