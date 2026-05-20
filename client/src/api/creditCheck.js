import { api } from "./axios";

export const requestCreditCheck      = (data)       => api.post("/credit-check", data);
export const getMyCreditChecks       = ()           => api.get("/credit-check/my");
export const getCreditCheckById      = (id)         => api.get(`/credit-check/${id}`);
export const getListingCreditStatus  = (listingId)  => api.get(`/credit-check/listing/${listingId}`);
export const adminUpdateCreditCheck  = (id, data)   => api.put(`/credit-check/admin/${id}`, data);
