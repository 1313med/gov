import { api } from "./client";

export const getApprovedSales = (params = {}) => api.get("/sale", { params });
export const getSaleById = (id) => api.get(`/sale/${id}`);
export const getMySales = () => api.get("/sale/mine");
/** JSON body; `images` must be an array of HTTPS URLs (upload via /upload/images first). */
export const createSale = (payload) => api.post("/sale", payload);
export const updateSale = (id, data) => api.put(`/sale/${id}`, data);
export const deleteSale = (id) => api.delete(`/sale/${id}`);
export const markAsSold = (id) => api.put(`/sale/${id}/sold`);
export const getAdminSales = () => api.get("/sale/admin");
export const updateSaleStatus = (id, status) =>
  api.put(`/sale/admin/${id}/status`, { status });
