import { Router } from "express";
import { auth, allowRoles } from "../middlewares/auth.js";
import prisma from "../db/prisma.js";

const r = Router();
// SOLO aplicamos 'auth' globalmente para que el token se decodifique.
r.use(auth); 

// GET /api/alumnos/me/datos
// 🚨 CORREGIDO: Añadimos la restricción de rol "alumno".
r.get("/me/datos", allowRoles("alumno"), async (req, res) => {
    const alumno = await prisma.alumnos.findFirst({
        where: { usuario_id: req.user.sub },
    });
    if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });
    return res.json(alumno);
});

// GET /api/alumnos/me/calificaciones
// 🚨 CORREGIDO: Añadimos la restricción de rol "alumno".
r.get("/me/calificaciones", allowRoles("alumno"), async (req, res) => {
    const alumno = await prisma.alumnos.findFirst({
        where: { usuario_id: req.user.sub },
        select: { id: true },
    });
    if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });

    // Incluimos comision y materia (ajustá nombres de relaciones si difieren)
    const rows = await prisma.calificaciones.findMany({
        where: { alumno_id: alumno.id },
        include: {
            comision: { include: { materia: true } },
        },
    });
    return res.json(rows);
});

// GET /api/alumnos/me/asistencias
// 🚨 CORREGIDO: Añadimos la restricción de rol "alumno".
r.get("/me/asistencias", allowRoles("alumno"), async (req, res) => {
    const alumno = await prisma.alumnos.findFirst({
        where: { usuario_id: req.user.sub },
        select: { id: true },
    });
    if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });

    const rows = await prisma.asistencias.findMany({
        where: { alumno_id: alumno.id },
        include: { comision: { include: { materia: true } } },
    });
    return res.json(rows);
});

// 🔹 NUEVA RUTA DE GESTIÓN (solicitada por el frontend de Constancias)
// GET /api/alumnos
r.get("/", allowRoles("administrador", "preceptor"), async (_req, res) => {
    try {
        const alumnos = await prisma.alumnos.findMany({
            // 🚨 SOLUCIÓN FINAL: Eliminamos 'curso: true' ya que no existe en la tabla alumnos.
            select: { id: true, nombre: true, apellido: true, dni: true } 
        });
        return res.json(alumnos);
    } catch (error) {
        console.error("Error al listar alumnos para gestión:", error); 
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});

export default r;