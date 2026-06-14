import { API_BASE } from "./site";

type ApiOptions = {
  method?: string;
  body?: unknown;
};

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window === "undefined") return headers;
  try {
    const raw = localStorage.getItem("goovoiture_auth");
    if (!raw) return headers;
    const auth = JSON.parse(raw) as { token?: string };
    if (auth?.token) headers.Authorization = `Bearer ${auth.token}`;
  } catch {
    /* ignore */
  }
  return headers;
}

export async function clientApi<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method || "GET",
    credentials: "include",
    headers: authHeaders(),
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error((data as { message?: string })?.message || "Request failed") as Error & {
      status?: number;
      code?: string;
      data?: unknown;
    };
    err.status = res.status;
    err.code = (data as { code?: string })?.code;
    err.data = data;
    throw err;
  }
  return data as T;
}

export function loadClientAuth(): { _id?: string; name?: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("goovoiture_auth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
