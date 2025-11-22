import { Router } from "express";
import uploadJustificacion from "../middlewares/uploadJustificacion.js";
import {
  getAsistencias,
  getJustificaciones,
  enviarJustificacion
} from "../controllers/alumnos.justificaciones.controller.js";

const router = Router();

// Obtener asistencias
router.get("/asistencias", getAsistencias);

// Obtener justificaciones
router.get("/justificaciones", getJustificaciones);

// Enviar nueva justificación (CON ARCHIVO)
router.post(
  "/justificaciones",
  uploadJustificacion.single("documento"),
  enviarJustificacion
);

export default router;
