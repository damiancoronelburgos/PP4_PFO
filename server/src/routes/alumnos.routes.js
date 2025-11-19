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
// POST /api/alumnos/inscribir
// Crea una fila en inscripciones (alumno_id + comision_id)
// El front manda { materiaId } pero lo usamos como ID de comisión
// ===============================
r.post("/inscribir", allowRoles("alumno"), async (req, res) => {
  try {
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    const { materiaId } = req.body;
    const comisionId = Number(materiaId);

    if (!comisionId || Number.isNaN(comisionId)) {
      return res
        .status(400)
        .json({ error: "ID de comisión/materia inválido." });
    }

    const comision = await prisma.comisiones.findUnique({
      where: { id: comisionId },
      include: { materias: true },
    });

    if (!comision) {
      return res.status(404).json({ error: "Comisión no encontrada" });
    }

    const yaInsc = await prisma.inscripciones.findFirst({
      where: {
        alumno_id: alumno.id,
        comision_id: comisionId,
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
        comision_id: comisionId,
      },
    });

    return res.status(201).json(nueva);
  } catch (err) {
    console.error("POST /api/alumnos/inscribir error:", err);
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

export default r;