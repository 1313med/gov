import { api } from "./axios";

export const getContractData = (bookingId) => api.get(`/contracts/${bookingId}`);
