import { api } from "./axios";

export const getMySales = () => api.get("/sale/mine");
export const deleteSale = (id) => api.delete(`/sale/${id}`);
export const getApprovedSales = () => api.get("/sale");
