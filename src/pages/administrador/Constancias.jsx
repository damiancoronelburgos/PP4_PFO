import React, { useState, useEffect } from "react";
import "../../styles/Administrador.css";

// Librerías para PDF
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { apiGet } from "../../lib/api";

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
    dni: "",
    tipoConstancia: TIPOS_CONSTANCIA[0],
  });
  const [alumnoEncontrado, setAlumnoEncontrado] = useState(null);
  const [mensajeError, setMensajeError] = useState("");

  // Cargar alumnos usando apiGet (usa token y base URL unificada)
  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        // La API /alumnos debe devolver ahora nombre_materia y nombre_comision
        const data = await apiGet("/alumnos"); // GET /api/alumnos
        setAlumnos(data);
      } catch (err) {
        console.error("Error cargando alumnos:", err);
        setMensajeError("No se pudo cargar la lista de alumnos.");
      }
    };
    fetchAlumnos();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMensajeError("");
  };

  const buscarAlumno = () => {
    if (!formData.dni || formData.dni.length < 5) {
      setMensajeError("Ingrese un DNI válido para buscar.");
      setAlumnoEncontrado(null);
      return;
    }

    const alumno = alumnos.find((a) => a.dni === formData.dni);

    if (alumno) {
      setAlumnoEncontrado(alumno);
      setMensajeError("");
    } else {
      setAlumnoEncontrado(null);
      setMensajeError(`No se encontró un alumno con DNI: ${formData.dni}`);
    }
  };

  // Generación de PDF (incluye llamada a la API para historial)
  const handleEmitir = async () => {
    if (!alumnoEncontrado || formData.tipoConstancia === TIPOS_CONSTANCIA[0]) {
      alert(
        "Verifique que haya un alumno y un tipo de constancia seleccionados."
      );
      return;
    }

    const doc = new jsPDF();
    const tipo = formData.tipoConstancia;
    const nombreAlumno = `${alumnoEncontrado.nombre} ${alumnoEncontrado.apellido}`;
    // Datos de materia y comisión (ya disponibles en alumnoEncontrado)
    const nombreMateria = alumnoEncontrado.nombre_materia;
    const nombreComision = alumnoEncontrado.nombre_comision;

    const logo = "/Logo.png";
    const firma = "/firma.png";
    const sello = "/sello.png";
    const fechaActual = new Date().toLocaleDateString("es-AR");

    // Encabezado
    doc.addImage(logo, "PNG", 12, 8, 18, 18);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Instituto Superior Prisma", 35, 16);
    doc.setFontSize(13);
    doc.text(`Certificado de ${tipo}`, 35, 24);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    let contentStart = 40;
    let filename = `${alumnoEncontrado.apellido}_${tipo.replace(
      /\s/g,
      "_"
    )}.pdf`;

    if (tipo === "Historial académico") {
      // Historial académico: se trae de la API
      let historialData = [];
      try {
        // Asegúrate que esta ruta exista y devuelva la información del historial
        historialData = await apiGet(
          `/constancias/historial/${alumnoEncontrado.id}`
        );
        if (!Array.isArray(historialData) || historialData.length === 0) {
          alert(
            "El alumno no tiene registros académicos (inscripciones) para mostrar."
          );
          return;
        }
      } catch (error) {
        console.error("Error al obtener historial:", error);
        alert(`Error al cargar el historial: ${error.message}.`);
        return;
      }

      const textoHistorial = `El presente certificado acredita que el/la alumna/o ${nombreAlumno} (DNI N° ${alumnoEncontrado.dni}), cursante de la carrera ${nombreMateria} de la comisión ${nombreComision}, ha cursado y/o aprobado las asignaturas detalladas a continuación, conforme a los registros académicos del Instituto Superior Prisma.`;
      
      // Ajuste de posición y texto
      doc.text(textoHistorial, 15, contentStart, { maxWidth: 180 });
      contentStart += 15;

      autoTable(doc, {
        head: [["Materia", "Comisión", "Nota Final", "Fecha Insc.", "Estado"]],
        body: historialData, // Se espera que historialData sea el array de arrays o de objetos para autoTable
        startY: contentStart + 5,
        theme: "grid",
        headStyles: {
          fillColor: [40, 40, 90],
          textColor: 255,
          fontStyle: "bold",
        },
        styles: { halign: "center", valign: "middle" },
      });

      contentStart = doc.lastAutoTable.finalY + 15;
      filename = `Historial_${alumnoEncontrado.apellido}.pdf`;
    } else {
      // Otros tipos de constancia
      // CORREGIDO: Usar los nuevos campos de materia y comisión en el texto del certificado
      const cursoTexto = `de la carrera/curso ${nombreMateria}, comisión ${nombreComision}`;
      const textoCertificado = `El presente certificado acredita que el/la alumno/a ${nombreAlumno}, identificado/a con DNI N° ${alumnoEncontrado.dni}, es ${tipo.toLowerCase()} ${cursoTexto}.`;

      doc.text(textoCertificado, 15, contentStart, { maxWidth: 180 });
      contentStart += 20;
    }

    // Pie de página (firma y sello)
    let baseY = contentStart + 15;
    if (tipo === "Historial académico" && doc.lastAutoTable) {
      baseY = doc.lastAutoTable.finalY + 25;
    }

    doc.setFont("helvetica", "bold");
    doc.text("Firma:", 35, baseY);
    doc.text("Sello:", 145, baseY);

    doc.addImage(firma, "PNG", 20, baseY + 3, 60, 25);
    doc.addImage(sello, "PNG", 145, baseY + 3, 35, 35);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Aclaración: Dirección Institucional", 25, baseY + 38);
    doc.text(`Emitido el: ${fechaActual}`, 150, baseY + 38);

    doc.save(filename);

    setFormData({ dni: "", tipoConstancia: TIPOS_CONSTANCIA[0] });
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
          {/* DNI + búsqueda */}
          <div className="campo-completo dni-search-container">
            <label htmlFor="dni-alumno" className="label-form">
              DNI (alumno):
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
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
            {mensajeError && (
              <p style={{ color: "red", marginTop: "5px" }}>{mensajeError}</p>
            )}
          </div>

          {/* Nombre y apellido (autorrellenados) */}
          <div className="campos-fila">
            <div>
              <label htmlFor="nombre-alumno" className="label-form">
                Nombre:
              </label>
              <input
                type="text"
                id="nombre-alumno"
                className="input-form medio"
                value={alumnoEncontrado?.nombre ?? ""}
                disabled
              />
            </div>
            <div>
              <label htmlFor="apellido-alumno" className="label-form">
                Apellido:
              </label>
              <input
                type="text"
                id="apellido-alumno"
                className="input-form medio"
                value={alumnoEncontrado?.apellido ?? ""}
                disabled
              />
            </div>
          </div>

          {/* Carrera y comisión (CORREGIDO en la interfaz) */}
          <div className="campos-fila">
            <div>
              <label htmlFor="carrera-alumno" className="label-form">
                Carrera/Curso:
              </label>
              <input
                type="text"
                id="carrera-alumno"
                className="input-form medio"
                // Muestra el nombre de la materia (curso)
                value={alumnoEncontrado?.nombre_materia ?? ""}
                disabled
              />
            </div>
            <div>
              <label htmlFor="comision-alumno" className="label-form">
                Comisión:
              </label>
              <input
                type="text"
                id="comision-alumno"
                className="input-form medio"
                // Muestra el nombre/letra de la comisión
                value={alumnoEncontrado?.nombre_comision ?? ""}
                disabled
              />
            </div>
          </div>

          {/* Tipo de constancia */}
          <div className="campo-completo tipo-field">
            <label htmlFor="tipo-constancia" className="label-form">
              Tipo:
            </label>
            <select
              id="tipo-constancia"
              name="tipoConstancia"
              className="input-form"
              value={formData.tipoConstancia}
              onChange={handleInputChange}
            >
              {TIPOS_CONSTANCIA.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          {/* Resumen + botón emitir (CORREGIDO en el resumen) */}
          <div className="bloque-resumen">
            <div className="datos-resumen">
              <p>
                <strong>Alumno:</strong>{" "}
                {alumnoEncontrado
                  ? `${alumnoEncontrado.nombre} ${alumnoEncontrado.apellido}`
                  : "---"}
              </p>
              <p>
                {/* Ahora muestra el nombre de la materia */}
                <strong>Curso:</strong>{" "}
                {alumnoEncontrado ? alumnoEncontrado.nombre_materia : "---"}
              </p>
              <p>
                {/* Ahora muestra el nombre de la comisión */}
                <strong>Comisión:</strong>{" "}
                {alumnoEncontrado ? alumnoEncontrado.nombre_comision : "---"}
              </p>
              <p>
                <strong>DNI:</strong>{" "}
                {alumnoEncontrado ? alumnoEncontrado.dni : "---"}
              </p>
              <p>
                <strong>Constancia:</strong>{" "}
                {formData.tipoConstancia !== TIPOS_CONSTANCIA[0]
                  ? formData.tipoConstancia
                  : "---"}
              </p>
            </div>
            <button
              className="boton-emitir"
              onClick={handleEmitir}
              disabled={
                !alumnoEncontrado ||
                formData.tipoConstancia === TIPOS_CONSTANCIA[0]
              }
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