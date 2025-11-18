import { apiGet, apiPost, API_ORIGIN } from "./api";

// Helpers
function normalizeAvatarUrl(rawUrl) {
  if (!rawUrl) return null;
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;

  if (rawUrl.startsWith("/")) {
    return `${API_ORIGIN}${rawUrl}`;
  }

  return `${API_ORIGIN}/${rawUrl}`;
}

// Perfil / datos del alumno
export async function fetchAlumnoMe() {
  try {
    const data = await apiGet("/api/alumnos/me/datos");

    if (data && data.avatarUrl) {
      data.avatarUrl = normalizeAvatarUrl(data.avatarUrl);
    }

    return data || null;
  } catch (err) {
    console.error("fetchAlumnoMe error", err);
    return null;
  }
}

// Avatar
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
      const msg = body && body.error ? body.error : `HTTP ${res.status}`;
      return { ok: false, error: msg };
    }

    if (body && body.avatarUrl) {
      body.avatarUrl = normalizeAvatarUrl(body.avatarUrl);
    }

    return { ok: true, data: body };
  } catch (err) {
    console.error("uploadAlumnoAvatar error", err);
    return { ok: false, error: err.message || "Error al subir avatar" };
  }
}

// Contraseña
export async function changeAlumnoPassword(payload) {
  try {
    await apiPost("/api/alumnos/me/password", payload);
    return { ok: true };
  } catch (err) {
    console.error("changeAlumnoPassword error", err);
    return {
      ok: false,
      error: err?.message || "No se pudo cambiar la contraseña.",
    };
  }
}
// =================== NOTIFICACIONES (ALUMNO) ===================
export async function fetchAlumnoNotificaciones() {
  try {
    const data = await apiGet("/api/alumnos/me/notificaciones");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchAlumnoNotificaciones error", err);
    return [];
  }
}

// PATCH: marcar leída / favorito
export async function updateAlumnoNotificacion(id, fields = {}) {
  if (!id) return null;
  try {
    const data = await apiPatch(
      `/api/alumnos/me/notificaciones/${encodeURIComponent(id)}`,
      fields
    );
    return data || null;
  } catch (err) {
    console.error("updateAlumnoNotificacion error", err);
    return null;
  }
}

// DELETE
export async function deleteAlumnoNotificacion(id) {
  if (!id) return false;
  try {
    await apiDelete(
      `/api/alumnos/me/notificaciones/${encodeURIComponent(id)}`
    );
    return true;
  } catch (err) {
    console.error("deleteAlumnoNotificacion error", err);
    return false;
  }
}

// ASISTENCIAS
export async function fetchAlumnoAsistencias() {
  try {
    const data = await apiGet("/api/alumnos/me/asistencias");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchAlumnoAsistencias error", err);
    return [];
  }
}

// JUSTIFICACIONES
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
