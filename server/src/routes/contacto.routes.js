// src/routes/contacto.routes.js
import { Router } from "express";
import prisma from "../db/prisma.js";

const r = Router();

// ===============================
// Mock de información institucional (ajusta esto a tu modelo real)
// Si tienes una tabla de 'Configuracion', úsala. Si no, devuelve un objeto fijo.
// ===============================
r.get("/institucional", async (req, res) => {
    // 🚨 NOTA: Si esta data está en una tabla (ej. 'settings'), usa prisma.settings.findFirst()
    const dataMock = {
        nombre: "Instituto Superior de Formación",
        direccion: "Av. Principal 1234, CABA",
        telefono: "+54 11 5555-1234",
        email_secretaria: "secretaria@instituto.edu.ar",
    };
    return res.json(dataMock);
});

// ===============================
// Obtener lista de Docentes
// ===============================
r.get("/docentes", async (req, res) => {
    try {
        // Traemos todos los docentes con sus datos de contacto
        const docentes = await prisma.docentes.findMany({
            select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
                telefono: true,
            },
            // Opcional: ordenar por apellido
            orderBy: { apellido: 'asc' } 
        });

        return res.json(docentes);
    } catch (err) {
        console.error("Error en /docentes:", err);
        return res.status(500).json({ error: "Error al obtener la lista de docentes." });
    }
});

export default r;