import { Router } from "express";
import { auth, allowRoles } from "../middlewares/auth.js";
import prisma from "../db/prisma.js";

const r = Router();
r.use(auth, allowRoles("docente"));

// GET /api/docentes/me/datos
r.get("/me/datos", async (req, res) => {
  const docente = await prisma.docentes.findFirst({
    where: { usuario_id: req.user.sub },
  });
  if (!docente) return res.status(404).json({ error: "Docente no encontrado" });
  return res.json(docente);
});

// GET /api/docentes/me/comisiones
r.get("/me/comisiones", async (req, res) => {
  const docente = await prisma.docentes.findFirst({
    where: { usuario_id: req.user.sub },
    select: { id: true },
  });
  if (!docente) return res.status(404).json({ error: "Docente no encontrado" });

  const comisiones = await prisma.comisiones.findMany({
    where: { docente_id: docente.id },
    include: { materia: true },
  });
  return res.json(comisiones);
});

export default r;