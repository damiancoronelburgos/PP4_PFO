import express from "express";
import morgan from "morgan";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import alumnosRoutes from "./routes/alumnos.routes.js";
import docentesRoutes from "./routes/docentes.routes.js";
import preceptoresRoutes from "./routes/preceptores.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

// CORS
const allowed = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map(s => s.trim());
app.use(cors({
  origin: allowed,
  credentials: false,
}));

// Middlewares
app.use(express.json());
app.use(morgan("dev"));

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/alumnos", alumnosRoutes);
app.use("/api/docentes", docentesRoutes);
app.use("/api/preceptores", preceptoresRoutes);
app.use("/api/admin", adminRoutes);

// 404 API
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

export default app;