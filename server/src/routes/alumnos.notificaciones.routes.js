import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  getNotificacionesByAlumno,
  updateNotificacionAlumno,
  deleteNotificacionAlumno
} from "../controllers/notificaciones.controller.js";

const router = Router();

router.get("/me/notificaciones", authMiddleware, getNotificacionesByAlumno);

router.patch("/me/notificaciones/:id", authMiddleware, updateNotificacionAlumno);

router.delete("/me/notificaciones/:id", authMiddleware, deleteNotificacionAlumno);

export default router;
