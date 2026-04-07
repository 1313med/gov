import { api } from "./axios";

// Sale favorites
export const addFavorite = (carId) => api.post(`/user/favorites/${carId}`);
export const removeFavorite = (carId) => api.delete(`/user/favorites/${carId}`);
export const getFavorites = () => api.get("/user/favorites");

// Rental favorites
export const getRentalFavorites = () => api.get("/user/rental-favorites");
export const addRentalFavorite = (id) => api.post(`/user/rental-favorites/${id}`);
export const removeRentalFavorite = (id) => api.delete(`/user/rental-favorites/${id}`);

// Profile
export const getMyProfile = () => api.get("/user/me");
export const updateMyProfile = (data) => api.put("/user/me", data);
