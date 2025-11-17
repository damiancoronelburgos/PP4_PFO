import React, { useEffect, useState } from "react";
import "../../../styles/alumnos.css";
import {
  fetchAlumnoAsistencias,
} from "../../../lib/alumnos.api";

export default function AlumnoAsistencias({ setActive }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==============================
  // CARGAR ASISTENCIAS
  // ==============================
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchAlumnoAsistencias();
        setItems(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las asistencias.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="asis-wrap">
        <div className="asis-card">
          <h2 className="asis-title">Cargando asistencias...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="asis-wrap">
        <div className="asis-card">
          <h2 className="asis-title">Asistencias</h2>
          <p style={{ color: "salmon" }}>{error}</p>
          <button className="btn" onClick={() => setActive(null)}>Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="asis-wrap">
      <div className="asis-card">

        {/* HEADER */}
        <div className="asis-header">
          <h2 className="asis-title">Asistencias</h2>

          <button className="btn" onClick={() => setActive(null)}>
            Volver
          </button>
        </div>

        {/* RESUMEN */}
        <div className="asis-summary">
          <strong>Total registros:</strong> {items.length}
        </div>

        {/* TABLA */}
        <div className="asis-table">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Materia</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No hay asistencias registradas.
                  </td>
                </tr>
              ) : (
                items.map((a) => {
                  const fecha = new Date(a.fecha).toLocaleDateString("es-AR");

                  // badge de estado
                  let badgeClass = "";
                  if (a.estado === "P") badgeClass = "est-p";
                  else if (a.estado === "A") badgeClass = "est-a";
                  else if (a.estado === "T") badgeClass = "est-t";
                  else if (a.estado === "J") badgeClass = "est-j";

                  return (
                    <tr key={a.id}>
                      <td>{fecha}</td>
                      <td>{a.materia}</td>

                      <td>
                        <span className={`badge-state ${badgeClass}`}>
                          {a.estado === "P" && "Presente"}
                          {a.estado === "A" && "Ausente"}
                          {a.estado === "T" && "Tardanza"}
                          {a.estado === "J" && "Justificado"}
                        </span>
                      </td>

                      <td>
                        {a.estado === "A" ? (
                          <button
                            className="btn-justificar"
                            onClick={() =>
                              setActive({ view: "justificar", asistencia: a })
                            }
                          >
                            Justificar
                          </button>
                        ) : (
                          <span style={{ opacity: 0.3 }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
