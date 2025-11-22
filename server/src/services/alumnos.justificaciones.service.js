import { prisma } from "../db/prisma.js";

export async function listarAsistenciasAlumno(alumnoId) {
  return prisma.asistencias.findMany({
    where: { alumno_id: alumnoId },
    include: {
      comisiones: {
        select: {
          codigo: true,
          materias: { select: { nombre: true } }
        }
      }
    },
    orderBy: { fecha: "desc" }
  });
}

export async function listarJustificacionesAlumno(alumnoId) {
  return prisma.justificaciones.findMany({
    where: { alumno_id: alumnoId },
    include: {
      comisiones: {
        select: { codigo: true }
      }
    },
    orderBy: { fecha: "desc" }
  });
}

export async function crearJustificacion(alumnoId, { motivo, descripcion, comisionId, documentoUrl }) {

  return prisma.justificaciones.create({
    data: {
      alumno_id: alumnoId,
      comision_id: Number(comisionId),
      motivo: descripcion || motivo,
      estado: "pendiente",
      documento_url: documentoUrl || null,
      fecha: new Date()
    }
  });
}
