import { Router } from "express";
import { auth, allowRoles } from "../middlewares/auth.js";
import prisma from "../db/prisma.js";

const r = Router();

// Autenticación y autorización
r.use(auth, allowRoles("administrador", "preceptor"));

// ---------------------------------------------
// Helpers
// ---------------------------------------------

// Construye el filtro de alumnos según carrera (materia) y comisión
function buildAlumnoWhereFromFilters(carrera, comision) {
  const where = {};

  const hasCarrera = carrera && carrera !== "Todas";
  const hasComision = comision && comision !== "Todas";

  // Si no hay filtros, devolvemos un where vacío (trae todos los alumnos)
  if (!hasCarrera && !hasComision) {
    return where;
  }

  const someFilter = {
    estado: "activa", // usa tu enum inscripciones_estado
  };

  let comisionesFilter = null;

  if (hasCarrera) {
    comisionesFilter = {
      ...(comisionesFilter || {}),
      materias: { nombre: carrera }, // alumnos -> inscripciones -> comisiones -> materias.nombre
    };
  }

  if (hasComision) {
    comisionesFilter = {
      ...(comisionesFilter || {}),
      letra: comision, // letra de la comisión
    };
  }

  if (comisionesFilter) {
    someFilter.comisiones = comisionesFilter;
  }

  where.inscripciones = { some: someFilter };
  return where;
}

// Genera un nuevo id para alumnos porque en tu schema no hay autoincrement()
async function getNextAlumnoId() {
  const rows = await prisma.$queryRaw`
    SELECT COALESCE(MAX(id), 0) AS maxId
    FROM alumnos;
  `;

  const row =
    Array.isArray(rows) && rows.length > 0 ? rows[0] : { maxId: 0 };

  const maxId =
    typeof row.maxId === "bigint"
      ? Number(row.maxId)
      : Number(row.maxId || 0);

  return maxId + 1;
}

// =============================================
// Rutas CRUD para Alumnos
// =============================================

// GET /api/gestion/alumnos  (lista con "nombre_materia" derivado)
r.get("/alumnos", async (_req, res) => {
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
          where: { estado: "activa" },
          orderBy: { fecha_insc: "asc" },
          select: {
            comisiones: {
              select: {
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
      const materia =
        primeraInscripcion?.comisiones?.materias || null;

      return {
        id: alumno.id,
        dni: alumno.dni,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        telefono: alumno.telefono,
        email: alumno.email,
        // Campos que el frontend espera
        materia_id: materia ? materia.id : null,
        nombre_materia: materia ? materia.nombre : "Sin Asignar",
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

// POST /api/gestion/alumnos (crear nuevo alumno)
r.post("/alumnos", async (req, res) => {
  const { dni, nombre, apellido, telefono, email } = req.body;

  if (!dni || !nombre || !apellido) {
    return res
      .status(400)
      .json({ error: "Faltan datos obligatorios." });
  }

  try {
    const newId = await getNextAlumnoId();

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

    return res.status(201).json({
      ...nuevoAlumno,
      materia_id: null,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ error: "Ya existe un alumno con este DNI." });
    }
    console.error("Error al crear alumno:", error);
    return res
      .status(500)
      .json({ error: "Error interno al crear el alumno." });
  }
});

// PUT /api/gestion/alumnos/:id (actualizar alumno)
r.put("/alumnos/:id", async (req, res) => {
  const alumnoId = parseInt(req.params.id, 10);
  const { dni, nombre, apellido, telefono, email } = req.body;

  try {
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

    return res.json({
      ...alumnoActualizado,
      materia_id: null,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Alumno no encontrado para actualizar.",
      });
    }
    console.error("Error al actualizar alumno:", error);
    return res.status(500).json({
      error: "Error interno al actualizar el alumno.",
    });
  }
});

// DELETE /api/gestion/alumnos/:id (eliminar alumno)
r.delete("/alumnos/:id", async (req, res) => {
  const alumnoId = parseInt(req.params.id, 10);

  try {
    await prisma.alumnos.delete({
      where: { id: alumnoId },
    });
    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Alumno no encontrado para eliminar.",
      });
    }
    console.error("Error al eliminar alumno:", error);
    return res.status(500).json({
      error: "Error interno al eliminar el alumno.",
    });
  }
});

// =============================================
// Rutas de comunicaciones / filtros
// =============================================

// GET /api/gestion/materias (lista de materias para filtros)
r.get("/materias", async (_req, res) => {
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

// GET /api/gestion/comisiones/letras (lista de letras de comisión)
r.get("/comisiones/letras", async (_req, res) => {
  try {
    const letras = await prisma.comisiones.findMany({
      distinct: ["letra"],
      select: { letra: true },
      where: {
        letra: { not: null, not: "" },
      },
      orderBy: { letra: "asc" },
    });

    const comisionesDisponibles = [
      "Todas",
      ...letras.map((c) => c.letra),
    ];
    return res.json(comisionesDisponibles);
  } catch (error) {
    console.error("Error al obtener letras de comisiones:", error);
    return res.status(500).json({
      error: "Error interno al cargar comisiones.",
    });
  }
});

// GET /api/gestion/alumnos/emails (emails filtrados por carrera/comisión)
r.get("/alumnos/emails", async (req, res) => {
  const { carrera, comision } = req.query;

  try {
    const whereQuery = buildAlumnoWhereFromFilters(
      carrera,
      comision
    );

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
      error:
        "Error interno del servidor al filtrar emails.",
    });
  }
});

// POST /api/gestion/comunicado (simulación de envío de comunicado)
r.post("/comunicado", async (req, res) => {
  const { carrera, comision, mensaje, titulo } = req.body;

  if (!mensaje || !titulo) {
    return res.status(400).json({
      error: "Falta el título o el contenido del mensaje.",
    });
  }

  try {
    const whereQuery = buildAlumnoWhereFromFilters(
      carrera,
      comision
    );

    const alumnos = await prisma.alumnos.findMany({
      where: whereQuery,
      select: {
        email: true,
        nombre: true,
        apellido: true,
      },
    });

    const destinatarios = alumnos
      .map((a) => a.email)
      .filter((email) => email && email.includes("@"));

    if (destinatarios.length === 0) {
      return res.status(404).json({
        error:
          "No se encontraron destinatarios con los filtros seleccionados.",
      });
    }

    console.log(
      `[EMAIL SIMULADO] Título: "${titulo}" | Enviando a ${destinatarios.length} destinatarios: ${destinatarios.join(
        ", "
      )}`
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

export default r;