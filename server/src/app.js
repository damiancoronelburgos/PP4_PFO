import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "node:path";

// Rutas principales de usuario/roles
import authRoutes from "./routes/auth.routes.js";
import alumnosRoutes from "./routes/alumnos.routes.js";
import docentesRoutes from "./routes/docentes.routes.js";
import preceptoresRoutes from "./routes/preceptores.routes.js";
import calificacionesRoutes from "./routes/calificaciones.routes.js";
import contactoRoutes from "./routes/contacto.routes.js";
import notificacionesRoutes from "./routes/notificaciones.routes.js";

// Rutas de Administración / Gestión
import adminRoutes from "./routes/admin.routes.js";
import ofertaAcademicaRoutes from "./routes/ofertaAcademica.routes.js";
import constanciasRoutes from "./routes/constancias.routes.js"; // Importado, pero no montado
import gestionAlumnosRouter from "./routes/gestionalumnos.routes.js";

const app = express();

// =======================
// CORS
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
// Middlewares básicos
// =======================
app.use(express.json());
app.use(morgan("dev"));

app.use(express.static("public"));
app.use("/uploads", express.static(path.resolve("uploads")));

// =======================
// Healthcheck
// =======================
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// =============================================
// Rutas API de USUARIOS (Alumnos, Docentes, etc.)
// =============================================

// Autenticación
app.use("/api/auth", authRoutes);

// Rutas específicas del Alumno logueado
app.use("/api/alumnos", alumnosRoutes);

// Rutas de otros roles
app.use("/api/docentes", docentesRoutes);
app.use("/api/preceptores", preceptoresRoutes);
app.use("/api/calificaciones", calificacionesRoutes);
app.use("/api/contacto", contactoRoutes);
app.use("/api/notificaciones", notificacionesRoutes);

// =============================================
// Rutas API de GESTIÓN (Administradores / Preceptores)
// =============================================

// Rutas raíz de administrador
app.use("/api/admin", adminRoutes);

// Gestión de alumnos (CRUD, Filtros, Comunicados)
app.use("/api/gestion", gestionAlumnosRouter);

// Gestión de oferta académica (CRUD de Materias/Comisiones)
app.use("/api/ofertaAcademica", ofertaAcademicaRoutes);

// Nota: 'constanciasRoutes' fue importado pero no montado.
// Si es un router, se montaría aquí:
// app.use("/api/constancias", constanciasRoutes);

// =======================
// 404 para /api
// =======================
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default app;