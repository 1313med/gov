import { api } from "./axios";

export const getMechanicPrices = (params) =>
  api.get("/garage-intel/mechanic-prices", { params });

export const submitMechanicPrice = (data) =>
  api.post("/garage-intel/mechanic-prices/submit", data);

export const evaluateMechanicQuote = (data) =>
  api.post("/garage-intel/mechanic-prices/evaluate", data);

export const getHealthScore = () => api.get("/garage-intel/health-score");

export const getMyCarWorth = (city) =>
  api.get("/garage-intel/car-worth", { params: { city } });

export const previewCarWorth = (data) =>
  api.post("/garage-intel/car-worth/preview", data);

export const getFuelCompare = (carId) =>
  api.get(`/garage-intel/fuel-compare/${carId}`);

export const getTravelReady = () => api.get("/garage-intel/travel-ready");

export const getCommunityInsights = (params) =>
  api.get("/garage-intel/community", { params });

export const postCommunityInsight = (data) =>
  api.post("/garage-intel/community", data);

export const affordCalculator = (data) =>
  api.post("/garage-intel/afford", data);

export const getEmergencyGuide = () =>
  api.get("/garage-intel/emergency-guide");
