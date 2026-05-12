import { api } from "./client";

export const getMyBookings = () => api.get("/bookings/mine");
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);
/** @param {{ page?: number, limit?: number, status?: string }} params */
export const getOwnerBookings = (params) => api.get("/bookings/owner", { params });
export const updateBookingStatus = (id, status) =>
  api.put(`/bookings/${id}/status`, { status });
/** Owner: hide completed booking from default list (`archived: true`) or show again (`false`). */
export const setOwnerBookingArchive = (id, body) =>
  api.put(`/bookings/${id}/owner-archive`, body);
export const updateBookingDates = (id, data) =>
  api.put(`/bookings/${id}/dates`, data);
export const markBookingPaid = (id) => api.put(`/bookings/${id}/paid`);
/** JSON body: { conditionPhotos?: { before: string[], after: string[] }, documents?: Array<{name,url,fileType}> } */
export const updateBookingMedia = (id, payload) => api.put(`/bookings/${id}/media`, payload);
