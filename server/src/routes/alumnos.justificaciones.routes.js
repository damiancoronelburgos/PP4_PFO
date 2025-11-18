import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  getJustificacionesByAlumno,
  postJustificacionByAlumno
} from "../controllers/alumnos.justificaciones.controller.js";

const router = Router();

router.get("/me/justificaciones", authMiddleware, getJustificacionesByAlumno);

router.post("/me/justificaciones", authMiddleware, postJustificacionByAlumno);

export default router;

