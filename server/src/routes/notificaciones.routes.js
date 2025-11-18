import { Router } from "express";
import {
  getNotificacionesByAlumno,
  updateNotificacionAlumno,
  deleteNotificacionAlumno
} from "../controllers/notificaciones.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

// Notificaciones del alumno logueado
router.get("/me", authMiddleware, getNotificacionesByAlumno);

router.patch("/me/:id", authMiddleware, updateNotificacionAlumno);

router.delete("/me/:id", authMiddleware, deleteNotificacionAlumno);

export default router;
