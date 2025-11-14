import { listAlumnos, createAlumno } from '../services/alumnos.service.js';

export async function getAlumnos(req, res) {
  const items = await listAlumnos(req.query);
  res.json(items);
}

export async function postAlumno(req, res) {
  const a = await createAlumno(req.body);
  res.status(201).json(a);
}