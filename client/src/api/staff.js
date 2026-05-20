import { api } from "./axios";

export const inviteStaff           = (data)    => api.post("/staff/invite", data);
export const acceptInvite          = (token)   => api.post("/staff/accept", { token });
export const getMyStaff            = ()        => api.get("/staff/my-team");
export const removeStaff           = (userId)  => api.delete(`/staff/${userId}`);
export const updateStaffPermissions = (userId, permissions) => api.put(`/staff/${userId}/permissions`, { permissions });
