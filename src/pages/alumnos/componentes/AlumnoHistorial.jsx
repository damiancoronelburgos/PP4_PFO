/*import React, { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";

export default function AlumnoHistorial({ setActive }) {
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    apiGet("/api/alumnos/historial")
      .then(setHistorial)
      .catch((err) => console.error("Error cargando historial:", err));
  }, []);

  return (
    <div className="historial-wrap">
      <div className="historial-card">
        <div className="historial-header">
          <h2 className="historial-title">Historial Académico</h2>
          <button className="btn" onClick={() => setActive(null)}>
            Volver
          </button>
        </div>

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
              {historial.map((h, i) => (
                <tr key={i}>
                  <td>{h.materia}</td>
                  <td>{h.comision}</td>
                  <td>{h.estado}</td>
                  <td>{h.notaFinal || "-"}</td>
                  <td>{h.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="historial-footer">
          <button className="btn btn-success" onClick={() => window.print()}>
            Descargar Certificado
          </button>
        </div>
      </div>
    </div>
  );
}
// src/pages/alumnos/componentes/AlumnoHistorial.jsx
*/
import React, { useEffect, useState } from "react";
import { apiGet } from "../../../lib/api";

export default function AlumnoHistorial({ setActive }) {
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    apiGet("/api/alumnos/historial")
      .then(setHistorial)
      .catch((err) => console.error("Error cargando historial:", err));
  }, []);

  return (
    <div className="historial-wrap">
      <div className="historial-card">

        {/* HEADER */}
        <div className="historial-header">
          <h2 className="historial-title">Historial Académico</h2>
          <button className="btn" onClick={() => setActive(null)}>
            Volver
          </button>
        </div>

        {/* TABLA */}
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
                    No hay registros en el historial.
                  </td>
                </tr>
              ) : (
                historial.map((h, i) => (
                  <tr key={i}>
                    <td>{h.materia}</td>
                    <td>{h.comision}</td>
                    <td>{h.estado}</td>
                    <td>{h.notaFinal || "-"}</td>
                    <td>{h.fecha}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="historial-footer">
         
        </div>

      </div>
    </div>
  );
}
