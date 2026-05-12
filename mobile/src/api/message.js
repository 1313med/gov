import { api } from "./client";

export const getConversations = (params = {}) => api.get("/messages/conversations", { params });
export const startConversation = (data) => api.post("/messages/conversations", data);
export const setConversationArchive = (conversationId, body) =>
  api.put(`/messages/conversations/${conversationId}/archive`, body);
export const getMessages = (conversationId) => api.get(`/messages/${conversationId}`);
export const sendMessage = (conversationId, text) =>
  api.post(`/messages/${conversationId}`, { text });
