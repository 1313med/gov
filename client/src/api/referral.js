import { api } from "./axios";

export const getMyReferral     = ()     => api.get("/referral/me");
export const applyReferralCode = (code) => api.post("/referral/apply", { code });
