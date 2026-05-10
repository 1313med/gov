import { api } from "./client";

export const getAllMaintenance = () => api.get("/maintenance");
export const getMaintenanceForRental = (rentalId) => api.get(`/maintenance/rental/${rentalId}`);
export const createMaintenanceRecord = (data) => api.post("/maintenance", data);
export const deleteMaintenanceRecord = (id) => api.delete(`/maintenance/${id}`);
