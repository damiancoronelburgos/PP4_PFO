import { Router } from "express";
import { getNotificacionesByAlumno } from "../controllers/notificaciones.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

// Notificaciones del alumno logueado
router.get("/me", authMiddleware, getNotificacionesByAlumno);

export default router;

router.patch(
  "/me/:id",
  authMiddleware,
  updateNotificacionAlumno
);

router.delete(
  "/me/:id",
  authMiddleware,
  deleteNotificacionAlumno
);
