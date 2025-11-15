import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "node:path";

// Rutas
import authRoutes from "./routes/auth.routes.js";
import alumnosRoutes from "./routes/alumnos.routes.js";
import docentesRoutes from "./routes/docentes.routes.js";
import preceptoresRoutes from "./routes/preceptores.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import ofertaAcademicaRoutes from "./routes/ofertaAcademica.routes.js";
import constanciasRoutes from "./routes/constancias.routes.js";
// gestión de alumnos
import gestionAlumnosRouter from "./routes/gestionalumnos.routes.js";

const app = express();

// CORS con lista de orígenes
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // toma lo de main; si quisieras, podés poner false
  })
);

app.use(express.json());
app.use(morgan("dev"));

// Healthcheck
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// Rutas de autenticación
app.use("/api/auth", authRoutes);

// Rutas por rol
app.use("/api/alumnos", alumnosRoutes);
app.use("/api/docentes", docentesRoutes);
app.use("/api/preceptores", preceptoresRoutes);
app.use("/api/admin", adminRoutes);

// Gestión de alumnos
app.use("/api/gestion", gestionAlumnosRouter);

// Otras rutas nuevas
app.use("/api/ofertaAcademica", ofertaAcademicaRoutes);
app.use("/api/constancias", constanciasRoutes);

// Archivos estáticos (avatares, etc.)
app.use("/uploads", express.static(path.resolve("uploads")));

// 404 para cualquier /api que no exista
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default app;