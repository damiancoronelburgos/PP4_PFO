import prisma from "../db/prisma.js";

export async function getAsistenciasByAlumno(req, res, next) {
  try {
    // 1) Buscar el alumno real a partir del usuario logueado
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    // 2) Usar alumno.id (NO req.user.sub) para filtrar asistencias
    const rows = await prisma.asistencias.findMany({
      where: { alumno_id: alumno.id },
      include: {
        comisiones: {
          select: {
            id: true,
            codigo: true,
            materias: { select: { nombre: true } },
          },
        },
      },
      orderBy: [{ fecha: "desc" }],
    });

    const resultado = rows.map((a) => ({
      id: a.id,
      fecha: a.fecha,
      estado: a.estado, // P / A / T / J
      materia: a.comisiones?.materias?.nombre || "",
      comision: a.comisiones?.codigo || "",
    }));

    return res.json(resultado);
  } catch (err) {
    next(err);
  }
}
