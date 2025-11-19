//server/src/app.js
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
import ofertaAcademicaRoutes from "./routes/ofertaAcademica.routes.js";
import constanciasRoutes from "./routes/constancias.routes.js";
import gestionAlumnosRouter from "./routes/gestionalumnos.routes.js";
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

// Alumnos (TODO lo del alumno va en ALUMNOS.ROUTES)
app.use("/api/alumnos", alumnosRoutes);app.use("/api/docentes", docentesRoutes);app.use("/api/docentes", docentesRoutes);app.use("/api/docentes", docentesRoutes);

// Calificaciones
app.use("/api/calificaciones", calificacionesRoutes);

// Contacto institucional
app.use("/api/contacto", contactoRoutes);

// Otros roles
app.use("/api/docentes", docentesRoutes);
app.use("/api/preceptores", preceptoresRoutes);
app.use("/api/admin", adminRoutes);

// Calendario docente
app.use("/api/calendario", calendarioDocenteRoutes);


// Gestión de alumnos (admin)
app.use("/api/gestion", gestionAlumnosRouter);

// Oferta académica
app.use("/api/ofertaAcademica", ofertaAcademicaRoutes);

// Notificaciones globales (ADMIN)
app.use("/api/notificaciones", notificacionesRoutes);

// === ESTE 404 DEBE IR AL FINAL DEL ARCHIVO ===
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default app;
