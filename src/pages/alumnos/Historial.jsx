// src/components/alumnos/Historial.jsx
import React from 'react';

export default function Historial({
  setActive,
  historial = [],
  generarPDF
}) {
  return (
    <div className="historial-wrap">
      <div className="historial-card">

        {/* Header */}
        <div className="historial-header">
          <h2 className="historial-title">Historial Académico</h2>
          <div className="historial-actions">
            <button className="btn btn-pdf" onClick={generarPDF}>
              Descargar Certificado (PDF)
            </button>
            <button className="btn" onClick={() => setActive(null)}>
              Volver
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="tabla-scroll">
          <table className="tabla-historial">
            <thead>
              <tr>
                <th>Materia</th>
                <th>Comisión</th>
                <th>Nota Final</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {historial.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No hay registros en el historial.
                  </td>
                </tr>
              ) : (
                historial.map((h, i) => (
                  <tr key={h.id || i}>
                    <td>{h.materia}</td>
                    <td>{h.comision}</td>
                    <td>{h.nota ?? "—"}</td>
                    <td>{h.fecha}</td>
                    <td>{h.estado}</td>
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
