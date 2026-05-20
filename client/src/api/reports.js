import { api } from "./axios";

export const reportListing       = (data)        => api.post("/reports", data);
export const adminGetReports     = (params)      => api.get("/reports/admin", { params });
export const adminUpdateReport   = (id, data)    => api.put(`/reports/admin/${id}`, data);
