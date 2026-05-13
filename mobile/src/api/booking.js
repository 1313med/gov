import { api } from "./client";

export const getMyBookings = () => api.get("/bookings/mine");
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);
/** Customer: one-time date change (same rules as server). Body: { startDate, endDate } ISO strings. */
export const rescheduleMyBooking = (id, body) => api.put(`/bookings/${id}/customer-dates`, body);
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

/** Owner: far-future booking — vehicle not available. Body: `{ note?: string }`. */
export const declareOwnerVehicleIssue = (id, body) => api.post(`/bookings/${id}/owner-vehicle-issue`, body);
/** Customer: list same-owner cars free on this booking’s dates. */
export const getAlternativeRentalsForBooking = (id) => api.get(`/bookings/${id}/alternative-rentals`);
/** Customer: `{ choice: 'refund' | 'swap', replacementRentalId?: string }`. */
export const chooseVehicleResolution = (id, body) => api.put(`/bookings/${id}/vehicle-resolution`, body);
/** Owner: mark refund (full cancel or post-swap difference) as processed off-app. */
export const ownerConfirmVehicleRefund = (id) => api.put(`/bookings/${id}/owner-confirm-vehicle-refund`);
