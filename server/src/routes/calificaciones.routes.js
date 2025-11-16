import { Router } from "express";
import prisma from "../db/prisma.js";
import { auth, allowRoles } from "../middlewares/auth.js";

const r = Router();

// Usamos auth para todas las rutas de este router
r.use(auth);

/**
 * GET /api/calificaciones/
 * Obtiene las calificaciones del alumno logueado (rol alumno).
 */
r.get("/", allowRoles("alumno"), async (req, res) => {
  try {
    // 1) Buscar al alumno asociado al usuario logueado
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    // 2) Traer calificaciones de ese alumno con sus comisiones y materias
    const rows = await prisma.calificaciones.findMany({
      where: { alumno_id: alumno.id },
      include: {
        // Según tu schema:
        // calificaciones -> comisiones -> materias
        comisiones: {
          include: { materias: true },
        },
        docentes: true, // por si lo querés usar después
      },
      orderBy: [
        { anio: "desc" },
        { cuatrimestre: "desc" },
        { id: "desc" },
      ],
    });

    // 3) Mapear al formato que espera Calificaciones.jsx
    const resultadoLimpio = rows.map((c) => {
      const com = c.comisiones;
      const mat = com?.materias;

      return {
        id: c.id,
        materiaId: mat?.id ?? null,
        materiaNombre: mat?.nombre ?? "Sin materia",

        comisionNombre: com
          ? `${com.codigo}${com.letra ? " - " + com.letra : ""}`
          : "-",

        parciales: {
          p1: c.p1,
          p2: c.p2,
          p3: c.p3,
        },

        estado: c.estado ?? "",
        observacion: c.observacion ?? "",
        anio: c.anio ?? null,
        cuatrimestre: c.cuatrimestre ?? null,
      };
    });

    return res.json(resultadoLimpio);
  } catch (error) {
    console.error("Error al obtener calificaciones:", error);
    return res
      .status(500)
      .json({ error: "Error interno del servidor al cargar calificaciones." });
  }
});

export default r;