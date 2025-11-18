import { Router } from "express";
import prisma from "../db/prisma.js";
import { auth as authRequired } from "../middlewares/auth.js";

const router = Router();

/**
 * GET /api/calendario/docente/eventos
 */
router.get("/docente/eventos", authRequired, async (req, res) => {
  try {
    const { year, month } = req.query;
    const usuarioId = req.user.id;

    if (!year || !month) {
      return res.status(400).json({ error: "Parámetros year y month requeridos" });
    }

    const docente = await prisma.docentes.findFirst({
      where: { usuario_id: usuarioId },
      select: { id: true },
    });

    if (!docente) {
      return res.status(403).json({ error: "No es docente válido" });
    }

    const yearInt = Number(year);
    const monthInt = Number(month);

    const start = new Date(Date.UTC(yearInt, monthInt - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(yearInt, monthInt, 1, 0, 0, 0));

    const eventos = await prisma.eventos.findMany({
      where: {
        AND: [
          { fecha: { gte: start } },
          { fecha: { lt: end } },
          {
            OR: [
              { comision_id: null },
              { comisiones: { docente_id: docente.id } },
            ],
          },
        ],
      },
      include: {
        comisiones: { select: { codigo: true } },
      },
      orderBy: { fecha: "asc" },
    });

    const map = {};
    for (const ev of eventos) {
      const day = new Date(ev.fecha).getUTCDate();
      if (!map[day]) map[day] = [];
      map[day].push({
        id: ev.id,
        fecha: ev.fecha,
        titulo: ev.titulo,
        comisionCodigo: ev.comisiones?.codigo ?? null,
      });
    }

    return res.json({ data: map });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Error cargando eventos" });
  }
});


/**
 * POST /api/calendario/docente/eventos
 */
router.post("/docente/eventos", authRequired, async (req, res) => {
  try {
    const { fecha, titulo, comisionId } = req.body;
    const usuarioId = req.user.id;

    if (!fecha || !titulo) {
      return res.status(400).json({ error: "Campos requeridos: fecha, titulo" });
    }

    const docente = await prisma.docentes.findFirst({
      where: { usuario_id: usuarioId },
      select: { id: true },
    });

    if (!docente) {
      return res.status(403).json({ error: "No es docente válido" });
    }

    // Validar si puede agregar evento en esa comisión
    if (comisionId) {
      const comOK = await prisma.comisiones.findFirst({
        where: { id: comisionId, docente_id: docente.id },
      });
      if (!comOK) return res.status(403).json({ error: "No puede agregar evento en esta comisión" });
    }

    const ev = await prisma.eventos.create({
      data: {
        fecha: new Date(fecha),
        titulo,
        comision_id: comisionId || null,
      },
      select: { id: true },
    });

    res.json({ ok: true, id: ev.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error guardando evento" });
  }
});

/**
 * DELETE /api/calendario/docente/eventos/:id
 */
router.delete("/docente/eventos/:id", authRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const usuarioId = req.user.id;

    const docente = await prisma.docentes.findFirst({
      where: { usuario_id: usuarioId },
      select: { id: true },
    });

    if (!docente) {
      return res.status(403).json({ error: "No es docente válido" });
    }

    const evento = await prisma.eventos.findFirst({
      where: {
        id,
        OR: [
          { comision_id: null },
          { comision: { docente_id: docente.id } },
        ],
      },
    });

    if (!evento) return res.status(403).json({ error: "No puede eliminar este evento" });

    await prisma.eventos.delete({ where: { id } });

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error eliminando evento" });
  }
});

export default router;
