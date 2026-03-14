import { api } from "./axios";

/*
|--------------------------------------------------------------------------
| OWNER ANALYTICS
|--------------------------------------------------------------------------
*/

export const getOwnerAnalytics = async (period = "30d") => {

  const { data } = await api.get("/analytics/owner", {
    params: { period }
  });

  return data;

};
