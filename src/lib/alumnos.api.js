import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
  apiPostForm,
  API_ORIGIN,
} from "./api";

// ============================
// Normalizar URL de avatar
// ============================
function normalizeAvatarUrl(rawUrl) {
  if (!rawUrl) return null;
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
  if (rawUrl.startsWith("/")) return `${API_ORIGIN}${rawUrl}`;
  return `${API_ORIGIN}/${rawUrl}`;
}

// ============================
// PERFIL — GET DATOS
// ============================
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

// ============================
// PERFIL — SUBIR AVATAR
// ============================
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

// ============================
// PERFIL — CAMBIAR CONTRASEÑA
// (corregido para coincidir con backend real)
// ============================
export async function changeAlumnoPassword(currentPassword, newPassword, confirmPassword) {
  try {
    const res = await apiPost("/api/alumnos/me/password", {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return { ok: true, data: res };
  } catch (err) {
    console.error("changeAlumnoPassword error", err);
    return { ok: false, error: err.message };
  }
}

// ============================
// NOTIFICACIONES
// ============================
export async function fetchAlumnoNotificaciones() {
  try {
    const data = await apiGet("/api/alumnos/me/notificaciones");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchAlumnoNotificaciones error", err);
    return [];
  }
}

// ============================
// ASISTENCIAS
// ============================
export async function fetchAlumnoAsistencias() {
  try {
    const data = await apiGet("/api/alumnos/me/asistencias");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchAlumnoAsistencias error", err);
    return [];
  }
}

// ============================
// JUSTIFICACIONES
// ============================
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
    const data = await apiPostForm("/api/alumnos/me/justificaciones", formData);
    return { ok: true, data };
  } catch (err) {
    console.error("sendAlumnoJustificacion error", err);
    return { ok: false, error: err.message };
  }
}

// ============================
// CONTACTO — DOCENTES (SE MANTIENE TU FUNCIÓN ORIGINAL)
// ============================
export async function fetchAlumnoDocentes() {
  try {
    const data = await apiGet("/api/alumnos/docentes");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchAlumnoDocentes error", err);
    return [];
  }
}

// ============================
// CONTACTO — INSTITUTO
// ============================
export function fetchInstituto() {
  return apiGet("/api/alumnos/instituto");
}
