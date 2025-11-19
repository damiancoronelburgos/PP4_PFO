import { Router } from "express";
import prisma from "../db/prisma.js";
import { auth, allowRoles } from "../middlewares/auth.js";

const router = Router();

// ===============================================
// MIDDLEWARE DE AUTORIZACIÓN PARA TODAS LAS RUTAS DE GESTIÓN
// ===============================================
router.use(auth, allowRoles("administrador", "preceptor"));

// ===============================================
// FUNCIONES AUXILIARES
// ===============================================

function getValidDocenteId(idValue) {
  if (!idValue) return null;
  const parsedId = parseInt(idValue, 10);
  return !Number.isNaN(parsedId) && parsedId > 0 ? parsedId : null;
}

function toNumberOrNull(v) {
  if (v == null) return null;
  if (typeof v === "bigint") return Number(v);
  return Number(v);
}

function buildAlumnoWhereFromFilters(carrera, comision) {
  const where = {};

  const hasCarrera = carrera && carrera !== "Todas";
  const hasComision = comision && comision !== "Todas";

  if (!hasCarrera && !hasComision) {
    return where;
  }

  const someFilter = {
    estado: "activa",
  };

  let comisionesFilter = null;

  if (hasCarrera) {
    comisionesFilter = {
      ...(comisionesFilter || {}),
      materias: { nombre: carrera },
    };
  }

  if (hasComision) {
    comisionesFilter = {
      ...(comisionesFilter || {}),
      letra: comision,
    };
  }

  if (comisionesFilter) {
    someFilter.comisiones = comisionesFilter;
  }

  where.inscripciones = { some: someFilter };
  return where;
}

async function getNextAlumnoId() {
  const rows = await prisma.$queryRaw`
    SELECT COALESCE(MAX(id), 0) AS maxId
    FROM alumnos;
  `;

  const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : { maxId: 0 };

  const maxId =
    typeof row.maxId === "bigint"
      ? Number(row.maxId)
      : Number(row.maxId || 0);

  return maxId + 1;
}

// ===============================================
// 1. RUTAS DE OFERTA ACADÉMICA (MATERIAS / COMISIONES)
// ===============================================

router.get("/", async (_req, res) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT
        c.id          AS id,
        m.nombre      AS nombre,
        c.docente_id  AS docenteId,
        c.letra       AS comision,
        c.horario     AS horario,
        c.cupo        AS cupo
      FROM materias m
      INNER JOIN comisiones c ON m.id = c.materia_id
    `;

    const out = (rows || []).map((r) => ({
      id: toNumberOrNull(r.id),
      nombre: r.nombre,
      docenteId: r.docenteId != null ? toNumberOrNull(r.docenteId) : null,
      comision: r.comision,
      horario: r.horario,
      cupo: r.cupo != null ? toNumberOrNull(r.cupo) : null,
    }));

    res.json(out);
  } catch (error) {
    console.error("Error al obtener oferta académica:", error);
    res.status(500).json({
      error:
        "Error de servidor al procesar la oferta académica. Revisar logs.",
    });
  }
});

// POST /
router.post("/", async (req, res) => {
  try {
    const {
      nombre,
      docenteId: docenteIdFrontend,
      comision,
      horario,
      cupo,
    } = req.body;

    const validDocenteId = getValidDocenteId(docenteIdFrontend);
    const materiaCodigo = "MAT_" + Date.now().toString().slice(-6);

    const nuevaMateria = await prisma.materias.create({
      data: {
        nombre,
        codigo: materiaCodigo,
      },
    });

    const nuevaComision = await prisma.comisiones.create({
      data: {
        materia_id: nuevaMateria.id,
        docente_id: validDocenteId,
        letra: comision,
        horario,
        cupo: cupo != null ? parseInt(cupo, 10) || null : null,
        codigo: `${materiaCodigo}_COM_${comision}`,
      },
    });

    res.json({
      id: nuevaComision.id,
      nombre: nuevaMateria.nombre,
      docenteId: nuevaComision.docente_id,
      comision: nuevaComision.letra,
      horario: nuevaComision.horario,
      cupo: nuevaComision.cupo,
    });
  } catch (error) {
    console.error("Error al crear la materia y comisión:", error);
    if (error.code === "P2003") {
      return res.status(400).json({
        error:
          "Error de Docente: el ID del docente proporcionado no existe en la base de datos.",
      });
    }
    if (error.code === "P2002") {
      return res.status(400).json({
        error: "Ya existe una materia o comisión con esos datos (código único).",
      });
    }
    res.status(500).json({ error: "Error al crear la materia." });
  }
});

// PUT /:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      docenteId: docenteIdFrontend,
      comision,
      horario,
      cupo,
    } = req.body;

    const validDocenteId = getValidDocenteId(docenteIdFrontend);

    const comisionActual = await prisma.comisiones.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!comisionActual) {
      return res.status(404).json({ error: "Comisión no encontrada." });
    }

    await prisma.materias.update({
      where: { id: comisionActual.materia_id },
      data: { nombre },
    });

    const comisionActualizada = await prisma.comisiones.update({
      where: { id: parseInt(id, 10) },
      data: {
        docente_id: validDocenteId,
        letra: comision,
        horario,
        cupo: cupo != null ? parseInt(cupo, 10) || null : null,
      },
    });

    res.json({
      materia: { nombre },
      comision: comisionActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar la oferta académica:", error);
    if (error.code === "P2003") {
      return res.status(400).json({
        error:
          "Error de Docente: el ID del docente proporcionado no existe en la base de datos.",
      });
    }
    res.status(500).json({ error: "Error al actualizar la materia." });
  }
});

// DELETE /:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.comisiones.delete({
      where: { id: parseInt(id, 10) },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar la comisión:", error);
    if (error.code === "P2003") {
      return res.status(409).json({
        error:
          "La comisión no puede eliminarse porque tiene inscripciones, asistencias u otras tablas asociadas.",
      });
    }
    res.status(500).json({
      error: "Error al eliminar la comisión. Revisar logs.",
    });
  }
});

// =============================================
// 2. RUTAS CRUD PARA ALUMNOS
// =============================================


// GET /alumnos
router.get("/alumnos", async (_req, res) => {
  try {
    const alumnos = await prisma.alumnos.findMany({
      select: {
        id: true,
        dni: true,
        nombre: true,
        apellido: true,
        telefono: true,
        email: true,
        inscripciones: {
          // Asumimos que la primera inscripción es la principal
          orderBy: { fecha_insc: "asc" },
          select: {
            comisiones: {
              select: {
                // AÑADIDO: Obtenemos la letra de la comisión
                letra: true,
                materias: {
                  select: { id: true, nombre: true },
                },
              },
            },
          },
        },
      },
    });

    const alumnosConMateria = alumnos.map((alumno) => {
      const primeraInscripcion = alumno.inscripciones[0];
      // Acceder directamente al objeto comisiones que ya tiene la letra
      const comisionData = primeraInscripcion?.comisiones || null; 
      const materia = comisionData?.materias || null;

      return {
        id: alumno.id,
        dni: alumno.dni,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        telefono: alumno.telefono,
        email: alumno.email,
        materia_id: materia ? materia.id : null,
        nombre_materia: materia ? materia.nombre : "Sin Asignar",
        // CORREGIDO: Incluir la letra de la comisión en la respuesta
        nombre_comision: comisionData ? comisionData.letra : "Sin Asignar", 
      };
    });

    return res.json(alumnosConMateria);
  } catch (error) {
    console.error("Error al obtener alumnos:", error);
    return res
      .status(500)
      .json({ error: "Error interno del servidor" });
  }
});

// POST /alumnos
router.post("/alumnos", async (req, res) => {
  const { dni, nombre, apellido, telefono, email, materia_id } = req.body;

  if (!dni || !nombre || !apellido || !materia_id) {
    return res.status(400).json({
      error: "Faltan datos obligatorios (DNI, Nombre, Apellido y Curso).",
    });
  }

  try {
    const newId = await getNextAlumnoId();

    const materiaIdParsed = parseInt(materia_id, 10);

    const comisionParaInscripcion = await prisma.comisiones.findFirst({
      where: { materia_id: materiaIdParsed },
      orderBy: { id: "asc" },
    });

    if (!comisionParaInscripcion) {
      return res.status(400).json({
        error: "No se encontró una comisión válida para la materia seleccionada.",
      });
    }

    const nuevoAlumno = await prisma.alumnos.create({
      data: {
        id: newId,
        dni,
        nombre,
        apellido,
        telefono: telefono || null,
        email: email || null,
      },
    });

    await prisma.inscripciones.create({
      data: {
        alumno_id: nuevoAlumno.id,
        comision_id: comisionParaInscripcion.id,
        estado: "activa",
        fecha_insc: new Date(),
      },
    });

    return res.status(201).json({
      ...nuevoAlumno,
      materia_id: materiaIdParsed,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Ya existe un alumno con este DNI." });
    }
    console.error("Error al crear alumno:", error);
    return res.status(500).json({ error: "Error interno al crear el alumno." });
  }
});

// PUT /alumnos/:id
router.put("/alumnos/:id", async (req, res) => {
  const alumnoId = parseInt(req.params.id, 10);
  const { dni, nombre, apellido, telefono, email, materia_id } = req.body;

  try {
    let comisionParaInscripcion = null;
    const materiaIdParsed = parseInt(materia_id, 10);

    if (materiaIdParsed) {
      comisionParaInscripcion = await prisma.comisiones.findFirst({
        where: { materia_id: materiaIdParsed },
        orderBy: { id: "asc" },
      });
    }

    const alumnoActualizado = await prisma.alumnos.update({
      where: { id: alumnoId },
      data: {
        dni,
        nombre,
        apellido,
        telefono: telefono || null,
        email: email || null,
      },
    });

    if (comisionParaInscripcion) {
      const inscripcionActual = await prisma.inscripciones.findFirst({
        where: { alumno_id: alumnoId },
        orderBy: { fecha_insc: "asc" },
      });

      if (inscripcionActual) {
        await prisma.inscripciones.update({
          where: { id: inscripcionActual.id },
          data: { comision_id: comisionParaInscripcion.id },
        });
      } else {
        await prisma.inscripciones.create({
          data: {
            alumno_id: alumnoId,
            comision_id: comisionParaInscripcion.id,
            estado: "activa",
            fecha_insc: new Date(),
          },
        });
      }
    }

    return res.json({
      ...alumnoActualizado,
      materia_id: materiaIdParsed || null,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Alumno no encontrado para actualizar.",
      });
    }
    console.error("Error al actualizar alumno:", error);
    return res
      .status(500)
      .json({ error: "Error interno al actualizar el alumno." });
  }
});

// DELETE /alumnos/:id
router.delete("/alumnos/:id", async (req, res) => {
  const alumnoId = parseInt(req.params.id, 10);

  try {
    await prisma.$transaction([
      prisma.justificaciones.deleteMany({ where: { alumno_id: alumnoId } }),
      prisma.calificaciones.deleteMany({ where: { alumno_id: alumnoId } }),
      prisma.asistencias.deleteMany({ where: { alumno_id: alumnoId } }),
      prisma.inscripciones.deleteMany({ where: { alumno_id: alumnoId } }),
      prisma.alumnos.delete({ where: { id: alumnoId } }),
    ]);

    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Alumno no encontrado." });
    }
    console.error("Error al eliminar alumno:", error);
    return res.status(500).json({
      error: "Error interno al eliminar el alumno.",
    });
  }
});

// =============================================
// 3. RUTAS DE COMUNICACIONES / FILTROS
// =============================================

router.get("/materias", async (_req, res) => {
  try {
    const materias = await prisma.materias.findMany({
      select: { id: true, nombre: true },
    });
    return res.json(materias);
  } catch (error) {
    console.error("Error al obtener materias:", error);
    return res.status(500).json({
      error: "Error interno del servidor al cargar materias.",
    });
  }
});

router.get("/comisiones/letras", async (_req, res) => {
  try {
    const letras = await prisma.comisiones.findMany({
      distinct: ["letra"],
      select: { letra: true },
      where: {
        letra: { not: null, not: "" },
      },
      orderBy: { letra: "asc" },
    });

    const comisionesDisponibles = ["Todas", ...letras.map((c) => c.letra)];

    return res.json(comisionesDisponibles);
  } catch (error) {
    console.error("Error al obtener letras de comisiones:", error);
    return res.status(500).json({
      error: "Error interno al cargar comisiones.",
    });
  }
});

router.get("/alumnos/emails", async (req, res) => {
  const { carrera, comision } = req.query;

  try {
    const whereQuery = buildAlumnoWhereFromFilters(carrera, comision);

    const alumnos = await prisma.alumnos.findMany({
      where: whereQuery,
      select: { email: true },
    });

    const destinatarios = alumnos
      .map((a) => a.email)
      .filter((email) => email && email.includes("@"));

    return res.status(200).json(destinatarios);
  } catch (error) {
    console.error("Error al obtener emails filtrados:", error);
    return res.status(500).json({
      error: "Error interno del servidor al filtrar emails.",
    });
  }
});

router.post("/comunicado", async (req, res) => {
  const { carrera, comision, mensaje, titulo } = req.body;

  if (!mensaje || !titulo) {
    return res.status(400).json({
      error: "Falta el título o el contenido del mensaje.",
    });
  }

  try {
    const whereQuery = buildAlumnoWhereFromFilters(carrera, comision);

    const alumnos = await prisma.alumnos.findMany({
      where: whereQuery,
      select: { email: true, nombre: true, apellido: true },
    });

    const destinatarios = alumnos
      .map((a) => a.email)
      .filter((email) => email && email.includes("@"));

    if (destinatarios.length === 0) {
      return res.status(404).json({
        error: "No se encontraron destinatarios con los filtros seleccionados.",
      });
    }

    console.log(
      `[EMAIL SIMULADO] Título: "${titulo}" | Enviando a ${
        destinatarios.length
      } destinatarios: ${destinatarios.join(", ")}`
    );

    return res.status(200).json({
      mensaje: `Comunicado enviado con éxito a ${destinatarios.length} alumnos.`,
      destinatarios: destinatarios.length,
      filtrosUsados: { carrera, comision },
    });
  } catch (error) {
    console.error("Error al enviar comunicado:", error);
    return res.status(500).json({
      error: "Error interno al procesar el comunicado.",
    });
  }
});

export default router;
