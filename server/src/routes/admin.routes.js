// server/src/routes/admin.routes.js
import { Router } from "express";
import { auth, allowRoles } from "../middlewares/auth.js";
import prisma from "../db/prisma.js";

const r = Router();

r.use(auth, allowRoles("administrador"));

// GET /api/admin/usuarios
r.get("/usuarios", async (_req, res) => {
  try {
    const users = await prisma.usuarios.findMany({
      select: {
        id: true,
        username: true,
        rol: { select: { nombre: true } },
      },
      orderBy: { username: "asc" },
    });

    const out = users.map((u) => ({
      id: u.id,
      username: u.username,
      role: u.rol?.nombre || null,
    }));

    return res.json(out);
  } catch (err) {
    console.error("GET /api/admin/usuarios error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default r;