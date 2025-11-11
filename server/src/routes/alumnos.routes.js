import { Router } from 'express';
import { getAlumnos, postAlumno } from '../controllers/alumnos.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const r = Router();
r.get('/', requireAuth, getAlumnos);
r.post('/', requireAuth, postAlumno);
export default r;