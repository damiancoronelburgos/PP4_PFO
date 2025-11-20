// server/src/controllers/alumnos.historial.controller.js
import { prisma } from "../lib/prisma.js";

export const getHistorialAcademico = async (req, res) => {
  try {
    const idAlumno = Number(req.params.idAlumno);

    const historial = await prisma.calificaciones.findMany({
      where: {
        alumno_id: idAlumno
      },
      include: {
        comisiones: {
          include: {
            materias: true,
            docentes: true
          }
        }
      },
      orderBy: [
        { anio: "asc" },
        { cuatrimestre: "asc" }
      ]
    });

    return res.json(historial);

  } catch (error) {
    console.error("Error cargando historial académico:", error);
    return res.status(500).json({ message: "Error cargando historial académico" });
  }
};
