import { api } from "./axios";

export const getSaleFairPrice      = (params) => api.get("/fair-price/sale", { params });
export const getRentalFairPrice    = (params) => api.get("/fair-price/rental", { params });
export const getCompetitorPricing  = (params) => api.get("/fair-price/competitor", { params });
