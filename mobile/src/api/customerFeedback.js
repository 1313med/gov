import { api } from "./client";

export const submitCustomerFeedback = (body) => api.post("/customer-feedback", body);
export const getFeedbackForBooking = (bookingId) =>
  api.get(`/customer-feedback/booking/${bookingId}`);
