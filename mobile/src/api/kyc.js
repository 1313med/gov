import { api } from "./client";

export const getRenterTrustPassport = (userId) => api.get(`/kyc/trust/${userId}`);
export const submitKycDocuments = (body) => api.post("/kyc/submit", body);
export const getMyKycStatus = () => api.get("/kyc/me");
