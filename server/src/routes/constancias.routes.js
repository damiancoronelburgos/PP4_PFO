import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// ===============================================
// GET /api/constancias/historial/:alumnoId
// Obtiene el historial académico de un alumno específico.
// ===============================================
router.get("/historial/:alumnoId", async (req, res) => {
    try {
        const { alumnoId } = req.params;
        const alumno_id = parseInt(alumnoId);

        if (isNaN(alumno_id)) {
            return res.status(400).json({ error: "ID de alumno no válido." });
        }

        // Consulta SQL para obtener el historial académico:
        const historial = await prisma.$queryRaw`
            SELECT
                M.nombre AS materia,
                C.letra AS comision,
                IFNULL(CA.p1, '-') AS p1,
                IFNULL(CA.p2, '-') AS p2,
                IFNULL(CA.p3, '-') AS p3,
                IFNULL(CA.estado, 'Inscripto') AS estado_materia,
                I.fecha_insc AS fecha_inscripcion,
                CA.anio AS anio_cursada
            FROM 
                inscripciones AS I
            INNER JOIN 
                comisiones AS C ON I.comision_id = C.id
            INNER JOIN
                materias AS M ON C.materia_id = M.id
            LEFT JOIN /* LEFT JOIN para incluir materias aún sin calificar */
                calificaciones AS CA ON I.alumno_id = CA.alumno_id AND I.comision_id = CA.comision_id
            WHERE 
                I.alumno_id = ${alumno_id}
            ORDER BY
                CA.anio, M.nombre;
        `;

        // 🚨 Mapeo final a un formato de arreglo para jsPDF-autotable:
        const dataForTable = historial.map(item => {
            // Calcular Nota Final simple (ej. promedio de p1, p2, p3)
            let notas = [item.p1, item.p2, item.p3].filter(n => n !== '-').map(Number);
            let notaFinal = notas.length > 0 
                ? (notas.reduce((sum, n) => sum + n, 0) / notas.length).toFixed(1)
                : '-';
            
            // Determinar el Estado de Aprobación
            let estadoAprobacion = item.estado_materia === 'Aprobado' || item.estado_materia === 'Promocionado'
                                 ? 'Aprobado' 
                                 : (item.estado_materia === 'Inscripto' ? 'En Curso' : 'Regular/Final');

            // Formato de fecha
            const fechaInsc = new Date(item.fecha_inscripcion).toLocaleDateString('es-AR');

            return [
                item.materia,
                item.comision,
                notaFinal, // Promedio de P1, P2, P3
                fechaInsc,
                estadoAprobacion
            ];
        });

        res.json(dataForTable);
        
    } catch (error) {
        console.error("Error al obtener historial académico:", error);
        res.status(500).json({ error: "Error de servidor al obtener el historial académico." });
    }
});

export default router;