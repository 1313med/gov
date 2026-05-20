import { api } from "./axios";

export const addFuelLog          = (data)  => api.post("/fuel-logs", data);
export const getFuelLogs         = (carId) => api.get(`/fuel-logs/${carId}`);
export const getCostOfOwnership  = (carId) => api.get(`/fuel-logs/${carId}/cost-of-ownership`);
export const deleteFuelLog       = (id)    => api.delete(`/fuel-logs/${id}`);
