import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../db/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

const normUser = (u) => String(u || "").trim().toLowerCase();

export async function login(req, res) {
  const username = normUser(req.body?.username);
  const password = String(req.body?.password || "");

  if (!username || !password) {
    return res.status(400).json({ error: "Usuario y contraseña requeridos" });
  }

  const user = await prisma.usuarios.findUnique({
    where: { username },                 // username guardado en minúsculas
    include: { rol: { select: { nombre: true } } },
  });
  // Misma respuesta para usuario inexistente o password inválida (no filtrar info)
  if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

  const role = user.rol?.nombre;
  if (!role) return res.status(409).json({ error: "Usuario sin rol asignado" });

  const token = jwt.sign({ sub: user.id, role }, JWT_SECRET, { expiresIn: "8h" });
  const displayName = user.username;

  return res.json({
    token,
    user: { id: user.id, username: user.username, role, displayName },
  });
}

export async function me(req, res) {
  const user = await prisma.usuarios.findUnique({
    where: { id: req.user.sub },
    include: { rol: { select: { nombre: true } } },
  });
  if (!user) return res.status(404).json({ error: "No existe" });
  return res.json({ id: user.id, username: user.username, role: user.rol?.nombre });
}