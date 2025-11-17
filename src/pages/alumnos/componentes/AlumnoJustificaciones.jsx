import React, { useEffect, useState } from "react";
import "../../../styles/alumnos.css";
import { fetchAlumnoJustificaciones } from "../../../lib/alumnos.api";

export default function AlumnoJustificaciones({ setActive }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchAlumnoJustificaciones();
        setItems(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las justificaciones.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="jus-wrap">
        <div className="jus-card">
          <h2 className="jus-title">Cargando…</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="jus-wrap">
      <div className="jus-card">

        <div className="jus-header">
          <h2 className="jus-title">Mis Justificaciones</h2>
          <button className="btn" onClick={() => setActive(null)}>Volver</button>
        </div>

        {error && <p style={{ color: "salmon" }}>{error}</p>}

        <div className="jus-table">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Comisión</th>
                <th>Archivo</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No hay justificaciones enviadas.
                  </td>
                </tr>
              ) : (
                items.map((j) => {
                  const fecha = new Date(j.fecha).toLocaleDateString("es-AR");

                  return (
                    <tr key={j.id}>
                      <td>{fecha}</td>
                      <td>{j.motivo}</td>

                      <td>
                        <span
                          className={`badge-state ${
                            j.estado === "pendiente"
                              ? "est-a"
                              : j.estado === "aprobada"
                              ? "est-p"
                              : "est-j"
                          }`}
                        >
                          {j.estado}
                        </span>
                      </td>

                      <td>{j.comision || "-"}</td>

                      <td>
                        {j.documentoUrl ? (
                          <a
                            href={j.documentoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Ver PDF
                          </a>
                        ) : (
                          <span style={{ opacity: 0.5 }}>—</span>
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
