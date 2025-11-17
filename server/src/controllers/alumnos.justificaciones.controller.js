import prisma from "../db/prisma.js";

export async function getJustificacionesByAlumno(req, res, next) {
  try {
    const alumnoId = req.user.sub;

    const rows = await prisma.justificaciones.findMany({
      where: { alumno_id: alumnoId },
      include: {
        comisiones: {
          select: {
            codigo: true,
            materias: { select: { nombre: true } }
          }
        }
      },
      orderBy: [{ fecha: "desc" }]
    });

    return res.json(
      rows.map(j => ({
        id: j.id,
        fecha: j.fecha,
        motivo: j.motivo,
        estado: j.estado,
        documentoUrl: j.documento_url,
        comision: j.comisiones?.codigo || "",
        materia: j.comisiones?.materias?.nombre || ""
      }))
    );
  } catch (err) {
    next(err);
  }
}

export async function postJustificacionByAlumno(req, res, next) {
  try {
    const alumnoId = req.user.sub;

    const { comisionId, motivo, descripcion } = req.body;
    const documento_url = req.file ? `/uploads/${req.file.filename}` : null;

    const nueva = await prisma.justificaciones.create({
      data: {
        alumno_id: alumnoId,
        comision_id: Number(comisionId),
        fecha: new Date(),
        motivo,
        estado: "pendiente",
        documento_url
      }
    });

    return res.json(nueva);
  } catch (err) {
    next(err);
  }
}
