// server/src/app.js
import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "node:path";

// Rutas principales
import authRoutes from "./routes/auth.routes.js";
import alumnosRoutes from "./routes/alumnos.routes.js";
import docentesRoutes from "./routes/docentes.routes.js";
import preceptoresRoutes from "./routes/preceptores.routes.js";
import adminRoutes from "./routes/admin.routes.js";

// Rutas nuevas / específicas
// Este router ahora maneja tanto la Oferta Académica como la Gestión de Alumnos
import ofertaAcademicaRoutes from "./routes/ofertaAcademica.routes.js";

import calificacionesRoutes from "./routes/calificaciones.routes.js";
import contactoRoutes from "./routes/contacto.routes.js";
import notificacionesRoutes from "./routes/notificaciones.routes.js";
import calendarioDocenteRoutes from "./routes/calendarioDocente.routes.js";

const app = express();

// =======================
//  CORS
// =======================
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// =======================
//  Middlewares básicos
// =======================
app.use(express.json());
app.use(morgan("dev"));

app.use(express.static("public"));
app.use("/uploads", express.static(path.resolve("uploads")));


// === AGREGAR ESTO PARA EVITAR EL 304 (CACHÉ) ===
app.use((req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
});

// =======================
//  Healthcheck
// =======================
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// =======================
//  Rutas API
// =======================

// Autenticación
app.use("/api/auth", authRoutes);

// Roles
app.use("/api/alumnos", alumnosRoutes);
app.use("/api/docentes", docentesRoutes);
app.use("/api/preceptores", preceptoresRoutes);
app.use("/api/admin", adminRoutes);

// Funcionalidades específicas
app.use("/api/calificaciones", calificacionesRoutes);
app.use("/api/contacto", contactoRoutes);
app.use("/api/notificaciones", notificacionesRoutes);
app.use("/api/calendario", calendarioDocenteRoutes);

// =======================
//  Rutas de GESTIÓN
// =======================

// Gestión de alumnos y oferta académica (admin/preceptor)
// El frontend llama a /api/gestion/alumnos, /api/gestion/materias, etc.
app.use("/api/gestion", ofertaAcademicaRoutes);

// Mantenemos esta ruta por si alguna parte del frontend la usa específicamente
app.use("/api/ofertaAcademica", ofertaAcademicaRoutes);


// =======================
//  404 para /api
// =======================
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default app;