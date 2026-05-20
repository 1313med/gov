import { api } from "./client";

export const reportListing = (body) => api.post("/reports", body);
