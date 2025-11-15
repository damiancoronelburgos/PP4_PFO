const API_BASE = (
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api"
).replace(/\/+$/, "");

export const API_ORIGIN = API_BASE.replace(/\/api$/, "");

function normalizePath(path) {
  if (!path.startsWith("/")) path = `/${path}`;

  const baseHasApi = API_BASE.endsWith("/api");

  if (baseHasApi && path.startsWith("/api/")) {
    // BASE ya tiene /api, y el path también -> evitar /api/api/...
    path = path.slice(4); // "/api".length === 4 => queda "/resto"
  } else if (!baseHasApi && !path.startsWith("/api/")) {
    // BASE sin /api y path sin /api -> lo agregamos
    path = `/api${path}`;
  }

  return path;
}

function buildUrl(path) {
  return `${API_BASE}${normalizePath(path)}`;
}

function authHeader() {
  const t = localStorage.getItem("token") || localStorage.getItem("authToken");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function handleResponse(res) {
  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
    }
    const msg =
      body && typeof body === "object" && body.error
        ? body.error
        : typeof body === "string" && body
        ? body
        : `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return body;
}

// === API NUEVA (que ya estás usando en preceptor.api) ===

export async function apiGet(path) {
  const res = await fetch(buildUrl(path), {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...authHeader(),
    },
  });
  return handleResponse(res);
}

export async function apiPost(path, data) {
  const res = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(data ?? {}),
  });
  return handleResponse(res);
}

export async function apiPostForm(path, formData) {
  const res = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...authHeader(),
    },
    body: formData,
  });
  return handleResponse(res);
}

export async function apiPut(path, data) {
  const res = await fetch(buildUrl(path), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(data ?? {}),
  });
  return handleResponse(res);
}

// ⬇⬇⬇ NUEVO: apiPatch para la API nueva
export async function apiPatch(path, data) {
  const res = await fetch(buildUrl(path), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(data ?? {}),
  });
  return handleResponse(res);
}
// ⬆⬆⬆

export async function apiDelete(path) {
  const res = await fetch(buildUrl(path), {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      ...authHeader(),
    },
  });
  return handleResponse(res);
}

// === API VIEJA (compatibilidad) ===

export async function apiFetch(path, opts = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    token,
    signal,
  } = opts;

  const auth =
    token != null
      ? { Authorization: `Bearer ${token}` }
      : authHeader();

  const res = await fetch(buildUrl(path), {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...auth,
      ...headers,
    },
    body: body != null ? JSON.stringify(body) : undefined,
    signal,
  });

  return handleResponse(res);
}

export const api = {
  get: (p, o) => apiFetch(p, { ...o, method: "GET" }),
  post: (p, b, o) => apiFetch(p, { ...o, method: "POST", body: b }),
  put: (p, b, o) => apiFetch(p, { ...o, method: "PUT", body: b }),
  patch: (p, b, o) => apiFetch(p, { ...o, method: "PATCH", body: b }),
  del: (p, o) => apiFetch(p, { ...o, method: "DELETE" }),
};