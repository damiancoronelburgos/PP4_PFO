// src/controllers/notificaciones.controller.js
import prisma from "../db/prisma.js";

// Normaliza fecha a YYYY-MM-DD
function formatDateLocal(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * GET /api/notificaciones/me
 * Devuelve las notificaciones del alumno logueado
 */
export async function getNotificacionesByAlumno(req, res, next) {
  try {
    const userId = req.user.sub; // tomado de JWT

    if (!userId) {
      return res.status(400).json({ error: "Usuario no válido." });
    }

    const rows = await prisma.notificaciones.findMany({
      where: {
        usuario_id: userId,
      },
      orderBy: [
        { fecha: "desc" },
        { id: "desc" }
      ],
    });

    const out = (rows || []).map((n) => ({
      id: n.id,
      destino: n.destino,
      usuarioId: n.usuario_id,
      fecha: n.fecha ? formatDateLocal(n.fecha) : null,
      titulo: n.titulo,
      detalle: n.detalle || "",
      tipo: n.tipo || "info",
      leida: !!n.leida,
      favorito: !!n.favorito,
      link: n.link || null,
    }));

    return res.json(out);

  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/notificaciones/me/:id
 * Permite actualizar "leida" o "favorito"
 */
export async function updateNotificacionAlumno(req, res, next) {
  try {
    const userId = req.user.sub;
    const id = Number(req.params.id);

    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const notif = await prisma.notificaciones.findFirst({
      where: { id, usuario_id: userId },
    });

    if (!notif) {
      return res.status(404).json({ error: "Notificación no encontrada." });
    }

    const data = {};
    if (typeof req.body.leida === "boolean") data.leida = req.body.leida;
    if (typeof req.body.favorito === "boolean") data.favorito = req.body.favorito;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "Nada para actualizar." });
    }

    const updated = await prisma.notificaciones.update({
      where: { id },
      data,
    });

    return res.json({
      id: updated.id,
      destino: updated.destino,
      usuarioId: updated.usuario_id,
      fecha: updated.fecha ? formatDateLocal(updated.fecha) : null,
      titulo: updated.titulo,
      detalle: updated.detalle || "",
      tipo: updated.tipo || "info",
      leida: !!updated.leida,
      favorito: !!updated.favorito,
      link: updated.link || null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/notificaciones/me/:id
 */
export async function deleteNotificacionAlumno(req, res, next) {
  try {
    const userId = req.user.sub;
    const id = Number(req.params.id);

    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const notif = await prisma.notificaciones.findFirst({
      where: { id, usuario_id: userId },
    });

    if (!notif) {
      return res.status(404).json({ error: "Notificación no encontrada." });
    }

    await prisma.notificaciones.delete({ where: { id } });

    res.status(204).end();

  } catch (err) {
    next(err);
  }
}
