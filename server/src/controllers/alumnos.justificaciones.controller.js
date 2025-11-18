import prisma from "../db/prisma.js";

export async function getJustificacionesByAlumno(req, res, next) {
  try {
    // 1) Buscar el alumno real desde el usuario logueado
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    // 2) Usar alumno.id para filtrar justificaciones
    const rows = await prisma.justificaciones.findMany({
      where: { alumno_id: alumno.id },
      include: {
        comisiones: {
          select: {
            codigo: true,
            materias: { select: { nombre: true } },
          },
        },
      },
      orderBy: [{ fecha: "desc" }],
    });

    return res.json(
      rows.map((j) => ({
        id: j.id,
        fecha: j.fecha,
        motivo: j.motivo,
        estado: j.estado,
        documentoUrl: j.documento_url,
        comision: j.comisiones?.codigo || "",
        materia: j.comisiones?.materias?.nombre || "",
      }))
    );
  } catch (err) {
    next(err);
  }
}

export async function postJustificacionByAlumno(req, res, next) {
  try {
    // 1) Buscar el alumno real
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    const { comisionId, motivo, descripcion } = req.body;

    // 2) Unificamos la ruta del archivo con la que usás en alumnos.routes:
    //    /uploads/justificaciones/...
    const documento_url = req.file
      ? `/uploads/justificaciones/${req.file.filename}`
      : null;

    const nueva = await prisma.justificaciones.create({
      data: {
        alumno_id: alumno.id,
        comision_id: Number(comisionId),
        fecha: new Date(), // ahora
        motivo: descripcion || motivo,
        estado: "pendiente",
        documento_url,
      },
    });

    return res.json(nueva);
  } catch (err) {
    next(err);
  }
}
