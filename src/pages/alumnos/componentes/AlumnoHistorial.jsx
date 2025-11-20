// src/pages/alumnos/componentes/AlumnoHistorial.jsx
import React, { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";

// IMPORTAR IMÁGENES (import obligatorio para jsPDF)
const logo = "/Logo.png";
const firma = "/firma.png";
const sello = "/sello.png";


// jsPDF + Autotable
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AlumnoHistorial({ alumnoId }) {
  const [historial, setHistorial] = useState([]);
  const [alumno, setAlumno] = useState(null);

  // ==========================
  // CARGAR DATOS DEL ALUMNO
  // ==========================
  useEffect(() => {
    apiGet("/alumnos/me/datos").then((data) => setAlumno(data));
  }, []);

  // ==========================
  // CARGAR HISTORIAL
  // ==========================
  useEffect(() => {
    apiGet("/alumnos/historial")
      .then((data) => {
        console.log("Historial recibido:", data);
        setHistorial(data);
      })
      .catch((err) => console.error("Error cargando historial:", err));
  }, []);

  // ==========================
  // DESCARGAR PDF
  // ==========================
  const descargarPDF = () => {
    if (!alumno) return;

    const doc = new jsPDF("portrait", "pt", "a4");

    // Logo
    doc.addImage(logo, "PNG", 40, 30, 60, 60);

    // Título principal
    doc.setFontSize(20);
    doc.text("Instituto Superior Prisma", 120, 55);

    doc.setFontSize(14);
    doc.text("Certificado de Historial Académico", 120, 80);

    // Texto introductorio
    doc.setFontSize(11);
    const textoIntro =
      `El presente certificado acredita que la alumna/o ${alumno.nombre} ${alumno.apellido} ` +
      `ha cursado y/o aprobado las asignaturas detalladas a continuación, ` +
      `conforme a los registros académicos del Instituto Superior Prisma.`;

    doc.text(textoIntro, 40, 120, { maxWidth: 520 });

    // ==========================
    // TABLA
    // ==========================
    const tablaData = historial.map((h) => [
      h.materia,
      h.comision,
      h.notaFinal ?? "-",
      h.fecha ?? "-",
      h.estado ?? "-"
    ]);

    autoTable(doc, {
      startY: 160,
      head: [["Materia", "Comisión", "Nota Final", "Fecha", "Estado"]],
      body: tablaData,
      theme: "grid",
      headStyles: { fillColor: [15, 30, 80] },
    });

    // ==========================
    // FIRMA Y SELLO
    // ==========================
    const y = doc.lastAutoTable.finalY + 40;

    doc.setFontSize(12);
    doc.text("Firma:", 60, y);
    doc.addImage(firma, "PNG", 40, y + 10, 160, 60);

    doc.text("Sello:", 360, y);
    doc.addImage(sello, "PNG", 340, y + 10, 120, 120);

    doc.setFontSize(10);
    doc.text("Aclaración: Dirección Institucional", 60, y + 90);

    // Fecha de emisión
    const hoy = new Date().toLocaleDateString("es-AR");
    doc.text(`Emitido el: ${hoy}`, 360, y + 140);

    // DESCARGAR
    doc.save("historial-academico.pdf");
  };

  // ==========================
  // RENDER
  // ==========================
  return (
    <div className="historial-wrap">
      <div className="historial-card">

        {/* HEADER */}
        <div className="historial-header">
          <h2 className="historial-title">Historial Académico</h2>

          {/* BOTÓN DESCARGAR PDF */}
          <button className="btn-success" onClick={descargarPDF}>
             Descargar PDF
          </button>

        </div>

        {/* TABLA VISUAL */}
        <div className="historial-table-wrap">
          <table className="historial-table">
            <thead>
              <tr>
                <th>Materia</th>
                <th>Comisión</th>
                <th>Estado</th>
                <th>Nota Final</th>
                <th>Fecha</th>
              </tr>
            </thead>

            <tbody>
              {historial.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No hay registros aprobados.
                  </td>
                </tr>
              ) : (
                historial.map((h, i) => (
                  <tr key={i}>
                    <td>{h.materia}</td>
                    <td>{h.comision}</td>
                    <td>{h.estado}</td>
                    <td>{h.notaFinal ?? "-"}</td>
                    <td>{h.fecha ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
