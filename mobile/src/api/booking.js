import { api } from "./client";

export const getMyBookings = () => api.get("/bookings/mine");
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);
/** Customer: one-time date change (same rules as server). Body: { startDate, endDate } ISO strings. */
export const rescheduleMyBooking = (id, body) => api.put(`/bookings/${id}/customer-dates`, body);
/** @param {{ page?: number, limit?: number, status?: string }} params */
export const getOwnerBookings = (params) => api.get("/bookings/owner", { params });
/** Owner: single booking row (notifications deep link). */
export const getOwnerBookingOne = (id) => api.get(`/bookings/owner/booking/${id}`);
export const updateBookingStatus = (id, status) =>
  api.put(`/bookings/${id}/status`, { status });
/** Owner: hide booking from default list or restore (`archived: true|false`). Completed, rejected, or cancelled. */
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
/** Owner: clears “new request” highlight on a pending booking. */
export const ownerClearBookingNewFlag = (id) => api.put(`/bookings/${id}/owner-clear-booking-new`);
/** Owner: count of bookings needing attention (new / changed / cancelled since last hub visit). */
export const getOwnerBookingAttentionCount = () => api.get("/bookings/owner/attention-count");
/** Owner: clear attention flags (call when leaving bookings hub). */
export const clearOwnerBookingAlerts = () => api.post("/bookings/owner/clear-booking-alerts");
/** Owner: clear “date changed” style alert after reading (not for pending — use confirm/reject). */
export const ownerAckBookingAlert = (id) => api.put(`/bookings/${id}/owner-ack-booking-alert`);
/** Customer: post-trip review `{ overall: 'good'|'bad', note?: string }`. */
export const submitBookingCustomerReview = (id, body) => api.post(`/bookings/${id}/customer-booking-review`, body);
export const getBookingCustomerReview = (id) => api.get(`/bookings/${id}/customer-booking-review`);
/** Customer: request extension. Body: { newEndDate: ISO string }. */
export const requestBookingExtension = (id, body) => api.post(`/extensions/${id}`, body);
