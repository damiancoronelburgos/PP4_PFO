// controllers/alumnoCalendario.controller.js
import prisma from "../db/prisma.js";

export async function getAlumnoCalendario(req, res) {
  try {
    const alumno = await prisma.alumnos.findFirst({
      where: { usuario_id: req.user.sub },
      select: { id: true },
    });

    if (!alumno) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    // MODELO CORRECTO: eventos
    const eventos = await prisma.eventos.findMany({
      orderBy: { fecha: "asc" },
      include: {
        comisiones: { select: { letra: true } },
      },
    });

    const response = eventos.map((ev) => ({
      id: ev.id,
      titulo: ev.titulo,
      fecha: ev.fecha,
      comision: ev.comisiones?.letra ?? null,
      descripcion: null, // no existe campo descripcion en eventos
    }));

    return res.json(response);

  } catch (err) {
    console.error("GET /api/alumnos/calendario error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
