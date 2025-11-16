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