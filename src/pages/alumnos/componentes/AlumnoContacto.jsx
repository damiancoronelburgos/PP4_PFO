import React, { useEffect, useState, useMemo } from "react";
import {
  fetchAlumnoDocentes,
  fetchInstituto
} from "../../../lib/alumnos.api";

export default function AlumnoContacto({ setActive }) {
  const [docentes, setDocentes] = useState([]);
  const [instituto, setInstituto] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);

  // ============================
  // CARGAR DATOS DEL INSTITUTO + DOCENTES
  // ============================
  useEffect(() => {
    async function cargarTodo() {
      try {
        const [instData, docentesData] = await Promise.all([
          fetchInstituto(),
          fetchAlumnoDocentes()
        ]);

        setInstituto(instData || null);
        setDocentes(docentesData || []);
      } catch (err) {
        console.error("Error cargando contacto:", err);
      } finally {
        setLoading(false);
      }
    }

    cargarTodo();
  }, []);

  // ============================
  // FILTRO
  // ============================
  const docentesFiltrados = useMemo(() => {
    const f = filtro.toLowerCase().trim();
    if (!f) return docentes;

    return docentes.filter((d) =>
      `${d.nombre} ${d.apellido}`.toLowerCase().includes(f) ||
      d.email?.toLowerCase().includes(f) ||
      d.telefono?.includes(f) ||
      d.materias?.some((m) => m.toLowerCase().includes(f))
    );
  }, [filtro, docentes]);

  // ============================
  // LOADING
  // ============================
  if (loading) {
    return (
      <div className="contacto-wrap">
        <div className="contacto-card">
          <h3 style={{ opacity: 0.7 }}>Cargando contactos...</h3>
        </div>
      </div>
    );
  }

  // ============================
  // RENDER
  // ============================
  return (
    <div className="contacto-wrap">

      <div className="contacto-card">

        {/* HEADER */}
        <div className="contacto-header">
          <h2 className="contacto-title">Contacto</h2>
        </div>

        {/* CAJA DE INSTITUTO */}
        <section className="contacto-box">
          <h3 className="contacto-sub">
            {instituto?.nombre || "Instituto Superior Prisma"}
          </h3>

          <ul className="contacto-list">
            {instituto?.direccion && (
              <li>📍 Dirección: {instituto.direccion}</li>
            )}

            {instituto?.telefono && (
              <li>📞 Teléfono: {instituto.telefono}</li>
            )}

            {instituto?.email_secretaria && (
              <li>
                ✉️ Secretaría:{" "}
                <a className="mail-link" href={`mailto:${instituto.email_secretaria}`}>
                  {instituto.email_secretaria}
                </a>
              </li>
            )}

            {instituto?.email_soporte && (
              <li>
                🛠 Soporte:{" "}
                <a className="mail-link" href={`mailto:${instituto.email_soporte}`}>
                  {instituto.email_soporte}
                </a>
              </li>
            )}

            {instituto?.sitio_web && (
              <li>
                🌐 Sitio Web:{" "}
                <a
                  href={instituto.sitio_web}
                  target="_blank"
                  rel="noreferrer"
                >
                  {instituto.sitio_web}
                </a>
              </li>
            )}

            {instituto?.horario && (
              <li>⏰ Horarios: {instituto.horario}</li>
            )}
          </ul>
        </section>

        {/* BUSCADOR */}
        <div className="contacto-search">
          <input
            className="notes-input"
            placeholder="Buscar por docente, materia, comisión o email..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>

        {/* TABLA DE DOCENTES */}
        <section className="contacto-box">
          <h3 className="contacto-sub">Docentes</h3>

          <div className="tabla-scroll">
            <table className="tabla-contacto">
              <thead>
                <tr>
                  <th>Docente</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                </tr>
              </thead>

              <tbody>
                {docentesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center", opacity: 0.6 }}>
                      No se encontraron docentes.
                    </td>
                  </tr>
                ) : (
                  docentesFiltrados.map((d) => (
                    <tr key={d.id}>
                      <td>{d.nombre} {d.apellido}</td>
                      <td>
                        <a className="mail-link" href={`mailto:${d.email}`}>
                          {d.email}
                        </a>
                      </td>
                      <td>{d.telefono || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
