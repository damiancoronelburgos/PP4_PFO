import { Router } from "express";
import { auth, allowRoles } from "../middlewares/auth.js";
import prisma from "../db/prisma.js";

const r = Router();
r.use(auth, allowRoles("preceptor"));

// GET /api/preceptores/me/datos
r.get("/me/datos", async (req, res) => {
  const preceptor = await prisma.preceptores.findFirst({
    where: { usuario_id: req.user.sub },
  });
  if (!preceptor) return res.status(404).json({ error: "Preceptor no encontrado" });
  return res.json(preceptor);
});

// GET /api/preceptores/me/comisiones
r.get("/me/comisiones", async (req, res) => {
  const preceptor = await prisma.preceptores.findFirst({
    where: { usuario_id: req.user.sub },
    select: { id: true },
  });
  if (!preceptor) return res.status(404).json({ error: "Preceptor no encontrado" });

  const rows = await prisma.preceptor_comision.findMany({
    where: { preceptor_id: preceptor.id },
    include: {
      comision: { include: { materia: true } },
    },
  });

  // aplanado útil
  const comisiones = rows.map(r => r.comision);
  return res.json(comisiones);
});

export default r;