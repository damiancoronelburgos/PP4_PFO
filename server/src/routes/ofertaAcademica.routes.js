import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// ===============================================
// FUNCIONES AUXILIARES
// ===============================================

/**
 * Valida y convierte un ID de Docente a Int o Null.
 * Esto previene la violación de clave foránea (P2003) si se envía un valor vacío o inválido,
 * ya que docente_id en la DB permite NULL.
 */
const getValidDocenteId = (idValue) => {
    // Si el valor es falsy (null, undefined, "" del frontend), devolvemos null.
    if (!idValue) return null;
    
    const parsedId = parseInt(idValue);
    
    // Si la conversión falla (NaN) o el ID es 0 o negativo (asumiendo IDs positivos), devolvemos null.
    return !isNaN(parsedId) && parsedId > 0 ? parsedId : null;
};

// ===============================================
// 1. GET / (LEER TODO - SOLUCIÓN BIGINT Y ALIAS)
// ===============================================
router.get("/", async (_req, res) => {
    try {
        // Usamos CONVERT(..., DECIMAL) y ALIAS para:
        // 1. Solucionar el error de BigInt (TypeError: Do not know how to serialize a BigInt).
        // 2. Asegurar que los nombres de los campos (docenteId, comision) coincidan con el frontend.
        const datosConJoin = await prisma.$queryRaw`
            SELECT
                CONVERT(C.id, DECIMAL) AS id,               /* ID de COMISIÓN */
                M.nombre, 
                CONVERT(C.docente_id, DECIMAL) AS docenteId, /* Renombra C.docente_id a docenteId */
                C.letra AS comision,                      /* Renombra C.letra a comision */
                C.horario, 
                CONVERT(C.cupo, DECIMAL) AS cupo            /* Cupo de la comisión */
            FROM 
                materias AS M
            INNER JOIN 
                comisiones AS C
            ON 
                M.id = C.materia_id;
        `;
        
        // El frontend recibirá los campos como números válidos en JSON.
        res.json(datosConJoin);

    } catch (error) {
        console.error("Error al obtener oferta académica con SQL crudo:", error);
        res.status(500).json({ error: "Error de servidor al procesar la oferta académica. Verifique logs para BigInt o errores SQL." });
    }
});

// ===============================================
// 2. POST / (CREAR Materia y Comisión)
// ===============================================
router.post("/", async (req, res) => {
    try {
        // Extraemos 'docenteId' del frontend y el resto de campos
        const { nombre, docenteId: docenteIdFrontend, comision, horario, cupo } = req.body; 
        
        // Obtenemos el ID de docente validado (Int o Null)
        const validDocenteId = getValidDocenteId(docenteIdFrontend);
        
        // Definimos un código único temporal para la materia (obligatorio en la DB)
        const materiaCodigo = "MAT_" + Date.now().toString().slice(-6);

        // 1. Crear la Materia
        const nuevaMateria = await prisma.materias.create({ 
            data: { 
                nombre, 
                codigo: materiaCodigo, 
            }
        });

        // 2. Crear la Comisión asociada
        const nuevaComision = await prisma.comisiones.create({
            data: {
                materia_id: nuevaMateria.id,
                docente_id: validDocenteId, // Usamos el ID validado
                letra: comision,
                horario,
                cupo: parseInt(cupo) || null, // Cupo a Int o Null
                codigo: materiaCodigo + '_COM_' + comision, // Código de comisión único
            }
        });

        // 3. Devolver la fila en el formato esperado por el frontend
        res.json({
            id: nuevaComision.id,
            nombre: nuevaMateria.nombre,
            docenteId: nuevaComision.docente_id,
            comision: nuevaComision.letra,
            horario: nuevaComision.horario,
            cupo: nuevaComision.cupo
        });

    } catch (error) {
        console.error("Error al crear la materia y comisión:", error);
        // Manejo de error de clave foránea (P2003) o código duplicado (P2002)
        if (error.code === 'P2003') {
            return res.status(400).json({ error: "Error de Docente: El ID del docente proporcionado no existe en la base de datos." });
        }
        res.status(500).json({ error: "Error al crear la materia." });
    }
});


// ===============================================
// 3. PUT /:id (ACTUALIZAR Materia y Comisión)
// ===============================================
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params; // ID de la COMISIÓN
        const { nombre, docenteId: docenteIdFrontend, comision, horario, cupo } = req.body;
        
        // Obtenemos el ID de docente validado (Int o Null)
        const validDocenteId = getValidDocenteId(docenteIdFrontend);

        const comisionActual = await prisma.comisiones.findUnique({
            where: { id: parseInt(id) },
        });

        if (!comisionActual) {
            return res.status(404).json({ error: "Comisión no encontrada." });
        }
        
        // 2. Actualizar la MATERIA relacionada (Solo el nombre)
        await prisma.materias.update({
            where: { id: comisionActual.materia_id },
            data: { nombre },
        });

        // 3. Actualizar la COMISIÓN (docente, letra, horario, cupo)
        const comisionActualizada = await prisma.comisiones.update({
            where: { id: parseInt(id) },
            data: {
                docente_id: validDocenteId, // Usamos el ID validado
                letra: comision, 
                horario,
                cupo: parseInt(cupo) || null,
            },
        });
        
        res.json({ materia: { nombre }, comision: comisionActualizada });

    } catch (error) {
        console.error("Error al actualizar la oferta académica:", error);
        // Manejo de error de clave foránea (P2003)
        if (error.code === 'P2003') {
            return res.status(400).json({ error: "Error de Docente: El ID del docente proporcionado no existe en la base de datos." });
        }
        res.status(500).json({ error: "Error al actualizar la materia." });
    }
});

// ===============================================
// 4. DELETE /:id (ELIMINAR Comisión)
// ===============================================
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params; // ID de la COMISIÓN
        
        await prisma.comisiones.delete({ 
            where: { id: parseInt(id) },
        });
        
        res.status(204).send(); 
    } catch (error) {
        console.error("Error al eliminar la comisión:", error);
        res.status(500).json({ error: "Error al eliminar la comisión. Podría estar asociada a otras tablas (inscripciones, asistencias)." });
    }
});

export default router;