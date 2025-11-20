import { Router } from "express";
import { auth, allowRoles } from "../middlewares/auth.js";
import prisma from "../db/prisma.js";

const r = Router();

// Solo usuarios con rol docente
r.use(auth, allowRoles("docente"));

// GET /api/docentes/me/datos
r.get("/me/datos", async (req, res) => {
  try {
    const docente = await prisma.docentes.findFirst({
      where: { usuario_id: req.user.sub },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        telefono: true,
        email: true,
        usuario_id: true,
      },
    });

    if (!docente) {
      return res.status(404).json({ error: "Docente no encontrado" });
    }

    return res.json(docente);
  } catch (err) {
    console.error("Error en GET /api/docentes/me/datos:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET /api/docentes/me/comisiones
r.get("/me/comisiones", async (req, res) => {
  try {
    const docente = await prisma.docentes.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!docente) {
      return res.status(404).json({ error: "Docente no encontrado" });
    }

    const rows = await prisma.comisiones.findMany({
      where: { docente_id: docente.id },
      select: {
        id: true,
        codigo: true,
        letra: true,
        horario: true,
        cupo: true,
        sede: true,
        aula: true,
        materias: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
          },
        },
      },
      orderBy: { codigo: "asc" },
    });

    const comisiones = rows.map((c) => ({
      id: c.id,
      codigo: c.codigo,
      letra: c.letra,
      horario: c.horario,
      cupo: c.cupo,
      sede: c.sede,
      aula: c.aula,
      // Se expone como "materia" para mantener compatibilidad con el frontend
      materia: c.materias
        ? {
            id: c.materias.id,
            codigo: c.materias.codigo,
            nombre: c.materias.nombre,
          }
        : null,
    }));

    return res.json(comisiones);
  } catch (err) {
    console.error("Error en GET /api/docentes/me/comisiones:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ===== CARGA DE NOTAS – DOCENTE =====
//
// GET /api/docentes/comisiones/:comisionId/alumnos-calificaciones
// Devuelve los alumnos inscriptos en la comisión y su nota (si existe)

r.get("/comisiones/:comisionId/alumnos-calificaciones", async (req, res) => {
  try {
    const comisionId = parseInt(req.params.comisionId, 10);
    if (Number.isNaN(comisionId)) {
      return res.status(400).json({ error: "comisionId inválido" });
    }

    // Docente logueado
    const docente = await prisma.docentes.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!docente) {
      return res.status(404).json({ error: "Docente no encontrado" });
    }

    // Verificamos que la comisión pertenezca a este docente
    const comision = await prisma.comisiones.findFirst({
      where: { id: comisionId, docente_id: docente.id },
      select: {
        id: true,
        codigo: true,
        materias: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
          },
        },
      },
    });

    if (!comision) {
      return res
        .status(403)
        .json({ error: "No tiene permisos sobre esta comisión" });
    }

    // Traemos inscripciones activas + datos de alumno + su calificación (si existe)
    const inscripciones = await prisma.inscripciones.findMany({
      where: { comision_id: comisionId, estado: "activa" },
      include: {
        alumnos: {
          include: {
            calificaciones: {
              where: { comision_id: comisionId },
              orderBy: { id: "desc" },
              take: 1, // última calificación si hubiera más de una
            },
          },
        },
      },
      orderBy: { alumno_id: "asc" },
    });

    const filas = inscripciones.map((insc) => {
      const alu = insc.alumnos;
      const cal = alu.calificaciones[0] || null;

      return {
        alumnoId: alu.id,
        dni: alu.dni || "",
        nombre: `${alu.apellido}, ${alu.nombre}`,
        comisionId: comision.id,
        comisionCodigo: comision.codigo,
        materiaNombre: comision.materias?.nombre || "",
        calificacionId: cal?.id ?? null,
        nota: cal?.p1 ?? null, // usamos p1 como "nota" principal
        estado: cal?.estado ?? "",
        observacion: cal?.observacion ?? "",
      };
    });

    return res.json(filas);
  } catch (err) {
    console.error(
      "Error en GET /api/docentes/comisiones/:comisionId/alumnos-calificaciones:",
      err
    );
    return res
      .status(500)
      .json({ error: "Error interno del servidor al cargar alumnos/notas" });
  }
});

// POST /api/docentes/comisiones/:comisionId/calificaciones
// Crea o actualiza la nota (p1) de un alumno de esa comisión

r.post("/comisiones/:comisionId/calificaciones", async (req, res) => {
  try {
    const comisionId = parseInt(req.params.comisionId, 10);
    if (Number.isNaN(comisionId)) {
      return res.status(400).json({ error: "comisionId inválido" });
    }

    const { alumnoId, nota } = req.body;

    const alumnoIdNum = parseInt(alumnoId, 10);
    if (!alumnoIdNum || Number.isNaN(alumnoIdNum)) {
      return res.status(400).json({ error: "alumnoId inválido" });
    }

    let notaNum = null;
    if (nota !== null && nota !== undefined && nota !== "") {
      notaNum = parseInt(nota, 10);
      if (Number.isNaN(notaNum) || notaNum < 1 || notaNum > 10) {
        return res
          .status(400)
          .json({ error: "La nota debe estar entre 1 y 10" });
      }
    }

    // Docente logueado
    const docente = await prisma.docentes.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!docente) {
      return res.status(404).json({ error: "Docente no encontrado" });
    }

    // Validamos que la comisión sea suya
    const comision = await prisma.comisiones.findFirst({
      where: { id: comisionId, docente_id: docente.id },
      select: { id: true },
    });

    if (!comision) {
      return res
        .status(403)
        .json({ error: "No tiene permisos sobre esta comisión" });
    }

    // Buscamos una calificación existente para (alumno, comision)
    const existing = await prisma.calificaciones.findFirst({
      where: {
        alumno_id: alumnoIdNum,
        comision_id: comisionId,
      },
      orderBy: { id: "desc" },
    });

    const now = new Date();
    const anioActual = now.getFullYear();

    let saved;
    if (existing) {
      saved = await prisma.calificaciones.update({
        where: { id: existing.id },
        data: {
          p1: notaNum,
          docente_id: docente.id,
          // Si querés, podés actualizar anio/cuatrimestre también
          anio: existing.anio ?? anioActual,
        },
      });
    } else {
      saved = await prisma.calificaciones.create({
        data: {
          alumno_id: alumnoIdNum,
          comision_id: comisionId,
          p1: notaNum,
          estado: null,
          observacion: null,
          anio: anioActual,
          cuatrimestre: 1,
          docente_id: docente.id,
        },
      });
    }

    return res.json({
      ok: true,
      calificacion: {
        id: saved.id,
        alumnoId: saved.alumno_id,
        comisionId: saved.comision_id,
        nota: saved.p1,
      },
    });
  } catch (err) {
    console.error(
      "Error en POST /api/docentes/comisiones/:comisionId/calificaciones:",
      err
    );
    return res
      .status(500)
      .json({ error: "Error interno del servidor al guardar la nota" });
  }
});


// ===== Asistencias del DOCENTE =====
// GET /api/docentes/me/asistencias?comisionId=1&fecha=YYYY-MM-DD
r.get("/me/asistencias", async (req, res) => {
  try {
    const comisionId = Number(req.query.comisionId);
    const fechaStr = String(req.query.fecha || "");

    if (!comisionId || Number.isNaN(comisionId)) {
      return res.status(400).json({ error: "comisionId inválido" });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
      return res
        .status(400)
        .json({ error: "fecha inválida, formato esperado YYYY-MM-DD" });
    }

    // Docente logueado
    const docente = await prisma.docentes.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!docente) {
      return res.status(404).json({ error: "Docente no encontrado" });
    }

    // Verificar que la comisión sea de este docente
    const comision = await prisma.comisiones.findFirst({
      where: { id: comisionId, docente_id: docente.id },
      select: { id: true },
    });

    if (!comision) {
      return res
        .status(403)
        .json({ error: "No autorizado para esta comisión" });
    }

    const fecha = new Date(fechaStr + "T00:00:00Z");

    // Inscripciones activas + datos de alumno
    const inscripciones = await prisma.inscripciones.findMany({
      where: { comision_id: comisionId, estado: "activa" },
      include: {
        alumnos: {
          select: {
            id: true,
            apellido: true,
            nombre: true,
            dni: true,
          },
        },
      },
      orderBy: { alumno_id: "asc" },
    });

    // Asistencias ya cargadas para ese día
    const asistencias = await prisma.asistencias.findMany({
      where: { comision_id: comisionId, fecha },
    });

    const estadoByAlumno = new Map(
      asistencias.map((a) => [a.alumno_id, a.estado])
    );

    const filas = inscripciones.map((insc) => {
      const alu = insc.alumnos;
      return {
        alumnoId: alu.id,
        apellido: alu.apellido,
        nombre: alu.nombre,
        dni: alu.dni || "",
        estado: estadoByAlumno.get(alu.id) || "",
      };
    });

    return res.json(filas);
  } catch (err) {
    console.error("Error en GET /api/docentes/me/asistencias:", err);
    return res
      .status(500)
      .json({ error: "Error interno del servidor al obtener asistencias" });
  }
});

// POST /api/docentes/me/asistencias
// Body: { comisionId, fecha, items: [{ alumnoId, estado }] }
r.post("/me/asistencias", async (req, res) => {
  try {
    const { comisionId, fecha, items } = req.body || {};

    const comIdNum = Number(comisionId);
    if (!comIdNum || Number.isNaN(comIdNum)) {
      return res.status(400).json({ error: "comisionId inválido" });
    }
    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(String(fecha))) {
      return res
        .status(400)
        .json({ error: "fecha inválida, formato esperado YYYY-MM-DD" });
    }

    const docente = await prisma.docentes.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!docente) {
      return res.status(404).json({ error: "Docente no encontrado" });
    }

    const comision = await prisma.comisiones.findFirst({
      where: { id: comIdNum, docente_id: docente.id },
      select: { id: true },
    });

    if (!comision) {
      return res
        .status(403)
        .json({ error: "No autorizado para esta comisión" });
    }

    const fechaDate = new Date(String(fecha) + "T00:00:00Z");

    const cleanItems = (Array.isArray(items) ? items : []).filter(
      (it) => it && it.alumnoId
    );

    await prisma.$transaction(async (tx) => {
      // Borramos la asistencia previa de esa comisión y fecha
      await tx.asistencias.deleteMany({
        where: { comision_id: comIdNum, fecha: fechaDate },
      });

      // Insertamos solo los que tienen estado válido
      for (const it of cleanItems) {
        const aluIdNum = Number(it.alumnoId);
        let estado = String(it.estado || "").toUpperCase();

        if (!aluIdNum || Number.isNaN(aluIdNum)) continue;
        if (!["P", "A", "T"].includes(estado)) continue; // P: presente, A: ausente, T: tarde

        await tx.asistencias.create({
          data: {
            fecha: fechaDate,
            alumno_id: aluIdNum,
            comision_id: comIdNum,
            estado,
          },
        });
      }
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Error en POST /api/docentes/me/asistencias:", err);
    return res
      .status(500)
      .json({ error: "Error interno del servidor al guardar asistencias" });
  }
});


// GET /api/docentes/comisiones/:comisionId/acta
// Devuelve información de acta de cursada para la comisión:
// alumno, porcentaje de asistencia, nota y condición/resultado.
r.get("/comisiones/:comisionId/acta", async (req, res) => {
  try {
    const comisionId = parseInt(req.params.comisionId, 10);
    if (Number.isNaN(comisionId)) {
      return res.status(400).json({ error: "comisionId inválido" });
    }

    // Docente logueado
    const docente = await prisma.docentes.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!docente) {
      return res.status(404).json({ error: "Docente no encontrado" });
    }

    // Verificamos que la comisión pertenezca a este docente
    const comision = await prisma.comisiones.findFirst({
      where: { id: comisionId, docente_id: docente.id },
      select: { id: true },
    });

    if (!comision) {
      return res
        .status(403)
        .json({ error: "No tiene permisos sobre esta comisión" });
    }

    // Inscripciones activas
    const inscripciones = await prisma.inscripciones.findMany({
      where: { comision_id: comisionId, estado: "activa" },
      include: {
        alumnos: {
          select: {
            id: true,
            apellido: true,
            nombre: true,
            dni: true,
          },
        },
      },
      orderBy: { alumno_id: "asc" },
    });

    // Última calificación por alumno en esa comisión
    const califs = await prisma.calificaciones.findMany({
      where: { comision_id: comisionId },
      orderBy: { id: "desc" },
    });

    const califByAlumno = new Map();
    for (const c of califs) {
      if (!califByAlumno.has(c.alumno_id)) {
        califByAlumno.set(c.alumno_id, c);
      }
    }

    // Asistencias por alumno (para porcentaje)
    const asistencias = await prisma.asistencias.findMany({
      where: { comision_id: comisionId },
    });

    const totalPorAlumno = new Map();
    const presentesPorAlumno = new Map();

    for (const a of asistencias) {
      const id = a.alumno_id;
      totalPorAlumno.set(id, (totalPorAlumno.get(id) ?? 0) + 1);
      if (a.estado === "P") {
        presentesPorAlumno.set(
          id,
          (presentesPorAlumno.get(id) ?? 0) + 1
        );
      }
    }

    const hoyISO = new Date().toISOString().slice(0, 10);

    const filas = inscripciones.map((insc) => {
      const alu = insc.alumnos;
      const cal = califByAlumno.get(alu.id);

      const nota = cal?.p1 ?? null;
      const total = totalPorAlumno.get(alu.id) ?? 0;
      const presentes = presentesPorAlumno.get(alu.id) ?? 0;
      const asistenciaPorc =
        total > 0 ? Math.round((presentes / total) * 100) : null;

      let condicion = cal?.estado || "";
      if (!condicion && nota != null) {
        if (nota >= 8) condicion = "Promociona";
        else if (nota >= 6) condicion = "Regular";
        else condicion = "Insuficiente";
      }

      let resultado;
      switch (condicion) {
        case "Insuficiente":
          resultado = "Desaprobado";
          break;
        case "Promociona":
        case "Regular":
        case "Abandonó":
        case "Libre":
          resultado = condicion;
          break;
        default:
          resultado = condicion || "";
      }

      return {
        alumnoId: alu.id,
        nombre: `${alu.apellido}, ${alu.nombre}`,
        dni: alu.dni || "",
        fecha: hoyISO,
        asistenciaPorc,
        condicion,
        nota,
        resultado,
      };
    });

    return res.json(filas);
  } catch (err) {
    console.error("Error en GET /api/docentes/comisiones/:comisionId/acta:", err);
    return res
      .status(500)
      .json({ error: "Error interno del servidor al obtener el acta" });
  }
});



export default r;