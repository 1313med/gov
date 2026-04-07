import { api } from "./axios";

export const getConversations = () =>
  api.get("/messages/conversations");

export const startConversation = (data) =>
  api.post("/messages/conversations", data);

export const getMessages = (conversationId) =>
  api.get(`/messages/${conversationId}`);

export const sendMessage = (conversationId, text) =>
  api.post(`/messages/${conversationId}`, { text });
