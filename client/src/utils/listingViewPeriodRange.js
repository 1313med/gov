/** Query params for GET /rental/owner/listing-views */
export function getListingViewQueryParams(period) {
  if (period === "all") return { period: "all" };
  const now = new Date();

  if (period === "today") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    return { period, from: start.toISOString(), to: now.toISOString() };
  }

  if (period === "yesterday") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    end.setMilliseconds(-1);
    return { period, from: start.toISOString(), to: end.toISOString() };
  }

  if (period === "last_week") {
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { period, from: start.toISOString(), to: now.toISOString() };
  }

  if (period === "last_month") {
    const y = now.getFullYear();
    const m = now.getMonth();
    const py = m === 0 ? y - 1 : y;
    const pm = m === 0 ? 11 : m - 1;
    const start = new Date(py, pm, 1, 0, 0, 0, 0);
    const end = new Date(py, pm + 1, 0, 23, 59, 59, 999);
    return { period, from: start.toISOString(), to: end.toISOString() };
  }

  if (period === "year") {
    const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    return { period, from: start.toISOString(), to: now.toISOString() };
  }

  return { period: "all" };
}
