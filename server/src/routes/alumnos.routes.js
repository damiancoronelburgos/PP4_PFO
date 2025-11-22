//server/src/routes/alumnos.routes.js
import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";

import prisma from "../db/prisma.js";
import { auth, allowRoles } from "../middlewares/auth.js";
import uploadAvatar from "../middlewares/uploadAvatar.js";
import { updateUserAvatar, changeUserPassword } from "../services/userAccount.service.js";
import { getAlumnoCalendario } from "../controllers/alumnoCalendario.controller.js";

const r = Router();

// ===============================
// Configuración de subida de archivos (justificaciones)
// ===============================
const JUSTIF_DIR = path.resolve("uploads", "justificaciones");

if (!fs.existsSync(JUSTIF_DIR)) {
  fs.mkdirSync(JUSTIF_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, JUSTIF_DIR);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

const upload = multer({ storage });

// ===============================
// Middleware global de auth
// ===============================
r.use(auth);

// ===============================
// GET /api/alumnos/materias
// ===============================
r.get("/materias", allowRoles("alumno"), async (req, res) => {
  try {
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });

    const [comisiones, inscripciones] = await Promise.all([
      prisma.comisiones.findMany({
        include: { materias: true },
        orderBy: [{ materias: { nombre: "asc" } }, { letra: "asc" }],
      }),
      prisma.inscripciones.findMany({
        where: { alumno_id: alumno.id, estado: "activa" },
        select: { comision_id: true },
      }),
    ]);

    const inscriptasSet = new Set(inscripciones.map(i => i.comision_id));

    const resultado = comisiones.map(c => ({
      id: c.id,
      codigo: c.materias?.codigo ?? c.codigo,
      nombre: c.materias?.nombre ?? "Sin materia",
      comision: c.letra ?? c.codigo,
      horario: c.horario ?? "",
      sede: c.sede ?? "",
      aula: c.aula ?? "",
      inscripto: inscriptasSet.has(c.id),
    }));

    return res.json(resultado);
  } catch (err) {
    console.error("GET /api/alumnos/materias error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ===============================
// GET /api/alumnos/me/datos
// ===============================
r.get("/me/datos", allowRoles("alumno"), async (req, res) => {
  try {
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        dni: true,
        telefono: true,
        email: true,
      },
    });

    if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });

    return res.json(alumno);
  } catch (err) {
    console.error("GET /api/alumnos/me/datos error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ===============================
// GET /api/alumnos/me/calificaciones
// ===============================
r.get("/me/calificaciones", allowRoles("alumno"), async (req, res) => {
  try {
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });

    const rows = await prisma.calificaciones.findMany({
      where: { alumno_id: alumno.id },
      include: {
        comisiones: { include: { materias: true } },
        docentes: true,
      },
    });

    return res.json(rows);
  } catch (err) {
    console.error("GET /api/alumnos/me/calificaciones error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ===============================
// GET /api/alumnos/historial
// ===============================
r.get("/historial", allowRoles("alumno"), async (req, res) => {
  try {
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });

    const rows = await prisma.calificaciones.findMany({
      where: { alumno_id: alumno.id },
      include: { comisiones: { include: { materias: true } } },
    });

    const historial = rows
      .map(row => {
        const estadoFinal =
          row.estado ||
          row.condicion ||
          row.resultado ||
          row.estado_final ||
          null;

        const esAprobado =
          estadoFinal &&
          ["aprobado", "Aprobado", "APROBADO"].includes(estadoFinal);

        if (!esAprobado) return null;

        const materiaNombre = row.comisiones?.materias?.nombre ?? "Sin materia";
        const comisionNombre = row.comisiones?.letra ?? row.comisiones?.codigo ?? "-";

        return {
          materia: materiaNombre,
          comision: comisionNombre,
          estado: estadoFinal || "aprobado",
          notaFinal: row.p3 ?? null,
          fecha: row.anio ? row.anio.toString() : "",
        };
      })
      .filter(Boolean);

    return res.json(historial);
  } catch (err) {
    console.error("GET /api/alumnos/historial error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ===============================
// GET /api/alumnos/me/notificaciones
// ===============================
r.get("/me/notificaciones", allowRoles("alumno"), async (req, res) => {
  try {
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });

    const notificaciones = await prisma.notificaciones.findMany({
      where: {
        OR: [
          { destino: "todos" },
          { destino: "alumno" },
          { usuario_id: req.user.sub },
        ],
      },
      orderBy: { fecha: "desc" },
    });

    return res.json(notificaciones);
  } catch (err) {
    console.error("GET /api/alumnos/me/notificaciones error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ===============================
// GET /api/alumnos/me/asistencias
// ===============================
r.get("/me/asistencias", allowRoles("alumno"), async (req, res) => {
  try {
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });

    const rows = await prisma.asistencias.findMany({
      where: { alumno_id: alumno.id },
      include: {
        comisiones: {
          include: { materias: true },
        },
      },
      orderBy: { fecha: "desc" },
    });

    const resultado = rows.map(a => ({
      id: a.id,
      fecha: a.fecha,
      estado: a.estado,
      materia: a.comisiones?.materias?.nombre ?? "-",
      comision: a.comisiones?.letra ?? "-",
      comision_id: a.comision_id,
    }));

    return res.json(resultado);
  } catch (err) {
    console.error("GET /api/alumnos/me/asistencias error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ===============================
// GET /api/alumnos/me/justificaciones
// ===============================
r.get("/me/justificaciones", allowRoles("alumno"), async (req, res) => {
  try {
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });

    const rows = await prisma.justificaciones.findMany({
      where: { alumno_id: alumno.id },
      include: {
        comisiones: {
          select: { letra: true, materias: { select: { nombre: true } } },
        },
      },
      orderBy: { fecha: "desc" },
    });

    const resultado = rows.map(j => ({
      id: j.id,
      fecha: j.fecha,
      motivo: j.motivo,
      estado: j.estado,
      documento_url: j.documento_url,
      comision: j.comisiones?.letra ?? "-",
    }));

    return res.json(resultado);
  } catch (err) {
    console.error("GET /api/alumnos/me/justificaciones error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ===============================
// POST /api/alumnos/me/justificaciones
// ===============================
r.post(
  "/me/justificaciones",
  allowRoles("alumno"),
  upload.single("documento"),
  async (req, res) => {
    try {
      const alumno = await prisma.alumnos.findFirst({
        where: { usuario_id: req.user.sub },
        select: { id: true },
      });

      if (!alumno) {
        return res.status(404).json({ error: "Alumno no encontrado" });
      }

      // Datos enviados por el FRONT
      const { comisionId, motivo, descripcion, fecha } = req.body;

      if (!comisionId || !motivo || !fecha) {
        return res.status(400).json({ error: "Faltan datos obligatorios." });
      }

      // Archivo subido
      const documento_url = req.file
        ? `/uploads/justificaciones/${req.file.filename}`
        : null;

      // FIX FECHA: evitar que cambie por timezone
      const soloFecha = fecha.split("T")[0];   // "2025-09-21"
      const fechaCorrecta = new Date(soloFecha + "T00:00:00");

      const nuevaJustificacion = await prisma.justificaciones.create({
        data: {
          alumno_id: alumno.id,
          comision_id: Number(comisionId),
          fecha: fechaCorrecta,
          motivo: descripcion && motivo === "Otro" ? descripcion : motivo,
          documento_url,
          estado: "pendiente",
        },
      });

      return res.json({
        ok: true,
        justificacion: nuevaJustificacion,
      });

    } catch (err) {
      console.error("POST /api/alumnos/me/justificaciones error:", err);
      return res.status(500).json({ error: "Error al guardar justificación" });
    }
  }
);



// ===============================
// POST /api/alumnos/inscripciones
// ===============================
r.post("/inscripciones", allowRoles("alumno"), async (req, res) => {
  try {
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });

    const { comisionId, materiaId } = req.body;
    const rawId = comisionId ?? materiaId;
    const comisionIdNum = Number(rawId);

    if (!comisionIdNum || Number.isNaN(comisionIdNum)) {
      return res.status(400).json({ error: "ID de comisión/materia inválido." });
    }

    const comision = await prisma.comisiones.findUnique({
      where: { id: comisionIdNum },
      include: { materias: true },
    });

    if (!comision) {
      return res.status(404).json({ error: "Comisión no encontrada" });
    }

    const yaInsc = await prisma.inscripciones.findFirst({
      where: {
        alumno_id: alumno.id,
        comision_id: comisionIdNum,
        estado: "activa",
      },
    });

    if (yaInsc) {
      return res.status(400).json({ error: "Ya estás inscripto en esta comisión." });
    }

    const nueva = await prisma.inscripciones.create({
      data: {
        alumno_id: alumno.id,
        comision_id: comisionIdNum,
        estado: "activa",
      },
    });

    return res.status(201).json({
      ok: true,
      id: nueva.id,
      comisionId: comisionIdNum,
    });
  } catch (err) {
    console.error("POST /api/alumnos/inscripciones error:", err);
    return res.status(500).json({ error: "Error al realizar la inscripción" });
  }
});

// ===============================
// GET /api/alumnos (admin / preceptor)
// ===============================
r.get("/", allowRoles("administrador", "preceptor"), async (_req, res) => {
  try {
    const alumnos = await prisma.alumnos.findMany({
      select: { id: true, nombre: true, apellido: true, dni: true },
    });

    return res.json(alumnos);
  } catch (error) {
    console.error("Error al listar alumnos para gestión:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ===============================
// POST AVATAR
// ===============================
r.post(
  "/me/avatar",
  allowRoles("alumno"),
  uploadAvatar.single("avatar"),
  updateUserAvatar
);

// ===============================
// POST PASSWORD
// ===============================
r.post("/me/password", allowRoles("alumno"), changeUserPassword);

// ===============================
// GET DOCENTES
// ===============================
r.get("/docentes", async (req, res) => {
  try {
    const docentes = await prisma.docentes.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        telefono: true,
        email: true,
        comisiones: { select: { materias: { select: { nombre: true } } } },
      },
    });

    const lista = docentes.map(d => ({
      id: d.id,
      nombre: d.nombre,
      apellido: d.apellido,
      email: d.email,
      telefono: d.telefono,
      materias: d.comisiones.map(c => c.materias?.nombre).filter(Boolean),
    }));

    return res.json(lista);
  } catch (err) {
    console.error("GET /api/alumnos/docentes error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ===============================
// CALENDARIO
// ===============================
r.get("/calendario", getAlumnoCalendario);

// ===============================
// INSTITUTO
// ===============================
r.get("/instituto", async (req, res) => {
  try {
    const data = await prisma.instituto.findFirst();

    if (!data) {
      return res.status(404).json({ error: "No se encontró información del instituto" });
    }

    res.json(data);
  } catch (err) {
    console.error("Error cargando datos del instituto:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ===============================
// OFERTA
// ===============================
r.get("/oferta", allowRoles("alumno"), async (req, res) => {
  try {
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });

    const [comisiones, inscripciones] = await Promise.all([
      prisma.comisiones.findMany({
        include: { materias: true },
        orderBy: [{ materias: { nombre: "asc" } }, { letra: "asc" }],
      }),
      prisma.inscripciones.findMany({
        where: { alumno_id: alumno.id, estado: "activa" },
        select: { comision_id: true },
      }),
    ]);

    const inscriptasSet = new Set(inscripciones.map(i => i.comision_id));

    const resultado = comisiones.map(c => ({
      id: c.id,
      nombre: c.materias?.nombre ?? "Sin materia",
      materiaNombre: c.materias?.nombre ?? "Sin materia",
      comision: c.letra ?? c.codigo,
      horario: c.horario ?? "",
      cupo: c.cupo != null ? Number(c.cupo) : null,
      inscripto: inscriptasSet.has(c.id),
    }));

    return res.json(resultado);
  } catch (err) {
    console.error("GET /api/alumnos/oferta error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ===============================
// GET /inscripciones
// ===============================
r.get("/inscripciones", allowRoles("alumno"), async (req, res) => {
  try {
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });

    const inscripciones = await prisma.inscripciones.findMany({
      where: { alumno_id: alumno.id, estado: "activa" },
      orderBy: { id: "asc" },
    });

    const out = inscripciones.map(i => ({
      id: i.id,
      comisionId: typeof i.comision_id === "bigint" ? Number(i.comision_id) : i.comision_id,
    }));

    return res.json(out);
  } catch (err) {
    console.error("GET /api/alumnos/inscripciones error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ===============================
// DELETE /inscripciones/:id
// ===============================
r.delete("/inscripciones/:comisionId", allowRoles("alumno"), async (req, res) => {
  try {
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });

    const comisionIdNum = Number(req.params.comisionId);

    if (!comisionIdNum || Number.isNaN(comisionIdNum)) {
      return res.status(400).json({ error: "ID de comisión inválido." });
    }

    await prisma.inscripciones.deleteMany({
      where: {
        alumno_id: alumno.id,
        comision_id: comisionIdNum,
      },
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/alumnos/inscripciones/:comisionId error:", err);
    return res.status(500).json({ error: "Error al eliminar la inscripción" });
  }
});

export default r;
