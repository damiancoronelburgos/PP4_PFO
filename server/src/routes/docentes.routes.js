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

export default r;