import React, { useEffect, useState } from "react";
import "../../../styles/alumnos.css";
import { apiFetch } from "../../../lib/api";

export default function AlumnoCalendario({ setActive }) {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // ============================
  // Cargar eventos del backend
  // ============================
  async function cargarEventos() {
    try {
      setLoading(true);

      const data = await apiFetch("/api/alumnos/calendario");
      setEventos(data || []);

    } catch (err) {
      console.error(err);
      setMsg("Error al cargar el calendario académico.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarEventos();
  }, []);

  if (loading) {
    return (
      <div className="panel-wrap">
        <h2>Cargando calendario académico...</h2>
      </div>
    );
  }

  return (
    <div className="panel-wrap">
      <h2 className="profile-title">Calendario Académico</h2>

      <div className="panel-list">
        {eventos.length === 0 ? (
          <p>No hay eventos académicos registrados.</p>
        ) : (
          eventos
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
            .map((ev, i) => (
              <div key={i} className="panel-item">
                <div className="item-header">
                  <h3>{ev.titulo}</h3>
                  {ev.comision && (
                    <span className="badge">Comisión {ev.comision}</span>
                  )}
                </div>

                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(ev.fecha).toLocaleDateString("es-AR")}
                </p>

                {ev.materia && (
                  <p>
                    <strong>Materia:</strong> {ev.materia}
                  </p>
                )}

                {ev.descripcion && (
                  <p>
                    <strong>Descripción:</strong> {ev.descripcion}
                  </p>
                )}
              </div>
            ))
        )}
      </div>

      <button className="btn" onClick={() => setActive(null)}>
        Volver
      </button>

      {msg && <p className="msg">{msg}</p>}
    </div>
  );
}
