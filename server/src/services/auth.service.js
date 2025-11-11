import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma.js';
import { config } from '../config/env.js';

export async function login(username, password) {
  const user = await prisma.usuarios.findUnique({ where: { username } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return null;
  const role = await prisma.roles.findUnique({ where: { id: user.rol_id } });
  const token = jwt.sign({ id: user.id, username, rol: role.nombre }, config.jwtSecret, { expiresIn: '8h' });
  return { token, user: { id: user.id, username, rol: role.nombre } };
}