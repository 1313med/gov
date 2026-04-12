import { api } from "./client";

export const getMyProfile = () => api.get("/user/me");
export const updateMyProfile = (data) => api.put("/user/me", data);
export const getSellerProfile = (id) => api.get(`/user/seller/${id}`);

export const getFavorites = () => api.get("/user/favorites");
export const addFavorite = (carId) => api.post(`/user/favorites/${carId}`);
export const removeFavorite = (carId) => api.delete(`/user/favorites/${carId}`);

export const getRentalFavorites = () => api.get("/user/rental-favorites");
export const addRentalFavorite = (id) => api.post(`/user/rental-favorites/${id}`);
export const removeRentalFavorite = (id) => api.delete(`/user/rental-favorites/${id}`);
