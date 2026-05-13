import { api } from "./axios";

export const getMyBookings = () =>
  api.get("/bookings/mine");

export const rescheduleMyBooking = (id, data) =>
  api.put(`/bookings/${id}/customer-dates`, data);

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

export const confirmReturn = (id) =>
  api.put(`/bookings/${id}/confirm-return`);

export const declareOwnerVehicleIssue = (id, body) =>
  api.post(`/bookings/${id}/owner-vehicle-issue`, body);
export const getAlternativeRentalsForBooking = (id) =>
  api.get(`/bookings/${id}/alternative-rentals`);
export const chooseVehicleResolution = (id, body) =>
  api.put(`/bookings/${id}/vehicle-resolution`, body);
export const ownerConfirmVehicleRefund = (id) =>
  api.put(`/bookings/${id}/owner-confirm-vehicle-refund`);
export const ownerAckBookingAlert = (id) =>
  api.put(`/bookings/${id}/owner-ack-booking-alert`);
export const submitBookingCustomerReview = (id, body) =>
  api.post(`/bookings/${id}/customer-booking-review`, body);
export const getBookingCustomerReview = (id) =>
  api.get(`/bookings/${id}/customer-booking-review`);