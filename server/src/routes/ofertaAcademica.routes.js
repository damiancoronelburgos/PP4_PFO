// ofertaAcademica.routes.js
import { Router } from "express";
import prisma from "../db/prisma.js"; 
import { auth, allowRoles } from "../middlewares/auth.js";

const router = Router();

// ===============================================
// MIDDLEWARE DE AUTORIZACIÓN
// ===============================================
router.use(auth, allowRoles("administrador", "preceptor"));

// ===============================================
// FUNCIONES AUXILIARES
// ===============================================

function toNumberOrNull(v) {
  if (v == null) return null;
  if (typeof v === "bigint") return Number(v);
  return Number(v);
}

function getValidDocenteId(idValue) {
  if (!idValue) return null;
  const parsedId = parseInt(idValue, 10);
  return !Number.isNaN(parsedId) && parsedId > 0 ? parsedId : null;
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


// Función para obtener el siguiente ID de alumno, ya que no es AUTO_INCREMENT en el schema
async function getNextAlumnoId() {
  const result = await prisma.alumnos.findMany({
    select: { id: true },
    orderBy: { id: "desc" },
    take: 1,
  });
  return (result[0]?.id || 0) + 1;
}
// ===============================================
// 1. RUTAS DE OFERTA ACADÉMICA
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
      error: "Error de servidor al procesar la oferta académica.",
    });
  }
});

// POST Oferta (Materia/Comision)
router.post("/", async (req, res) => {
  try {
    const { nombre, docenteId, comision, horario, cupo } = req.body;
    const validDocenteId = getValidDocenteId(docenteId);
    const materiaCodigo = "MAT_" + Date.now().toString().slice(-6);

    // Transacción implícita no soportada directamenente aquí de esta forma,
    // mejor crear por separado o usar prisma.$transaction si fuera crítico.
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
    console.error("Error al crear materia:", error);
    if (error.code === "P2003") return res.status(400).json({ error: "Docente no existe." });
    if (error.code === "P2002") return res.status(400).json({ error: "Datos duplicados." });
    res.status(500).json({ error: "Error al crear la materia." });
  }
});

// PUT /:id (Oferta)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, docenteId, comision, horario, cupo } = req.body;
    const validDocenteId = getValidDocenteId(docenteId);

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

    res.json({ materia: { nombre }, comision: comisionActualizada });
  } catch (error) {
    console.error("Error oferta académica:", error);
    res.status(500).json({ error: "Error al actualizar." });
  }
});

// DELETE /:id (Oferta)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.comisiones.delete({ where: { id: parseInt(id, 10) } });
    res.status(204).send();
  } catch (error) {
    console.error("Error delete oferta:", error);
    res.status(500).json({ error: "Error al eliminar comisión." });
  }
});


// =============================================
// 2. RUTAS CRUD PARA ALUMNOS (CORREGIDAS)
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
          orderBy: { fecha_insc: "asc" },
          select: {
            comisiones: {
              select: {
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
        nombre_comision: comisionData ? comisionData.letra : "Sin Asignar",
      };
    });

    return res.json(alumnosConMateria);
  } catch (error) {
    console.error("Error al obtener alumnos:", error);
    return res.status(500).json({ error: "Error interno." });
  }
});

// POST /alumnos (Solo crea el alumno, SIN inscripción inicial)
router.post("/alumnos", async (req, res) => {
  // Ahora solo recibimos los datos personales, ya que la inscripción es opcional
  const { dni, nombre, apellido, email, telefono } = req.body;

  // Validamos solo los datos personales
  if (!dni || !nombre || !apellido) {
    return res.status(400).json({
      error: "Faltan datos obligatorios (DNI, Nombre, Apellido).",
    });
  }

  try {
    // CLAVE: Usamos la función para generar el ID manualmente
    const newId = await getNextAlumnoId(); 

    // Solo creamos el alumno (sin la inscripción anidada)
    const nuevoAlumno = await prisma.alumnos.create({
      data: {
        id: newId, // Se asigna el ID
        dni,
        nombre,
        apellido,
        email: email || null,
        telefono: telefono || null,
      },
    });

    // Respuesta al cliente
    res.status(201).json({
      ...nuevoAlumno,
      // Devolvemos null para que el frontend sepa que no hay curso asignado
      nombre_materia: "Sin Asignar", 
      nombre_comision: "Sin Asignar",
    });
  } catch (error) {
    console.error("Error al crear alumno:", error);
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Ya existe un alumno con este DNI." });
    }
    // Si tienes otros campos únicos, el error P2002 podría reportarse aquí
    res.status(500).json({ error: "Error de servidor al crear el alumno." });
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

    // Actualizar solo datos básicos del alumno
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

    // Actualizar inscripción si cambió la materia
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
      return res.status(404).json({ error: "Alumno no encontrado." });
    }
    if (error.code === "P2002") {
        return res.status(409).json({ error: "DNI ya existente." });
    }
    console.error("Error update alumno:", error);
    return res.status(500).json({ error: "Error al actualizar." });
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
    console.error("Error delete alumno:", error);
    return res.status(500).json({ error: "Error al eliminar." });
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
    console.error("Error materias:", error);
    return res.status(500).json({ error: "Error al cargar materias." });
  }
});

router.get("/comisiones/letras", async (_req, res) => {
  try {
    const letras = await prisma.comisiones.findMany({
      distinct: ["letra"],
      select: { letra: true },
      where: { letra: { not: null, not: "" } },
      orderBy: { letra: "asc" },
    });
    const comisionesDisponibles = ["Todas", ...letras.map((c) => c.letra)];
    return res.json(comisionesDisponibles);
  } catch (error) {
    console.error("Error letras:", error);
    return res.status(500).json({ error: "Error al cargar comisiones." });
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
    console.error("Error emails:", error);
    return res.status(500).json({ error: "Error al filtrar emails." });
  }
});

router.post("/comunicado", async (req, res) => {
  const { carrera, comision, mensaje, titulo } = req.body;
  if (!mensaje || !titulo) return res.status(400).json({ error: "Faltan datos." });

  try {
    const whereQuery = buildAlumnoWhereFromFilters(carrera, comision);
    const alumnos = await prisma.alumnos.findMany({
      where: whereQuery,
      select: { email: true, nombre: true, apellido: true },
    });
    const destinatarios = alumnos
      .map((a) => a.email)
      .filter((email) => email && email.includes("@"));

    if (destinatarios.length === 0) return res.status(404).json({ error: "No destinatarios." });

    console.log(`[EMAIL SIMULADO] Enviando a ${destinatarios.length}`);
    return res.status(200).json({
      mensaje: `Enviado a ${destinatarios.length} alumnos.`,
      destinatarios: destinatarios.length,
    });
  } catch (error) {
    console.error("Error comunicado:", error);
    return res.status(500).json({ error: "Error al enviar." });
  }
});

// ===============================================
// GET /historial/:alumnoId
// ===============================================
router.get("/historial/:alumnoId", async (req, res) => {
  try {
    const alumnoId = Number(req.params.alumnoId);
    if (!alumnoId || Number.isNaN(alumnoId)) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const historial = await prisma.$queryRaw`
      SELECT
        M.nombre      AS materia,
        C.letra       AS comision,
        CA.p1         AS p1,
        CA.p2         AS p2,
        CA.p3         AS p3,
        COALESCE(CA.estado, 'Inscripto') AS estado_materia,
        I.fecha_insc  AS fecha_inscripcion,
        CA.anio       AS anio_cursada
      FROM inscripciones I
      INNER JOIN comisiones C ON I.comision_id = C.id
      INNER JOIN materias   M ON C.materia_id = M.id
      LEFT JOIN calificaciones CA
        ON  I.alumno_id  = CA.alumno_id
        AND I.comision_id = CA.comision_id
      WHERE I.alumno_id = ${alumnoId}
      ORDER BY CA.anio, M.nombre;
    `;

    const dataForTable = (historial || []).map((item) => {
      const p1 = item.p1 ?? "-";
      const p2 = item.p2 ?? "-";
      const p3 = item.p3 ?? "-";
      const notasNumericas = [p1, p2, p3]
        .filter((n) => n !== "-" && n != null)
        .map((n) => Number(n))
        .filter((n) => !Number.isNaN(n));

      const notaFinal =
        notasNumericas.length > 0
          ? (notasNumericas.reduce((sum, n) => sum + n, 0) / notasNumericas.length).toFixed(1)
          : "-";

      const estadoMateria = item.estado_materia || "Inscripto";
      let estadoAprobacion;
      if (estadoMateria === "Aprobado" || estadoMateria === "Promocionado") estadoAprobacion = "Aprobado";
      else if (estadoMateria === "Inscripto") estadoAprobacion = "En Curso";
      else estadoAprobacion = "Regular/Final";

      const fechaInsc = item.fecha_inscripcion
        ? new Date(item.fecha_inscripcion).toLocaleDateString("es-AR")
        : "-";

      return [
        item.materia,
        item.comision,
        notaFinal,
        fechaInsc,
        estadoAprobacion,
      ];
    });

    res.json(dataForTable);
  } catch (error) {
    console.error("Error historial:", error);
    res.status(500).json({ error: "Error al obtener historial." });
  }
});

export default router;