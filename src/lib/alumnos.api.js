import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
  API_ORIGIN,
} from "./api";

function normalizeAvatarUrl(rawUrl) {
  if (!rawUrl) return null;
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
  if (rawUrl.startsWith("/")) return `${API_ORIGIN}${rawUrl}`;
  return `${API_ORIGIN}/${rawUrl}`;
}

// ----- GET DATOS -----
export async function fetchAlumnoMe() {
  try {
    const data = await apiGet("/api/alumnos/me/datos");
    if (data?.avatarUrl) data.avatarUrl = normalizeAvatarUrl(data.avatarUrl);
    return data;
  } catch (err) {
    console.error("fetchAlumnoMe error", err);
    return null;
  }
}

// ----- AVATAR -----
export async function uploadAlumnoAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);

  try {
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");

    const res = await fetch(`${API_ORIGIN}/api/alumnos/me/avatar`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      return { ok: false, error: body?.error || "Error al subir avatar" };
    }

    if (body?.avatarUrl) {
      body.avatarUrl = normalizeAvatarUrl(body.avatarUrl);
    }

    return { ok: true, data: body };
  } catch (err) {
    console.error("uploadAlumnoAvatar error", err);
    return { ok: false, error: err.message };
  }
}

// ----- PASSWORD -----
export async function changeAlumnoPassword(newPassword) {
  try {
    const res = await apiPost("/api/alumnos/me/password", {
      password: newPassword,
    });
    return { ok: true, data: res };
  } catch (err) {
    console.error("changeAlumnoPassword error", err);
    return { ok: false, error: err.message };
  }
}

// ----- NOTIFICACIONES -----
export async function fetchAlumnoNotificaciones() {
  try {
    const data = await apiGet("/api/alumnos/me/notificaciones");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchAlumnoNotificaciones error", err);
    return [];
  }
}

// ----- ASISTENCIAS -----
export async function fetchAlumnoAsistencias() {
  try {
    const data = await apiGet("/api/alumnos/me/asistencias");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchAlumnoAsistencias error", err);
    return [];
  }
}

// ----- JUSTIFICACIONES -----
export async function fetchAlumnoJustificaciones() {
  try {
    const data = await apiGet("/api/alumnos/me/justificaciones");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchAlumnoJustificaciones error", err);
    return [];
  }
}

export async function sendAlumnoJustificacion(formData) {
  try {
    const data = await apiPost("/api/alumnos/me/justificaciones", formData);
    return { ok: true, data };
  } catch (err) {
    console.error("sendAlumnoJustificacion error", err);
    return { ok: false, error: err.message };
  }
}
// ----- DOCENTES (contacto) -----
export async function fetchAlumnoDocentes() {
  try {
    const data = await apiGet("/api/alumnos/docentes");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchAlumnoDocentes error", err);
    return [];
  }
}
// ----- INSTITUTO (contacto) -----
export function fetchInstituto() {
  return apiGet("/api/alumnos/instituto");
}
