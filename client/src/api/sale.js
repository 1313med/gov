import { api } from "./axios";

export const getMySales = () => api.get("/sale/mine");
export const deleteSale = (id) => api.delete(`/sale/${id}`);
export const getApprovedSales = (params = {}) =>
  api.get("/sale", { params });
export const updateSaleStatus = (id, status) =>
  api.put(`/sale/${id}`, { status });
