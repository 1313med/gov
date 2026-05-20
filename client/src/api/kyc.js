import { api } from "./axios";

export const getMyKyc            = ()        => api.get("/kyc/me");
export const submitKyc            = (data)    => api.put("/kyc/me", data);
export const getRenterTrustPassport = (userId) => api.get(`/kyc/trust/${userId}`);
export const adminVerifyKyc       = (userId, data) => api.put(`/kyc/admin/${userId}/verify`, data);
