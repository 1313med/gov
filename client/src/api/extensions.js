import { api } from "./axios";

export const requestExtension  = (bookingId, newEndDate) => api.post(`/extensions/${bookingId}`, { newEndDate });
export const respondExtension  = (bookingId, decision)   => api.put(`/extensions/${bookingId}/respond`, { decision });
