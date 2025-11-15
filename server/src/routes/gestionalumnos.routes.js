import { Router } from "express";
import { auth, allowRoles } from "../middlewares/auth.js";
import prisma from "../db/prisma.js";

const r = Router();

// Aplicamos autenticación y autorización para Administradores y Preceptores
r.use(auth, allowRoles("administrador", "preceptor"));

// =============================================
// Rutas CRUD para Alumnos
// =============================================

// GET /api/gestion/alumnos (LEER todos con el nombre de la materia) 🔎
r.get("/alumnos", async (_req, res) => {
    try {
        const alumnos = await prisma.alumnos.findMany({
            select: { 
                id: true, 
                dni: true, 
                nombre: true, 
                apellido: true, 
                telefono: true, 
                email: true,
                materia_id: true, 
                materia_principal: { 
                    select: { 
                        nombre: true 
                    } 
                }
            },
        });

        // Mapeo y formateo para que el frontend obtenga "nombre_materia"
        const alumnosConMateria = alumnos.map(alumno => ({
            id: alumno.id,
            dni: alumno.dni,
            nombre: alumno.nombre,
            apellido: alumno.apellido,
            telefono: alumno.telefono,
            email: alumno.email,
            materia_id: alumno.materia_id,
            nombre_materia: alumno.materia_principal?.nombre || 'Sin Asignar', 
        }));
        
        return res.json(alumnosConMateria);

    } catch (error) {
        console.error("Error al obtener alumnos:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});



// =============================================
// NUEVA RUTA: GET /api/gestion/alumnos/emails 📧
// Obtiene solo la lista de emails de los alumnos.
// =============================================
r.get("/alumnos/emails", async (req, res) => {
    const { carrera, comision } = req.query; 

    try {
        let whereQuery = {};
        
        // 1. Filtro por Materia Principal
        if (carrera && carrera !== 'Todas') {
            whereQuery.materia_principal = { nombre: carrera };
        }

        // 2. Filtro por Comisión
        if (comision && comision !== 'Todas') {
            whereQuery.inscripciones = {
                some: { comision: { letra: comision } }
            };
        }

        // 3. Consulta a la base de datos para obtener solo los emails
        const alumnos = await prisma.alumnos.findMany({
            where: whereQuery, 
            select: { email: true } // Solo necesitamos el email
        });

        // 4. Extracción, limpieza y retorno como un array de strings
        const destinatarios = alumnos
            .map(a => a.email)
            .filter(email => email && email.includes('@')); 
        
        return res.status(200).json(destinatarios);

    } catch (error) {
        console.error("Error al obtener emails filtrados:", error);
        return res.status(500).json({ error: "Error interno del servidor al filtrar emails." });
    }
});

// POST /api/gestion/alumnos (CREAR nuevo alumno) ✨
r.post("/alumnos", async (req, res) => {
    const { dni, nombre, apellido, telefono, email, materia_id } = req.body;
    
    if (!dni || !nombre || !apellido || !materia_id) {
        return res.status(400).json({ error: "Faltan datos obligatorios." });
    }

    try {
        const nuevoAlumno = await prisma.alumnos.create({
            data: {
                dni,
                nombre,
                apellido,
                telefono: telefono || null,
                email: email || null,
                materia_id: parseInt(materia_id),
            },
        });
        return res.status(201).json(nuevoAlumno);
    } catch (error) {
        if (error.code === 'P2002') {
             return res.status(409).json({ error: "Ya existe un alumno con este DNI." });
        }
        if (error.code === 'P2003') {
            return res.status(400).json({ error: "El ID de la materia seleccionada no es válido." });
        }
        console.error("Error al crear alumno:", error);
        return res.status(500).json({ error: "Error interno al crear el alumno." });
    }
});

// PUT /api/gestion/alumnos/:id (ACTUALIZAR alumno) 🔄
r.put("/alumnos/:id", async (req, res) => {
    const alumnoId = parseInt(req.params.id);
    const { dni, nombre, apellido, telefono, email, materia_id } = req.body;
    
    if (!materia_id) {
        return res.status(400).json({ error: "Falta el ID de la materia." });
    }

    try {
        const alumnoActualizado = await prisma.alumnos.update({
            where: { id: alumnoId },
            data: {
                dni,
                nombre,
                apellido,
                telefono,
                email,
                materia_id: parseInt(materia_id),
            },
        });
        return res.json(alumnoActualizado);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "Alumno no encontrado para actualizar." });
        }
        if (error.code === 'P2003') {
            return res.status(400).json({ error: "El ID de la materia seleccionada no es válido." });
        }
        console.error("Error al actualizar alumno:", error);
        return res.status(500).json({ error: "Error interno al actualizar el alumno." });
    }
});

// DELETE /api/gestion/alumnos/:id (ELIMINAR alumno) 🗑️
r.delete("/alumnos/:id", async (req, res) => {
    const alumnoId = parseInt(req.params.id);

    try {
        await prisma.alumnos.delete({
            where: { id: alumnoId },
        });
        return res.status(204).send(); 
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "Alumno no encontrado para eliminar." });
        }
        console.error("Error al eliminar alumno:", error);
        return res.status(500).json({ error: "Error interno al eliminar el alumno." });
    }
});

// =============================================
// RUTAS DE COMUNICACIONES 📧
// =============================================

// GET /api/gestion/materias (Lista de Carreras/Materias para filtros) 📝
r.get("/materias", async (_req, res) => {
    try {
        const materias = await prisma.materias.findMany({
            select: { id: true, nombre: true } 
        });
        return res.json(materias);
    } catch (error) {
        console.error("Error al obtener materias:", error);
        return res.status(500).json({ error: "Error interno del servidor al cargar materias." });
    }
});

// GET /api/gestion/comisiones/letras (Lista de Comisiones para filtros) 🔠
r.get("/comisiones/letras", async (_req, res) => {
    try {
        // Selecciona todos los valores únicos de la columna 'letra' de las comisiones
        const letras = await prisma.comisiones.findMany({
            distinct: ['letra'],
            select: { letra: true },
            where: { letra: { not: null, not: "" } },
            orderBy: { letra: 'asc' }
        });
        
        // El frontend espera la opción "Todas" y luego la lista de letras
        const comisionesDisponibles = ['Todas', ...letras.map(c => c.letra)];
        return res.json(comisionesDisponibles);
    } catch (error) {
        console.error("Error al obtener letras de comisiones:", error);
        return res.status(500).json({ error: "Error interno al cargar comisiones." });
    }
});

// 💡 NUEVA RUTA: GET /api/gestion/alumnos/emails (Obtiene emails filtrados) 🔎📧
r.get("/alumnos/emails", async (req, res) => {
    const { carrera, comision } = req.query; // 'carrera' es el nombre de la materia

    try {
        // 1. Construir el filtro de alumnos (Misma lógica que en /comunicado)
        let whereQuery = {};
        
        // Filtro por Materia Principal
        if (carrera && carrera !== 'Todas') {
            whereQuery.materia_principal = {
                nombre: carrera 
            };
        }

        // Filtro por Letra de Comisión (a través de 'inscripciones')
        // NOTA: Si la relación directa existe en la tabla alumnos, usa 'comision_asociada: { letra: comision }'
        // Si no existe esa relación directa, la siguiente lógica de 'inscripciones' es correcta.
        if (comision && comision !== 'Todas') {
            whereQuery.inscripciones = {
                some: { 
                    comision: {
                        letra: comision
                    }
                }
            };
        }

        // 2. Obtener los emails de los alumnos que cumplen el filtro
        const alumnos = await prisma.alumnos.findMany({
            where: whereQuery, 
            select: {
                email: true,
            }
        });

        // 3. Extraer y limpiar la lista de emails
        const destinatarios = alumnos
            .map(a => a.email)
            .filter(email => email && email.includes('@')); 
        
        // 4. Devolver la lista de emails al frontend
        // El frontend espera un array de strings (emails)
        return res.status(200).json(destinatarios);

    } catch (error) {
        console.error("Error al obtener emails filtrados:", error);
        return res.status(500).json({ error: "Error interno del servidor al filtrar emails." });
    }
});


// POST /api/gestion/comunicado (Lógica de Envío de Email) 📨
r.post("/comunicado", async (req, res) => {
    const { carrera, comision, mensaje, titulo } = req.body; // 'carrera' es el nombre de la materia

    if (!mensaje || !titulo) {
        return res.status(400).json({ error: "Falta el título o el contenido del mensaje." });
    }

    try {
        // 1. Construir el filtro de alumnos
        let whereQuery = {};
        
        // Filtro por Materia Principal
        if (carrera && carrera !== 'Todas') {
            whereQuery.materia_principal = {
                nombre: carrera 
            };
        }

        // Filtro por Letra de Comisión (a través de 'inscripciones')
        if (comision && comision !== 'Todas') {
            whereQuery.inscripciones = {
                some: { 
                    comision: {
                        letra: comision
                    }
                }
            };
        }

        // 2. Obtener los emails de los alumnos
        const alumnos = await prisma.alumnos.findMany({
            where: whereQuery, 
            select: {
                email: true,
                nombre: true,
                apellido: true
            }
        });

        // 3. Extraer y limpiar la lista de emails
        const destinatarios = alumnos
            .map(a => a.email)
            .filter(email => email && email.includes('@')); 
        
        if (destinatarios.length === 0) {
            return res.status(404).json({ error: "No se encontraron destinatarios con los filtros seleccionados." });
        }

        // 4. Lógica de Envío de Email (SIMULACIÓN)
        console.log(`[EMAIL SIMULADO] Título: "${titulo}" | Enviando a ${destinatarios.length} destinatarios: ${destinatarios.join(', ')}`);
        
        // 🚨 IMPORTANTE: Aquí iría la integración real con Nodemailer o tu servicio de envío.
        
        return res.status(200).json({
            mensaje: `Comunicado enviado con éxito a ${destinatarios.length} alumnos.`,
            destinatarios: destinatarios.length,
            filtrosUsados: { carrera, comision }
        });

    } catch (error) {
        console.error("Error al enviar comunicado:", error);
        return res.status(500).json({ error: "Error interno al procesar el comunicado." });
    }
});


export default r;