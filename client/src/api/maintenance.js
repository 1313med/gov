import { api } from "./axios";

export const createMaintenanceRecord  = (data)     => api.post("/maintenance", data).then((r) => r.data);
export const getAllMaintenance         = ()          => api.get("/maintenance").then((r) => r.data);
export const getMaintenanceForRental  = (rentalId)  => api.get(`/maintenance/rental/${rentalId}`).then((r) => r.data);
export const updateMaintenanceRecord  = (id, data)  => api.put(`/maintenance/${id}`, data).then((r) => r.data);
export const deleteMaintenanceRecord  = (id)        => api.delete(`/maintenance/${id}`).then((r) => r.data);
