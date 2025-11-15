import { apiGet, apiPost, apiPatch, apiDelete, API_ORIGIN } from "./api";

function normalizeAvatarUrl(rawUrl) {
  if (!rawUrl) return null;
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;

  if (rawUrl.startsWith("/")) {
    return `${API_ORIGIN}${rawUrl}`;
  }

  return `${API_ORIGIN}/${rawUrl}`;
}

// Datos del preceptor logueado
export async function fetchPreceptorMe() {
  try {
    const data = await apiGet("/api/preceptores/me/datos");

    if (data && data.avatarUrl) {
      data.avatarUrl = normalizeAvatarUrl(data.avatarUrl);
    }

    return data || null;
  } catch (err) {
    console.error("fetchPreceptorMe error", err);
    return null;
  }
}

// Comisiones asignadas al preceptor logueado
export async function fetchPreceptorComisiones() {
  try {
    const data = await apiGet("/api/preceptores/me/comisiones");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchPreceptorComisiones error", err);
    return [];
  }
}

// Métricas de alumnos (panel Alumnos)
export async function fetchPreceptorAlumnosMetrics() {
  try {
    const data = await apiGet("/api/preceptores/me/alumnos-metrics");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchPreceptorAlumnosMetrics error", err);
    return [];
  }
}

// Fechas con asistencia cargada para una comisión
export async function fetchPreceptorAsistenciaFechas(comisionId) {
  if (!comisionId) return [];
  try {
    const data = await apiGet(
      `/api/preceptores/me/asistencias/fechas?comisionId=${encodeURIComponent(
        comisionId
      )}`
    );
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchPreceptorAsistenciaFechas error", err);
    return [];
  }
}

// Lista de alumnos + estado de asistencia para una comisión y fecha
export async function fetchPreceptorAsistenciaLista(comisionId, fecha) {
  if (!comisionId || !fecha) return [];
  try {
    const data = await apiGet(
      `/api/preceptores/me/asistencias?comisionId=${encodeURIComponent(
        comisionId
      )}&fecha=${encodeURIComponent(fecha)}`
    );
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchPreceptorAsistenciaLista error", err);
    return [];
  }
}

// Guardar asistencia de una comisión y fecha
// payload: { comisionId, fecha, items: [{ alumnoId, estado }, ...] }
export async function savePreceptorAsistencia(payload) {
  try {
    await apiPost("/api/preceptores/me/asistencias", payload);
    return { ok: true };
  } catch (err) {
    console.error("savePreceptorAsistencia error", err);
    return {
      ok: false,
      error: err?.message || "No se pudo guardar la asistencia.",
    };
  }
}


// Notificaciones del preceptor logueado
export async function fetchPreceptorNotificaciones() {
  try {
    const data = await apiGet("/api/preceptores/me/notificaciones");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchPreceptorNotificaciones error", err);
    return [];
  }
}

// Actualizar notificación (leída / favorita)
// fields: { leida?: boolean, favorito?: boolean }
export async function updatePreceptorNotificacion(id, fields = {}) {
  if (!id) return null;

  const payload = {};
  if (typeof fields.leida === "boolean") payload.leida = fields.leida;
  if (typeof fields.favorito === "boolean") payload.favorito = fields.favorito;

  if (Object.keys(payload).length === 0) return null;

  try {
    const data = await apiPatch(
      `/api/preceptores/me/notificaciones/${encodeURIComponent(id)}`,
      payload
    );
    return data || null;
  } catch (err) {
    console.error("updatePreceptorNotificacion error", err);
    return null;
  }
}

export async function deletePreceptorNotificacion(id) {
  if (!id) return false;
  try {
    await apiDelete(
      `/api/preceptores/me/notificaciones/${encodeURIComponent(id)}`
    );
    return true;
  } catch (err) {
    console.error("deletePreceptorNotificacion error", err);
    return false;
  }
}

export async function sendPreceptorComunicado(payload) {
  try {
    const data = await apiPost("/api/preceptores/me/comunicaciones", payload);
    return { ok: true, data };
  } catch (err) {
    console.error("sendPreceptorComunicado error", err);
    return {
      ok: false,
      error: err?.message || "No se pudo enviar el comunicado.",
    };
  }
}

export async function uploadPreceptorAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);

  try {
    const res = await fetch(
      `${API_ORIGIN}/api/preceptores/me/avatar`,
      {
        method: "POST",
        headers: {
          ...(localStorage.getItem("token") && {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }),
        },
        body: formData,
      }
    );

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      const msg =
        body && body.error
          ? body.error
          : `HTTP ${res.status}`;
      return { ok: false, error: msg };
    }

    if (body && body.avatarUrl) {
      body.avatarUrl = normalizeAvatarUrl(body.avatarUrl);
    }

    return { ok: true, data: body };
  } catch (err) {
    console.error("uploadPreceptorAvatar error", err);
    return { ok: false, error: err.message || "Error al subir avatar" };
  }
}

// Cambio de contraseña del preceptor logueado
export async function changePreceptorPassword(payload) {
  try {
    await apiPost("/api/preceptores/me/password", payload);
    return { ok: true };
  } catch (err) {
    console.error("changePreceptorPassword error", err);
    return {
      ok: false,
      error: err?.message || "No se pudo cambiar la contraseña.",
    };
  }
}