import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { getAsistenciasByAlumno } from "../controllers/alumnos.asistencias.controller.js";

const router = Router();

router.get("/me/asistencias", authMiddleware, getAsistenciasByAlumno);

export default router;

