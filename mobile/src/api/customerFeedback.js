import { api } from "./client";

export const submitCustomerFeedback = (body) => api.post("/customer-feedback", body);
export const getFeedbackForBooking = (bookingId) =>
  api.get(`/customer-feedback/booking/${bookingId}`);

/** Past feedback from rental owners about this customer (requires shared booking). */
export const getFeedbackForCustomer = (customerId) =>
  api.get(`/customer-feedback/customer/${customerId}`);
