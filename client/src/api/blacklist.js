import { api } from "./axios";

export const flagRenter       = (data)     => api.post("/blacklist", data);
export const getMyFlags       = ()         => api.get("/blacklist/my-flags");
export const getRenterFlags   = (renterId) => api.get(`/blacklist/renter/${renterId}`);
export const removeFlag       = (id)       => api.delete(`/blacklist/${id}`);
export const adminUpdateFlag  = (id, data) => api.put(`/blacklist/admin/${id}`, data);
