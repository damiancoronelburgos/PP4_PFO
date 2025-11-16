import express from "express";
import morgan from "morgan";
import cors from "cors"; 


// 🔹 Importación de Rutas

// 🔑 RUTA PRINCIPAL DE ALUMNOS (Contiene /api/alumnos/perfil, /avatar, etc.)
import alumnosGestiónRoutes from "./routes/alumnos.routes.js"; 

// 🔑 RUTA DE CALIFICACIONES
import calificacionesRoutes from "./routes/calificaciones.routes.js"; 

// 🔑 RUTA DE CONTACTO (NUEVA)
import contactoRoutes from "./routes/contacto.routes.js"; 

// 💡 OTRAS RUTAS
import authRoutes from "./routes/auth.routes.js"; 
import docentesRoutes from "./routes/docentes.routes.js";
import preceptoresRoutes from "./routes/preceptores.routes.js";
import adminRoutes from "./routes/admin.routes.js";


const app = express();

// --- Middlewares ---

// 1. CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173', 
    credentials: true,
}));

// 2. Manejo de JSON
app.use(express.json());

// 3. Registro de peticiones
app.use(morgan("dev"));

// 4. Servir archivos estáticos 
app.use(express.static('public')); 


// --- Rutas Base ---

// 🔹 Health Check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// 🔹 CONEXIÓN DE RUTAS API 

// Autenticación
app.use("/api/auth", authRoutes);

// Alumnos (Perfil, datos personales, etc.)
app.use("/api/alumnos", alumnosGestiónRoutes); 

// Calificaciones (Nueva ruta)
app.use("/api/calificaciones", calificacionesRoutes); 

// 🚨 CONTACTO (Institucional y Docentes)
app.use("/api/contacto", contactoRoutes);

// Otros roles
app.use("/api/docentes", docentesRoutes);
app.use("/api/preceptores", preceptoresRoutes);
app.use("/api/admin", adminRoutes);


// 🔹 404 API Not Found
// Asegúrate de que esto siempre esté después de todos los montajes de rutas /api
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

export default app;