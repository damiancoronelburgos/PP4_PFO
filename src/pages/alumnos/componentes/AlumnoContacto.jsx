import React, { useEffect, useState } from "react";
import "../../../styles/alumnos.css";
import { apiFetch } from "../../../lib/api";

export default function AlumnoContacto({ setActive }) {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // ================================
  // Cargar datos de contacto
  // ================================
  async function cargarContacto() {
    try {
      setLoading(true);
      const data = await apiFetch("/api/alumnos/contacto");
      setDatos(data || {});
    } catch (err) {
      console.error(err);
      setMsg("Error al cargar información de contacto.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarContacto();
  }, []);

  if (loading) {
    return (
      <div className="panel-wrap">
        <h2>Cargando información de contacto...</h2>
      </div>
    );
  }

  if (!datos) {
    return (
      <div className="panel-wrap">
        <h2>No se pudo cargar la información.</h2>
      </div>
    );
  }

  const instit = datos.instituto;
  const docentes = datos.docentes || [];

  return (
    <div className="panel-wrap">

      {/* =============================
            INFORMACIÓN DEL INSTITUTO
      ============================== */}
      <h2 className="profile-title">Contacto del Instituto</h2>

      <div className="panel-item">
        <h3>{instit.nombre}</h3>
        <p><strong>Dirección:</strong> {instit.direccion}</p>
        <p><strong>Teléfono:</strong> {instit.telefono}</p>
        <p><strong>Email:</strong> {instit.email}</p>

        {instit.web && (
          <p>
            <strong>Sitio web:</strong>{" "}
            <a className="link" href={instit.web} target="_blank">
              {instit.web}
            </a>
          </p>
        )}
      </div>

      {/* =============================
            DOCENTES
      ============================== */}
      <h3 className="section-title">Docentes</h3>

      <div className="panel-list">
        {docentes.length === 0 ? (
          <p>No hay docentes registrados.</p>
        ) : (
          docentes.map((d) => (
            <div key={d.id} className="panel-item">
              <div className="item-header">
                <h3>{d.nombre}</h3>
                <span className="badge">{d.materias.length} materias</span>
              </div>

              <p>
                <strong>Email:</strong>{" "}
                <a className="link" href={`mailto:${d.email}`}>
                  {d.email}
                </a>
              </p>

              <p>
                <strong>Teléfono:</strong> {d.telefono || "No registrado"}
              </p>

              <p>
                <strong>Materias:</strong> {d.materias.join(", ")}
              </p>
            </div>
          ))
        )}
      </div>

      {/* VOLVER */}
      <button className="btn" onClick={() => setActive(null)}>
        Volver
      </button>

      {msg && <p className="msg">{msg}</p>}
    </div>
  );
}
