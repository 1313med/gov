import { api } from "./axios";

export const getReviews = (targetModel, targetId) =>
  api.get(`/reviews/${targetModel}/${targetId}`);

export const createReview = (targetModel, targetId, data) =>
  api.post(`/reviews/${targetModel}/${targetId}`, data);

export const deleteReview = (id) =>
  api.delete(`/reviews/${id}`);
