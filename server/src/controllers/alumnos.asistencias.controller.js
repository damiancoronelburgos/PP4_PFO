import prisma from "../db/prisma.js";

export async function getAsistenciasByAlumno(req, res, next) {
  try {
    const alumnoId = req.user.sub;

    const rows = await prisma.asistencias.findMany({
      where: { alumno_id: alumnoId },
      include: {
        comisiones: {
          select: {
            id: true,
            codigo: true,
            materias: { select: { nombre: true } }
          }
        }
      },
      orderBy: [{ fecha: "desc" }]
    });

    const resultado = rows.map(a => ({
      id: a.id,
      fecha: a.fecha,
      estado: a.estado, // P / A / T / J
      materia: a.comisiones?.materias?.nombre || "",
      comision: a.comisiones?.codigo || ""
    }));

    return res.json(resultado);
  } catch (err) {
    next(err);
  }
}
