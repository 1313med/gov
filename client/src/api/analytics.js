import { api } from "./axios";

/*
|--------------------------------------------------------------------------
| OWNER ANALYTICS
|--------------------------------------------------------------------------
*/

export const getOwnerAnalytics = async () => {
  const { data } = await api.get("/analytics/owner");
  return data;
};