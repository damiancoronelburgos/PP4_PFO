import React, { useState, useEffect } from 'react';
import "../../styles/Administrador.css";

// 🚨 Librerías para PDF (Alternativa a html2pdf)
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Asegúrate de que esta línea esté, aunque no se use directamente

// Datos mock
import ALUMNOS_DATA from "../../data/alumnos.json"; 
// Necesitarás una fuente de historial/calificaciones similar a la de tu compañera
// Como no la tenemos aquí, usaremos un historial simulado dentro de la función

const TIPOS_CONSTANCIA = [
    "Seleccione un tipo...",
    "Título en trámite",
    "Materia aprobada",
    "Alumno regular",
    "Historial académico", // 👈 Nos enfocaremos en esta
];

const Constancias = () => {
    // La referencia (constanciaRef) y el estado de visibilidad (esVisibleParaPDF)
    // ya NO son necesarios con jsPDF, ya que construimos el PDF en memoria.
    
    const [alumnos, setAlumnos] = useState([]);
    const [formData, setFormData] = useState({
        dni: '',
        tipoConstancia: TIPOS_CONSTANCIA[0],
    });
    const [alumnoEncontrado, setAlumnoEncontrado] = useState(null);
    const [mensajeError, setMensajeError] = useState('');

    useEffect(() => {
        setAlumnos(ALUMNOS_DATA);
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
    
    // 🚨 FUNCIÓN DE GENERACIÓN DE PDF REESCRITA CON jsPDF
    const handleEmitir = () => {
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
        
        // --- CONTENIDO GENERAL (Para Título, Materia Aprobada, Regular) ---
        let contentStart = 40;
        let filename = `${alumnoEncontrado.apellido}_${tipo.replace(/\s/g, '_')}.pdf`;
        
        if (tipo !== "Historial académico") {
            const textoCertificado = `El presente certificado acredita que el/la alumno/a ${nombreAlumno}, identificado/a con DNI N° ${alumnoEncontrado.dni}, es ${tipo.toLowerCase()} de la carrera ${alumnoEncontrado.curso || 'No especificado'}.`;
            
            doc.text(
                textoCertificado,
                15,
                contentStart,
                { maxWidth: 180 }
            );
            contentStart += 20; // Dejar espacio para el texto

        } else {
            // --- CONTENIDO ESPECÍFICO PARA HISTORIAL ACADÉMICO (Usando autoTable) ---
            const textoHistorial = `El presente certificado acredita que el/la alumna/o ${nombreAlumno} ha cursado y/o aprobado las asignaturas detalladas a continuación, conforme a los registros académicos del Instituto Superior Prisma.`;
            doc.text(
                textoHistorial,
                15,
                contentStart,
                { maxWidth: 180 }
            );
            contentStart += 10;
            
            // 🚨 SIMULACIÓN DE DATOS DE HISTORIAL (Reemplazar con datos reales)
            const historialSimulado = [
                ["Programación I", "A", "8.5", "07/2023", "Aprobado"],
                ["Base de Datos", "B", "7.0", "12/2023", "Aprobado"],
                ["Inglés Técnico", "A", "--", "07/2024", "En curso"],
            ];
            
            autoTable(doc, {
                head: [["Materia", "Comisión", "Nota Final", "Fecha", "Estado"]],
                body: historialSimulado,
                startY: contentStart + 5,
                theme: "grid",
                headStyles: { fillColor: [40, 40, 90], textColor: 255, fontStyle: "bold" },
                styles: { halign: "center", valign: "middle" },
            });
            contentStart = doc.lastAutoTable.finalY + 15;
            filename = `Historial_${alumnoEncontrado.apellido}.pdf`;
        }

        // --- PIE DE PÁGINA (Firma y Sello) ---
        let baseY = contentStart + 15;
        
        // Si el historial fue muy largo, la tabla ajustará baseY automáticamente.
        if (tipo === "Historial académico") {
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

    // La función handleEmitir está ahora en el render para ser llamada
    
    // ... (El resto del return es igual a la versión anterior, pero sin el div oculto) ...

    return (
        <main className="contenido-gestion">
            
            {/* 🚨 Eliminamos el div de la constancia (constanciaRef) */}
            
            {/* Contenido Visible de la Interfaz */}
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