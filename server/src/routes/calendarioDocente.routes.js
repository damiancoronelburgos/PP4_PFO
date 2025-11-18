import { Router } from "express";
import db from "../db/prisma.js"; // o tu helper mysql2
import { authRequired } from "../middlewares/auth.js";

const router = Router();

/**
 * GET /api/calendario/docente/eventos
 * Query: year, month
 */
router.get("/docente/eventos", authRequired, async (req, res) => {
  try {
    const { year, month } = req.query;
    const usuarioId = req.user.id;

    if (!year || !month) {
      return res.status(400).json({ error: "Parámetros year y month requeridos" });
    }

    // Obtener id del docente asociado
    const [docRow] = await db.execute(
      "SELECT id FROM docentes WHERE usuario_id = ? LIMIT 1",
      [usuarioId]
    );

    if (!docRow || !docRow[0]) {
      return res.status(403).json({ error: "No es docente válido" });
    }

    const docenteId = docRow[0].id;

    const [rows] = await db.execute(
      `SELECT e.id, e.fecha, e.titulo, e.comision_id,
              c.codigo AS comisionCodigo
       FROM eventos e
       LEFT JOIN comisiones c ON c.id = e.comision_id
       WHERE YEAR(e.fecha)=? AND MONTH(e.fecha)=?
         AND (
              e.comision_id IS NULL
              OR c.docente_id = ?
         )
       ORDER BY e.fecha ASC`,
      [year, month, docenteId]
    );

    // Agrupar por día
    const map = {};
    rows.forEach(ev => {
      const day = Number(ev.fecha.getDate());
      if (!map[day]) map[day] = [];
      map[day].push(ev);
    });

    res.json({ data: map });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error cargando eventos" });
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

    const isInstitutional = !comisionId;

    // Validar que el docente pueda agregar en esa comisión
    if (!isInstitutional) {
      const [valid] = await db.execute(
        `SELECT 1 FROM comisiones c
         JOIN docentes d ON d.id = c.docente_id
         WHERE c.id=? AND d.usuario_id=?`,
        [comisionId, usuarioId]
      );
      if (!valid.length) {
        return res.status(403).json({ error: "No puede agregar evento en esta comisión" });
      }
    }

    const [result] = await db.execute(
      "INSERT INTO eventos (fecha, titulo, comision_id) VALUES (?,?,?)",
      [fecha, titulo, comisionId || null]
    );

    res.json({ ok: true, id: result.insertId });
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
    const { id } = req.params;
    const usuarioId = req.user.id;

    // Validar que pueda eliminarlo
    const [rows] = await db.execute(
      `SELECT e.id, e.comision_id
       FROM eventos e
       LEFT JOIN comisiones c ON c.id = e.comision_id
       WHERE e.id=? AND (
          e.comision_id IS NULL
          OR c.docente_id = (
              SELECT id FROM docentes WHERE usuario_id=? LIMIT 1
          )
       )`,
      [id, usuarioId]
    );

    if (!rows.length) {
      return res.status(403).json({ error: "No puede eliminar este evento" });
    }

    await db.execute("DELETE FROM eventos WHERE id=?", [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error eliminando evento" });
  }
});

export default router;
