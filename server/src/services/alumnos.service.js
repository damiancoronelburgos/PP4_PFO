import { prisma } from '../db/prisma.js';

export function listAlumnos({ dni, nombre, page=1, size=20 }) {
  const where = {
    AND: [
      dni ? { dni: String(dni) } : {},
      nombre ? { OR: [{ nombre: { contains: nombre } }, { apellido: { contains: nombre } }] } : {}
    ]
  };
  return prisma.alumnos.findMany({ where, skip: (page-1)*size, take: Number(size) });
}

export function createAlumno(data) {
  return prisma.alumnos.create({ data });
}