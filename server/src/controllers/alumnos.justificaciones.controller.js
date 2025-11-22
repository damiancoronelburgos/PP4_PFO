//server/src/controllers/alumnos.justificaciones.controller.js
import {
  listarAsistenciasAlumno,
  listarJustificacionesAlumno,
  crearJustificacion
} from "../services/alumnos.justificaciones.service.js";

export async function getAsistencias(req, res, next) {
  try {
    const alumnoId = req.user.sub;
    const data = await listarAsistenciasAlumno(alumnoId);
    return res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getJustificaciones(req, res, next) {
  try {
    const alumnoId = req.user.sub;
    const data = await listarJustificacionesAlumno(alumnoId);
    return res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function enviarJustificacion(req, res, next) {
  try {
    const alumnoId = req.user.sub;
    const { motivo, descripcion, comisionId } = req.body;

    if (!motivo || !comisionId) {
      return res.status(400).json({ error: "Faltan datos obligatorios." });
    }

    const documentoUrl = req.file
      ? `/uploads/justificaciones/${req.file.filename}`
      : null;

    const nueva = await crearJustificacion(alumnoId, {
      motivo,
      descripcion,
      comisionId,
      documentoUrl
    });

    return res.json({ ok: true, justificacion: nueva });
  } catch (err) {
    next(err);
  }
}
