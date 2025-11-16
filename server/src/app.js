import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "node:path";

// 🔹 Rutas principales
import authRoutes from "./routes/auth.routes.js";
import alumnosRoutes from "./routes/alumnos.routes.js";
import docentesRoutes from "./routes/docentes.routes.js";
import preceptoresRoutes from "./routes/preceptores.routes.js";
import adminRoutes from "./routes/admin.routes.js";

// 🔹 Rutas nuevas / específicas
import ofertaAcademicaRoutes from "./routes/ofertaAcademica.routes.js";
import constanciasRoutes from "./routes/constancias.routes.js";
import gestionAlumnosRouter from "./routes/gestionalumnos.routes.js";
import calificacionesRoutes from "./routes/calificaciones.routes.js";
import contactoRoutes from "./routes/contacto.routes.js";

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

// Archivos estáticos generales (por ejemplo, /public/logo.png)
app.use(express.static("public"));

// Archivos subidos (avatars, etc.)
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

// Alumnos (me/datos, me/calificaciones, me/asistencias, listado para admin/preceptor, etc.)
app.use("/api/alumnos", alumnosRoutes);

// Calificaciones (rutas específicas que hayas definido en calificaciones.routes.js)
app.use("/api/calificaciones", calificacionesRoutes);

// Contacto (institucional / docentes)
app.use("/api/contacto", contactoRoutes);

// Otros roles
app.use("/api/docentes", docentesRoutes);
app.use("/api/preceptores", preceptoresRoutes);
app.use("/api/admin", adminRoutes);

// Gestión de alumnos (ABM desde panel admin)
app.use("/api/gestion", gestionAlumnosRouter);

// Oferta académica (materias + comisiones)
app.use("/api/ofertaAcademica", ofertaAcademicaRoutes);

// Constancias (historial académico, PDFs, etc.)
app.use("/api/constancias", constanciasRoutes);

// =======================
//  404 para /api
// =======================
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default app;