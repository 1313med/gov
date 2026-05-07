import { api } from "./axios";

export const submitCustomerFeedback  = (data)        => api.post("/customer-feedback", data);
export const getFeedbackForBooking   = (bookingId)   => api.get(`/customer-feedback/booking/${bookingId}`);
export const getCustomerReputation   = (customerId)  => api.get(`/customer-feedback/customer/${customerId}`);
