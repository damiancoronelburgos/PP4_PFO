// src/lib/api.js
const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export async function apiFetch(path, opts = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    token = localStorage.getItem("token") || null,
    signal,
  } = opts;

  const url = `${BASE}${path.startsWith("/") ? path : `/${path}`}`;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body != null ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor");
  }

  // Puede venir vacío (204)
  const raw = await res.text().catch(() => "");
  const parsed = raw ? safeJson(raw) : null;

  if (!res.ok) {
    if (res.status === 401) localStorage.removeItem("token"); // opcional
    const msg = typeof parsed === "string" ? parsed : parsed?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  if (!raw) return null;                 // 204
  return typeof parsed === "string" ? { message: parsed } : parsed;
}

function safeJson(txt) {
  try { return JSON.parse(txt); } catch { return txt; }
}

// helpers opcionales
export const api = {
  get: (p, o) => apiFetch(p, { ...o, method: "GET" }),
  post: (p, b, o) => apiFetch(p, { ...o, method: "POST", body: b }),
  put: (p, b, o) => apiFetch(p, { ...o, method: "PUT", body: b }),
  patch: (p, b, o) => apiFetch(p, { ...o, method: "PATCH", body: b }),
  del: (p, o) => apiFetch(p, { ...o, method: "DELETE" }),
};