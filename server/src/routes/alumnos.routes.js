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
// Devuelve comisiones “planchadas” con su materia
// y marca si el alumno ya está inscripto (estado activa)
// ===============================
r.get("/materias", allowRoles("alumno"), async (req, res) => {
  try {
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    const [comisiones, inscripciones] = await Promise.all([
      prisma.comisiones.findMany({
        include: { materias: true },
        orderBy: [
          { materias: { nombre: "asc" } },
          { letra: "asc" },
        ],
      }),
      prisma.inscripciones.findMany({
        where: { alumno_id: alumno.id, estado: "activa" },
        select: { comision_id: true },
      }),
    ]);

    const inscriptasSet = new Set(inscripciones.map((i) => i.comision_id));

    const resultado = comisiones.map((c) => ({
      id: c.id, // este ID lo usa el front como materiaId para inscribirse
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

    if (!alumno) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    return res.json(alumno);
  } catch (err) {
    console.error("GET /api/alumnos/me/datos error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ===============================
// GET /api/alumnos/me/calificaciones
// (no lo usa Inscripción, pero lo dejo tal cual)
// ===============================
r.get("/me/calificaciones", allowRoles("alumno"), async (req, res) => {
  try {
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    const rows = await prisma.calificaciones.findMany({
      where: { alumno_id: alumno.id },
      include: {
        comisiones: {
          include: { materias: true },
        },
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
// Devuelve materias aprobadas del alumno (historial académico)
// ===============================
r.get("/historial", allowRoles("alumno"), async (req, res) => {
  try {
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    const rows = await prisma.calificaciones.findMany({
      where: { alumno_id: alumno.id },
      include: {
        comisiones: {
          include: { materias: true },
        },
      },
    });

    const historial = rows
      .map((row) => {
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
        const comisionNombre =
          row.comisiones?.letra ??
          row.comisiones?.codigo ??
          "-";

        const notaFinal =
          row.nota_final ??
          row.notaFinal ??
          row.nota ??
          null;

        const fechaRaw =
          row.fecha ||
          row.fecha_cierre ||
          row.created_at ||
          row.updated_at ||
          null;

        const fecha =
          fechaRaw instanceof Date
            ? fechaRaw.toISOString().slice(0, 10)
            : fechaRaw || "";

        return {
          materia: materiaNombre,
          comision: comisionNombre,
          estado: estadoFinal || "aprobado",
          notaFinal,
          fecha,
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
r.get(
  "/me/notificaciones",
  allowRoles("alumno"),
  async (req, res) => {
    try {
      const alumno = await prisma.alumnos.findFirst({
        where: { usuario_id: req.user.sub },
        select: { id: true },
      });

      if (!alumno) {
        return res.status(404).json({ error: "Alumno no encontrado" });
      }

      // Obtener notificaciones: destino = todos, alumno, o personales del usuario
      const notificaciones = await prisma.notificaciones.findMany({
        where: {
          OR: [
            { destino: "todos" },
            { destino: "alumno" },
            { usuario_id: req.user.sub }
          ]
        },
        orderBy: { fecha: "desc" }
      });

      return res.json(notificaciones);
    } catch (err) {
      console.error("GET /api/alumnos/me/notificaciones error:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }
);

// ===============================
// GET /api/alumnos/me/asistencias
// ===============================
r.get("/me/asistencias", allowRoles("alumno"), async (req, res) => {
  try {
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    const rows = await prisma.asistencias.findMany({
      where: { alumno_id: alumno.id },
      include: {
        comisiones: {
          include: { materias: true },
        },
      },
      orderBy: { fecha: "desc" },
    });

    const resultado = rows.map((a) => ({
      id: a.id,
      fecha: a.fecha,
      estado: a.estado,
      materia: a.comisiones?.materias?.nombre ?? "-",
      comision: a.comisiones?.letra ?? "-",
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

    if (!alumno) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    const justificaciones = await prisma.justificaciones.findMany({
      where: { alumno_id: alumno.id },
      include: {
        comisiones: {
          include: { materias: true },
        },
      },
      orderBy: { fecha: "desc" },
    });

    return res.json(justificaciones);
  } catch (err) {
    console.error("GET /api/alumnos/me/justificaciones error:", err);
    return res.status(500).json({ error: "Error al obtener justificaciones" });
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

      const { fecha, comision_id, motivo, motivoOtro } = req.body;

      const documento_url = req.file
        ? `/uploads/justificaciones/${req.file.filename}`
        : null;

      const nuevaJustificacion = await prisma.justificaciones.create({
        data: {
          alumno_id: alumno.id,
          comision_id: Number(comision_id),
          fecha: new Date(fecha),
          motivo: motivoOtro || motivo,
          documento_url,
          estado: "pendiente",
        },
      });

      return res.json(nuevaJustificacion);
    } catch (err) {
      console.error("POST /api/alumnos/me/justificaciones error:", err);
      return res.status(500).json({ error: "Error al guardar justificación" });
    }
  }
);

// ===============================
// POST /api/alumnos/inscripciones
// Crea una inscripción del alumno en una comisión
// ===============================
r.post("/inscripciones", allowRoles("alumno"), async (req, res) => {
  try {
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    const { comisionId, materiaId } = req.body;
    const rawId = comisionId ?? materiaId; // compatibilidad si algún día viene materiaId
    const comisionIdNum = Number(rawId);

    if (!comisionIdNum || Number.isNaN(comisionIdNum)) {
      return res
        .status(400)
        .json({ error: "ID de comisión/materia inválido." });
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
      return res
        .status(400)
        .json({ error: "Ya estás inscripto en esta comisión." });
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
    return res
      .status(500)
      .json({ error: "Error al realizar la inscripción" });
  }
});

// ===============================
// GET /api/alumnos
// Usado por Admin / Preceptor (Constancias, gestión, etc.)
// ===============================
r.get("/", allowRoles("administrador", "preceptor"), async (_req, res) => {
  try {
    const alumnos = await prisma.alumnos.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        dni: true,
      },
    });

    return res.json(alumnos);
  } catch (error) {
    console.error("Error al listar alumnos para gestión:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// POST /api/alumnos/me/avatar
r.post(
  "/me/avatar",
  allowRoles("alumno"),
  uploadAvatar.single("avatar"),
  updateUserAvatar
);

// POST /api/alumnos/me/password
r.post(
  "/me/password",
  allowRoles("alumno"),
  changeUserPassword
);

// ====================================================================
// GET /api/alumnos/docentes
// Lista de docentes visibles para los alumnos
// ====================================================================
r.get("/docentes", async (req, res) => {
  try {
    const docentes = await prisma.docentes.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        telefono: true,
        email: true,
        comisiones: {
          select: {
            materias: {
              select: { nombre: true }
            }
          }
        }
      }
    });

    const lista = docentes.map((d) => ({
      id: d.id,
      nombre: d.nombre,
      apellido: d.apellido,
      email: d.email,
      telefono: d.telefono,
      materias: d.comisiones
        .map((c) => c.materias?.nombre)
        .filter(Boolean),
    }));

    return res.json(lista);
  } catch (err) {
    console.error("GET /api/alumnos/docentes error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});
// ====================================================================
// GET /api/alumnos/calendario (USANDO CONTROLLER)
// ====================================================================


r.get("/calendario", getAlumnoCalendario);

// GET /api/alumnos/instituto - Datos del instituto
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
// GET /api/alumnos/oferta
// Lista de comisiones disponibles para inscripción del alumno
// (misma lógica base que /materias, pero con nombres pensados para el front nuevo)
// ===============================
r.get("/oferta", allowRoles("alumno"), async (req, res) => {
  try {
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    const [comisiones, inscripciones] = await Promise.all([
      prisma.comisiones.findMany({
        include: { materias: true },
        orderBy: [
          { materias: { nombre: "asc" } },
          { letra: "asc" },
        ],
      }),
      prisma.inscripciones.findMany({
        where: { alumno_id: alumno.id, estado: "activa" },
        select: { comision_id: true },
      }),
    ]);

    const inscriptasSet = new Set(inscripciones.map((i) => i.comision_id));

    const resultado = comisiones.map((c) => {
      const nombreMateria = c.materias?.nombre ?? "Sin materia";

      return {
        id: c.id,                        // ID de la comisión
        nombre: nombreMateria,          // por compatibilidad
        materiaNombre: nombreMateria,   // lo que usa el front nuevo
        comision: c.letra ?? c.codigo,
        horario: c.horario ?? "",
        cupo: c.cupo != null ? Number(c.cupo) : null,
        inscripto: inscriptasSet.has(c.id),
      };
    });

    return res.json(resultado);
  } catch (err) {
    console.error("GET /api/alumnos/oferta error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ===============================
// GET /api/alumnos/inscripciones
// Devuelve las inscripciones activas del alumno logueado
// ===============================
r.get("/inscripciones", allowRoles("alumno"), async (req, res) => {
  try {
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    const inscripciones = await prisma.inscripciones.findMany({
      where: { alumno_id: alumno.id, estado: "activa" },
      select: {
        id: true,
        comision_id: true,
      },
      orderBy: { id: "asc" },
    });

    const out = inscripciones.map((i) => ({
      id: i.id,
      comisionId:
        typeof i.comision_id === "bigint"
          ? Number(i.comision_id)
          : i.comision_id,
    }));

    return res.json(out);
  } catch (err) {
    console.error("GET /api/alumnos/inscripciones error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ===============================
// DELETE /api/alumnos/inscripciones/:comisionId
// Elimina (o da de baja) la inscripción del alumno en esa comisión
// ===============================
r.delete("/inscripciones/:comisionId", allowRoles("alumno"), async (req, res) => {
  try {
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    const comisionIdNum = Number(req.params.comisionId);

    if (!comisionIdNum || Number.isNaN(comisionIdNum)) {
      return res.status(400).json({ error: "ID de comisión inválido." });
    }

    // Si querés soft-delete, acá podrías hacer updateMany({ data: { estado: "baja" } })
    await prisma.inscripciones.deleteMany({
      where: {
        alumno_id: alumno.id,
        comision_id: comisionIdNum,
      },
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/alumnos/inscripciones/:comisionId error:", err);
    return res.status(500).json({
      error: "Error al eliminar la inscripción",
    });
  }
});

export default r;