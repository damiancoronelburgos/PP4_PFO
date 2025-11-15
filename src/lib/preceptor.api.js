import { apiGet, apiPost, apiPatch, apiDelete, API_ORIGIN } from "./api";

// ===== Helpers =====
function normalizeAvatarUrl(rawUrl) {
  if (!rawUrl) return null;
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;

  if (rawUrl.startsWith("/")) {
    return `${API_ORIGIN}${rawUrl}`;
  }

  return `${API_ORIGIN}/${rawUrl}`;
}

function normalizeDocumentoUrl(rawUrl) {
  if (!rawUrl) return null;
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
  if (!rawUrl.startsWith("/")) rawUrl = `/${rawUrl}`;
  return `${API_ORIGIN}${rawUrl}`;
}

// ===== Perfil / Datos del preceptor =====
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

// ===== Comisiones / Alumnos =====
export async function fetchPreceptorComisiones() {
  try {
    const data = await apiGet("/api/preceptores/me/comisiones");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchPreceptorComisiones error", err);
    return [];
  }
}

export async function fetchPreceptorAlumnosMetrics() {
  try {
    const data = await apiGet("/api/preceptores/me/alumnos-metrics");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchPreceptorAlumnosMetrics error", err);
    return [];
  }
}

// ===== Asistencias =====
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

// ===== Justificaciones =====
export async function fetchPreceptorJustificaciones() {
  try {
    const data = await apiGet("/api/preceptores/me/justificaciones");
    if (!Array.isArray(data)) return [];

    return data.map((j) => ({
      ...j,
      documentoUrl: j.documentoUrl
        ? normalizeDocumentoUrl(j.documentoUrl)
        : null,
    }));
  } catch (err) {
    console.error("fetchPreceptorJustificaciones error", err);
    return [];
  }
}

// updates: [{ id, estado: 'pendiente' | 'aprobada' | 'rechazada' }, ...]
export async function savePreceptorJustificacionesEstado(updates) {
  try {
    const payload = { updates: Array.isArray(updates) ? updates : [] };
    const data = await apiPost(
      "/api/preceptores/me/justificaciones/estado",
      payload
    );
    return { ok: true, data };
  } catch (err) {
    console.error("savePreceptorJustificacionesEstado error", err);
    return {
      ok: false,
      error: err?.message || "No se pudieron guardar los cambios.",
    };
  }
}

// ===== Notificaciones =====
export async function fetchPreceptorNotificaciones() {
  try {
    const data = await apiGet("/api/preceptores/me/notificaciones");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchPreceptorNotificaciones error", err);
    return [];
  }
}

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

// ===== Comunicaciones =====
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

// ===== Avatar / Contraseña =====
export async function uploadPreceptorAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_ORIGIN}/api/preceptores/me/avatar`, {
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
    console.error("uploadPreceptorAvatar error", err);
    return { ok: false, error: err.message || "Error al subir avatar" };
  }
}

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

// ===== Calendario =====
export async function fetchPreceptorEventosCalendario() {
  try {
    const data = await apiGet("/api/preceptores/me/eventos-calendario");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("fetchPreceptorEventosCalendario error", err);
    return [];
  }
}

// payload: { fecha: "YYYY-MM-DD", titulo: string, comisionId: number }
export async function createPreceptorEventoCalendario(payload) {
  try {
    const data = await apiPost(
      "/api/preceptores/me/eventos-calendario",
      payload
    );
    return { ok: true, data };
  } catch (err) {
    console.error("createPreceptorEventoCalendario error", err);
    return {
      ok: false,
      error: err?.message || "No se pudo crear el evento.",
    };
  }
}

export async function deletePreceptorEventoCalendario(id) {
  if (!id) return false;
  try {
    await apiDelete(
      `/api/preceptores/me/eventos-calendario/${encodeURIComponent(id)}`
    );
    return true;
  } catch (err) {
    console.error("deletePreceptorEventoCalendario error", err);
    return false;
  }
}