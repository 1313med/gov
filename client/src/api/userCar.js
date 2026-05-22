import { api } from "./axios";

export const getMyCar = () => api.get("/user-car/mine");
export const createCar = (data) => api.post("/user-car", data);
export const updateCar = (id, data) => api.put(`/user-car/${id}`, data);
export const deleteCar = (id) => api.delete(`/user-car/${id}`);

export const patchMileage = (id, data) => api.patch(`/user-car/${id}/mileage`, data);
export const patchGarageReminders = (id, remindersEnabled) =>
  api.patch(`/user-car/${id}/reminders`, { remindersEnabled });

export const getServiceLogs = () => api.get("/user-car/mine/services");
export const createServiceLog = (data) => api.post("/user-car/mine/services", data);
export const deleteServiceLog = (logId) => api.delete(`/user-car/services/${logId}`);
export const patchDocuments = (id, docs) =>
  api.patch(`/user-car/${id}/documents`, { scannedDocuments: docs });
