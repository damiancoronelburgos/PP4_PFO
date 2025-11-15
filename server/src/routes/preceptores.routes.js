import { Router } from "express";
import { auth, allowRoles } from "../middlewares/auth.js";
import upload from "../middlewares/uploadAvatar.js";
import {
  getPreceptorDatos,
  getPreceptorComisiones,
  getPreceptorAlumnosMetrics,
  getPreceptorAsistenciasFechas,
  getPreceptorAsistenciasLista,
  savePreceptorAsistencias,
  getPreceptorNotificaciones,
  updatePreceptorNotificacion,
  deletePreceptorNotificacion,
  sendPreceptorComunicacion,
  updatePreceptorAvatar,
  changePreceptorPassword,
  getPreceptorEventosCalendario,
  createPreceptorEventoCalendario,
  deletePreceptorEventoCalendario,
  getPreceptorJustificaciones,
  savePreceptorJustificacionesEstado,
} from "../controllers/preceptores.controller.js";

const router = Router();

// ===== Datos generales =====

router.get(
  "/me/datos",
  auth,
  allowRoles("preceptor"),
  getPreceptorDatos
);

router.get(
  "/me/comisiones",
  auth,
  allowRoles("preceptor"),
  getPreceptorComisiones
);

router.get(
  "/me/alumnos-metrics",
  auth,
  allowRoles("preceptor"),
  getPreceptorAlumnosMetrics
);

// ===== Asistencia =====

router.get(
  "/me/asistencias/fechas",
  auth,
  allowRoles("preceptor"),
  getPreceptorAsistenciasFechas
);

router.get(
  "/me/asistencias",
  auth,
  allowRoles("preceptor"),
  getPreceptorAsistenciasLista
);

router.post(
  "/me/asistencias",
  auth,
  allowRoles("preceptor"),
  savePreceptorAsistencias
);

// ===== Justificaciones =====

router.get(
  "/me/justificaciones",
  auth,
  allowRoles("preceptor"),
  getPreceptorJustificaciones
);

router.post(
  "/me/justificaciones/estado",
  auth,
  allowRoles("preceptor"),
  savePreceptorJustificacionesEstado
);

// ===== Notificaciones / comunicaciones =====

router.get(
  "/me/notificaciones",
  auth,
  allowRoles("preceptor"),
  getPreceptorNotificaciones
);

router.patch(
  "/me/notificaciones/:id",
  auth,
  allowRoles("preceptor"),
  updatePreceptorNotificacion
);

router.delete(
  "/me/notificaciones/:id",
  auth,
  allowRoles("preceptor"),
  deletePreceptorNotificacion
);

router.post(
  "/me/comunicaciones",
  auth,
  allowRoles("preceptor"),
  sendPreceptorComunicacion
);

// ===== Avatar / contraseña =====

router.post(
  "/me/avatar",
  auth,
  allowRoles("preceptor"),
  upload.single("avatar"),
  updatePreceptorAvatar
);

router.post(
  "/me/password",
  auth,
  allowRoles("preceptor"),
  changePreceptorPassword
);

// ===== Calendario (eventos) =====

router.get(
  "/me/eventos-calendario",
  auth,
  allowRoles("preceptor"),
  getPreceptorEventosCalendario
);

router.post(
  "/me/eventos-calendario",
  auth,
  allowRoles("preceptor"),
  createPreceptorEventoCalendario
);

router.delete(
  "/me/eventos-calendario/:id",
  auth,
  allowRoles("preceptor"),
  deletePreceptorEventoCalendario
);

export default router;