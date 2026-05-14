import { api } from "./client";

export const getMyCar    = ()         => api.get("/user-car/mine");
export const createCar   = (data)     => api.post("/user-car", data);
export const updateCar   = (id, data) => api.put(`/user-car/${id}`, data);
export const deleteCar   = (id)       => api.delete(`/user-car/${id}`);
