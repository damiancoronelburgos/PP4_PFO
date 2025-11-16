// src/routes/calificaciones.routes.js

import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { auth } from "../middlewares/auth.js"; 

const prisma = new PrismaClient();
const r = Router();

/**
 * GET /api/calificaciones/
 * Obtiene las calificaciones del alumno logueado.
 */
r.get("/", auth, async (req, res) => {
    // Usando req.user?.sub consistentemente para el ID del alumno
    const alumnoId = req.user?.sub || 1; 

    try {
        const calificaciones = await prisma.calificaciones.findMany({
            where: {
                alumno_id: alumnoId,
            },
            // ✅ USAMOS SELECT con los nombres de campo EXACTOS de tu schema
            select: {
                id: true,
                estado: true,
                observacion: true,
                
                // ✅ Campos de notas según schema
                p1: true,         
                p2: true,
                p3: true,
                
                // Campos de fecha y periodo
                anio: true,         
                cuatrimestre: true, 

                // Relación con comisión y materia
                comision: {
                    select: {
                        codigo: true, 
                        letra: true,
                        materia: {
                            select: {
                                id: true,
                                nombre: true, 
                            },
                        },
                    },
                },
            },
        });

        // Mapeo para devolver los datos estructurados que espera Calificaciones.jsx
        const resultadoLimpio = calificaciones.map(c => ({
            id: c.id,
            materiaId: c.comision.materia.id,
            materiaNombre: c.comision.materia.nombre,
            comisionNombre: `${c.comision.codigo}${c.comision.letra ? ' - ' + c.comision.letra : ''}`,
            
            // ✅ Mapeo de notas usando los nombres 'p1', 'p2', 'p3' del modelo
            parciales: {
                p1: c.p1,
                p2: c.p2,
                p3: c.p3,
            },
            
            estado: c.estado,
            observacion: c.observacion,
            anio: c.anio,
            cuatrimestre: c.cuatrimestre,
        }));
        
        return res.json(resultadoLimpio);

    } catch (error) {
        console.error("Error al obtener calificaciones:", error);
        // Sugerencia: Si el error persiste, imprime el error de Prisma aquí para verlo en la consola
        // console.error(JSON.stringify(error, null, 2));
        return res.status(500).json({ error: "Error interno del servidor al cargar calificaciones." });
    }
});


export default r;