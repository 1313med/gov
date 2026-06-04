import { api } from "./client";

export const mechanicChat = (data) => api.post("/mechanic/chat", data);
