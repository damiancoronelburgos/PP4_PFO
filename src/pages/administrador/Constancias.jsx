import React, { useState, useEffect } from 'react';
import "../../styles/Administrador.css";

// Librerías para PDF
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 

const TIPOS_CONSTANCIA = [
    "Seleccione un tipo...",
    "Título en trámite",
    "Materia aprobada",
    "Alumno regular",
    "Historial académico", 
];

const Constancias = () => {
    
    const [alumnos, setAlumnos] = useState([]);
    const [formData, setFormData] = useState({
        dni: '',
        tipoConstancia: TIPOS_CONSTANCIA[0],
    });
    const [alumnoEncontrado, setAlumnoEncontrado] = useState(null); 
    const [mensajeError, setMensajeError] = useState('');

    // 🚨 EFECTO PARA CARGAR ALUMNOS CON AUTENTICACIÓN
    useEffect(() => {
        const fetchAlumnos = async () => {
            
            // 1. OBTENER EL TOKEN DEL LOCAL STORAGE
            const token = localStorage.getItem("token"); 

            if (!token) {
                console.warn("Usuario no autenticado. La lista de alumnos no se cargará.");
                // Si no hay token, no hacemos la llamada API para evitar el 401
                return; 
            }

            try {
                // 2. ADJUNTAR EL TOKEN A LA PETICIÓN
                const res = await fetch("/api/alumnos", {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // ¡CLAVE: AUTORIZACIÓN!
                    }
                }); 

                if (res.status === 401) {
                    console.error("Sesión expirada o no autorizada. Limpie la sesión y redirija al login.");
                    // Aquí podrías forzar el logout si tuvieras la función global.
                    return;
                }
                
                const data = await res.json();
                setAlumnos(data);
                
            } catch (err) {
                console.error("Error cargando alumnos:", err);
            }
        };
        fetchAlumnos();
    }, []);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setMensajeError('');
    };

    const buscarAlumno = () => {
        if (!formData.dni || formData.dni.length < 5) {
            setMensajeError("Ingrese un DNI válido para buscar.");
            setAlumnoEncontrado(null);
            return;
        }

        const alumno = alumnos.find(a => a.dni === formData.dni);

        if (alumno) {
            setAlumnoEncontrado(alumno);
            setMensajeError('');
        } else {
            setAlumnoEncontrado(null);
            setMensajeError(`No se encontró un alumno con DNI: ${formData.dni}`);
        }
    };
    
    // 🚨 FUNCIÓN DE GENERACIÓN DE PDF: ASÍNCRONA y con llamada a la API
    const handleEmitir = async () => { 
        if (!alumnoEncontrado || formData.tipoConstancia === TIPOS_CONSTANCIA[0]) {
            alert("Verifique que haya un alumno y un tipo de constancia seleccionados.");
            return;
        }
        
        const doc = new jsPDF();
        const tipo = formData.tipoConstancia;
        const nombreAlumno = `${alumnoEncontrado.nombre} ${alumnoEncontrado.apellido}`;

        // 📁 Recursos (Deben estar en la carpeta public)
        const logo = "/Logo.png"; 
        const firma = "/firma.png"; 
        const sello = "/sello.png"; 
        const fechaActual = new Date().toLocaleDateString("es-AR");

        // --- ENCABEZADO ESTÁNDAR ---
        doc.addImage(logo, "PNG", 12, 8, 18, 18);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("Instituto Superior Prisma", 35, 16);
        doc.setFontSize(13);
        doc.text(`Certificado de ${tipo}`, 35, 24);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        
        // --- CONTENIDO GENERAL (Común o Historial) ---
        let contentStart = 40;
        let filename = `${alumnoEncontrado.apellido}_${tipo.replace(/\s/g, '_')}.pdf`;
        let historialData = []; // Variable para almacenar el historial real

        if (tipo === "Historial académico") {
            
            // 🚨 LLAMADA A LA API ASÍNCRONA para obtener datos reales
            try {
                // Utilizamos el ID del alumno para la consulta en el backend
                const res = await fetch(`/api/constancias/historial/${alumnoEncontrado.id}`);
                
                if (!res.ok) {
                     // Lanzar error si la respuesta HTTP no es 200-299
                     throw new Error(`Error ${res.status}: No se pudo obtener el historial académico.`);
                }
                historialData = await res.json();
                
                if (historialData.length === 0) {
                     alert("El alumno no tiene registros académicos (inscripciones) para mostrar.");
                     return;
                }
                
            } catch (error) {
                console.error("Error al obtener historial:", error);
                alert(`Error al cargar el historial: ${error.message}.`);
                return; // Detener la generación del PDF si falla la API
            }
            
            // --- TEXTO INTRODUCTORIO HISTORIAL ---
            const textoHistorial = `El presente certificado acredita que el/la alumna/o ${nombreAlumno} ha cursado y/o aprobado las asignaturas detalladas a continuación, conforme a los registros académicos del Instituto Superior Prisma.`;
            doc.text(
                textoHistorial,
                15,
                contentStart,
                { maxWidth: 180 }
            );
            contentStart += 10;
            
            // --- TABLA DE DATOS CON autoTable ---
            autoTable(doc, {
                head: [["Materia", "Comisión", "Nota Final", "Fecha Insc.", "Estado"]],
                body: historialData, // 👈 DATOS REALES DE LA API
                startY: contentStart + 5,
                theme: "grid",
                headStyles: { fillColor: [40, 40, 90], textColor: 255, fontStyle: "bold" },
                styles: { halign: "center", valign: "middle" },
            });
            
            contentStart = doc.lastAutoTable.finalY + 15;
            filename = `Historial_${alumnoEncontrado.apellido}.pdf`;
            
        } else {
            // --- OTROS TIPOS DE CONSTANCIA ---
            const textoCertificado = `El presente certificado acredita que el/la alumno/a ${nombreAlumno}, identificado/a con DNI N° ${alumnoEncontrado.dni}, es ${tipo.toLowerCase()} de la carrera ${alumnoEncontrado.curso || 'No especificado'}.`;
            
            doc.text(
                textoCertificado,
                15,
                contentStart,
                { maxWidth: 180 }
            );
            contentStart += 20; 
        }

        // --- PIE DE PÁGINA (Firma y Sello) ---
        let baseY = contentStart + 15;
        
        // Ajustar la posición vertical si se usó autoTable
        if (tipo === "Historial académico" && doc.lastAutoTable) {
              baseY = doc.lastAutoTable.finalY + 25;
        }

        doc.setFont("helvetica", "bold");
        doc.text("Firma:", 35, baseY);
        doc.text("Sello:", 145, baseY);

        // Imágenes debajo de los títulos
        doc.addImage(firma, "PNG", 20, baseY + 3, 60, 25);
        doc.addImage(sello, "PNG", 145, baseY + 3, 35, 35);

        // Textos aclaratorios
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text("Aclaración: Dirección Institucional", 25, baseY + 38);
        doc.text(`Emitido el: ${fechaActual}`, 150, baseY + 38);

        // Guardar PDF
        doc.save(filename);

        // Resetear formulario
        setFormData({ dni: '', tipoConstancia: TIPOS_CONSTANCIA[0] });
        setAlumnoEncontrado(null);
    };

    
    return (
        <main className="contenido-gestion">
            
            <header className="cabecera-instituto">
                <div className="logo-instituto"></div>
                <h1 className="nombre-instituto">Instituto Superior Prisma</h1>
            </header>

            <h2 className="titulo-gestion">Emitir Constancias</h2>
            
            <div className="panel-emision-constancia">
                
                <div className="formulario-emision">
                    
                    {/* Campo DNI con botón de BÚSQUEDA */}
                    <div className="campo-completo dni-search-container">
                        <label htmlFor="dni-alumno" className="label-form">DNI (alumno):</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                type="text" 
                                id="dni-alumno" 
                                name="dni"
                                className="input-form" 
                                value={formData.dni}
                                onChange={handleInputChange}
                                style={{ flexGrow: 1 }}
                            />
                            <button className="boton-buscar" onClick={buscarAlumno}>
                                Buscar
                            </button>
                        </div>
                        {mensajeError && <p style={{ color: 'red', marginTop: '5px' }}>{mensajeError}</p>}
                    </div>

                    {/* Fila 1: Nombre y Apellido (AUTORRELLENADOS) */}
                    <div className="campos-fila">
                        <div>
                            <label htmlFor="nombre-alumno" className="label-form">Nombre:</label>
                            <input 
                                type="text" 
                                id="nombre-alumno" 
                                className="input-form medio" 
                                value={alumnoEncontrado ? alumnoEncontrado.nombre : ''}
                                disabled
                            />
                        </div>
                        <div>
                            <label htmlFor="apellido-alumno" className="label-form">Apellido:</label>
                            <input 
                                type="text" 
                                id="apellido-alumno" 
                                className="input-form medio" 
                                value={alumnoEncontrado ? alumnoEncontrado.apellido : ''}
                                disabled
                            />
                        </div>
                    </div>

                    {/* Fila 2: Carrera y Comisión (AUTORRELLENADOS) */}
                    <div className="campos-fila">
                        <div>
                            <label htmlFor="carrera-alumno" className="label-form">Carrera/Curso:</label>
                            <input 
                                type="text" 
                                id="carrera-alumno" 
                                className="input-form medio" 
                                value={alumnoEncontrado ? alumnoEncontrado.curso : ''} 
                                disabled
                            />
                        </div>
                        <div>
                            <label htmlFor="comision-alumno" className="label-form">Comisión:</label>
                            <input 
                                type="text" 
                                id="comision-alumno" 
                                className="input-form medio" 
                                value={alumnoEncontrado ? 'A' : ''} 
                                disabled
                            />
                        </div>
                    </div>
                    
                    {/* Campo Tipo (SELECTOR DESPLEGABLE) */}
                    <div className="campo-completo tipo-field">
                        <label htmlFor="tipo-constancia" className="label-form">Tipo:</label>
                        <select
                            id="tipo-constancia" 
                            name="tipoConstancia"
                            className="input-form" 
                            value={formData.tipoConstancia}
                            onChange={handleInputChange}
                        >
                            {TIPOS_CONSTANCIA.map(tipo => (
                                <option key={tipo} value={tipo}>{tipo}</option>
                            ))}
                        </select>
                    </div>

                    {/* Bloque de Resumen y Botón */}
                    <div className="bloque-resumen">
                        <div className="datos-resumen">
                            <p><strong>Alumno:</strong> {alumnoEncontrado ? `${alumnoEncontrado.nombre} ${alumnoEncontrado.apellido}` : '---'}</p>
                            <p><strong>Curso:</strong> {alumnoEncontrado ? alumnoEncontrado.curso : '---'}</p>
                            <p><strong>DNI:</strong> {alumnoEncontrado ? alumnoEncontrado.dni : '---'}</p>
                            <p><strong>Constancia:</strong> {formData.tipoConstancia !== TIPOS_CONSTANCIA[0] ? formData.tipoConstancia : '---'}</p>
                        </div>
                        <button 
                            className="boton-emitir"
                            onClick={handleEmitir}
                            disabled={!alumnoEncontrado || formData.tipoConstancia === TIPOS_CONSTANCIA[0]}
                        >
                            Emitir comprobante (PDF)
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Constancias;