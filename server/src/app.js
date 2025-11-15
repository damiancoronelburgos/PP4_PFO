import express from "express";
import morgan from "morgan";
import cors from "cors"; 

// 🔹 Importación de Rutas
import authRoutes from "./routes/auth.routes.js";
import alumnosRoutes from "./routes/alumnos.routes.js";
import docentesRoutes from "./routes/docentes.routes.js";
import preceptoresRoutes from "./routes/preceptores.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import ofertaAcademicaRoutes from "./routes/ofertaAcademica.routes.js"; 
// ✅ NUEVA LÍNEA: Importar la ruta de constancias
import constanciasRoutes from "./routes/constancias.routes.js";


const app = express();

// --- Middlewares ---
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173', 
    credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));

// --- Rutas Base ---

// 🔹 Health Check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// 🔹 CONEXIÓN DE RUTAS API 
app.use("/api/auth", authRoutes);
app.use("/api/alumnos", alumnosRoutes);
app.use("/api/docentes", docentesRoutes);
app.use("/api/preceptores", preceptoresRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Conexión de la ruta de Oferta Académica (anteriormente modificada)
app.use("/api/ofertaAcademica", ofertaAcademicaRoutes); 

// ✅ NUEVA LÍNEA: Conexión de la ruta de Constancias
app.use("/api/constancias", constanciasRoutes); 

// 🔹 404 API Not Found
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

export default app;