import { api } from "./axios";

export const addFavorite = (carId) => api.post(`/user/favorites/${carId}`);
export const removeFavorite = (carId) =>
  api.delete(`/user/favorites/${carId}`);
export const getFavorites = () => api.get("/user/favorites");