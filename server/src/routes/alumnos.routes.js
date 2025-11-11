import { Router } from "express";
import { auth, allowRoles } from "../middlewares/auth.js";
import prisma from "../db/prisma.js";

const r = Router();
r.use(auth, allowRoles("alumno"));

// GET /api/alumnos/me/datos
r.get("/me/datos", async (req, res) => {
  const alumno = await prisma.alumnos.findFirst({
    where: { usuario_id: req.user.sub },
  });
  if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });
  return res.json(alumno);
});

// GET /api/alumnos/me/calificaciones
r.get("/me/calificaciones", async (req, res) => {
  const alumno = await prisma.alumnos.findFirst({
    where: { usuario_id: req.user.sub },
    select: { id: true },
  });
  if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });

  // Incluimos comision y materia (ajustá nombres de relaciones si difieren)
  const rows = await prisma.calificaciones.findMany({
    where: { alumno_id: alumno.id },
    include: {
      comision: { include: { materia: true } },
    },
  });
  return res.json(rows);
});

// GET /api/alumnos/me/asistencias
r.get("/me/asistencias", async (req, res) => {
  const alumno = await prisma.alumnos.findFirst({
    where: { usuario_id: req.user.sub },
    select: { id: true },
  });
  if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });

  const rows = await prisma.asistencias.findMany({
    where: { alumno_id: alumno.id },
    include: { comision: { include: { materia: true } } },
  });
  return res.json(rows);
});

export default r;