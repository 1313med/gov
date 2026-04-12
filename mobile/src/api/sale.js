import { api } from "./client";

export const getApprovedSales = (params = {}) => api.get("/sale", { params });
export const getSaleById = (id) => api.get(`/sale/${id}`);
export const getMySales = () => api.get("/sale/mine");
export const createSale = (formData) =>
  api.post("/sale", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const updateSale = (id, data) => api.put(`/sale/${id}`, data);
export const deleteSale = (id) => api.delete(`/sale/${id}`);
export const markAsSold = (id) => api.put(`/sale/${id}/sold`);
export const getAdminSales = () => api.get("/sale/admin");
export const updateSaleStatus = (id, status) =>
  api.put(`/sale/admin/${id}/status`, { status });
