import { Router } from "express";
import { auth, allowRoles } from "../middlewares/auth.js";
import prisma from "../db/prisma.js";

const r = Router();
r.use(auth, allowRoles("administrador"));

// GET /api/admin/usuarios
r.get("/usuarios", async (_req, res) => {
  const users = await prisma.usuarios.findMany({
    select: {
      id: true,
      username: true,
      rol: { select: { nombre: true } },
    },
    orderBy: { username: "asc" },
  });
  return res.json(users.map(u => ({ id: u.id, username: u.username, role: u.rol?.nombre })));
});

export default r;